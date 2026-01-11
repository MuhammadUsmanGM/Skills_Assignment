#!/bin/bash
# Script to deploy application with blue-green deployment strategy

set -e

ENVIRONMENT=${1:-staging}
APP_NAME=${2:-my-app}
IMAGE_TAG=${3:-latest}

echo "Starting deployment for application: $APP_NAME"
echo "Environment: $ENVIRONMENT"
echo "Image tag: $IMAGE_TAG"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo "Error: Invalid environment. Use dev, staging, or prod."
    exit 1
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is required but not installed."
    exit 1
fi

NAMESPACE="$ENVIRONMENT-$APP_NAME"
GREEN_DEPLOYMENT="${APP_NAME}-green"
BLUE_DEPLOYMENT="${APP_NAME}-blue"

echo "Using namespace: $NAMESPACE"

# Create namespace if it doesn't exist
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Determine current and target deployments
CURRENT_COLOR=$(kubectl get svc "$APP_NAME-service" -n "$NAMESPACE" -o jsonpath='{.spec.selector.deployment-color}' 2>/dev/null || echo "blue")
TARGET_COLOR=""

if [ "$CURRENT_COLOR" = "blue" ]; then
    TARGET_COLOR="green"
    TARGET_DEPLOYMENT="$GREEN_DEPLOYMENT"
    CURRENT_DEPLOYMENT="$BLUE_DEPLOYMENT"
else
    TARGET_COLOR="blue"
    TARGET_DEPLOYMENT="$BLUE_DEPLOYMENT"
    CURRENT_DEPLOYMENT="$GREEN_DEPLOYMENT"
fi

echo "Current color: $CURRENT_COLOR"
echo "Target color: $TARGET_COLOR"

# Deploy to target color
echo "Deploying to $TARGET_COLOR environment..."

cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $TARGET_DEPLOYMENT
  namespace: $NAMESPACE
spec:
  replicas: 3
  selector:
    matchLabels:
      app: $APP_NAME
      deployment-color: $TARGET_COLOR
  template:
    metadata:
      labels:
        app: $APP_NAME
        deployment-color: $TARGET_COLOR
    spec:
      containers:
      - name: $APP_NAME
        image: $APP_NAME:$IMAGE_TAG
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME-service
  namespace: $NAMESPACE
spec:
  selector:
    app: $APP_NAME
    deployment-color: $TARGET_COLOR
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
EOF

echo "Waiting for new deployment to be ready..."
kubectl rollout status deployment/$TARGET_DEPLOYMENT -n "$NAMESPACE" --timeout=300s

echo "Verifying health of new deployment..."
kubectl get pods -l app=$APP_NAME,deployment-color=$TARGET_COLOR -n "$NAMESPACE"

echo "Deployment to $TARGET_COLOR successful!"

# Optional: Scale down old deployment after verification
read -p "Scale down old deployment ($CURRENT_COLOR)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Scaling down old deployment: $CURRENT_DEPLOYMENT"
    kubectl scale deployment $CURRENT_DEPLOYMENT --replicas=0 -n "$NAMESPACE"
    echo "Old deployment scaled down."
fi

echo "Deployment completed successfully!"