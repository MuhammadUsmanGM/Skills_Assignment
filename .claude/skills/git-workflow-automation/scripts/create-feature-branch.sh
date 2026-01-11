#!/bin/bash
# Script to create a feature branch with proper naming convention

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <feature-description>"
    echo "Example: $0 user-authentication"
    exit 1
fi

FEATURE_DESC=$1
BRANCH_NAME="feature/$FEATURE_DESC"
CURRENT_BRANCH=$(git branch --show-current)

echo "Creating feature branch: $BRANCH_NAME"
echo "Current branch: $CURRENT_BRANCH"

# Sync with main first
echo "Syncing with main branch..."
git checkout main
git pull origin main

# Create and switch to feature branch
git checkout -b "$BRANCH_NAME"

echo "Successfully created and switched to branch: $BRANCH_NAME"
echo "Branch created from commit: $(git rev-parse HEAD)"