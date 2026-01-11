# Infrastructure as Code (IaC) Guidelines

## IaC Principles

### Declarative vs Imperative
- **Declarative**: Define the desired end state
  - Terraform, CloudFormation, ARM templates
  - System figures out how to reach the state
  - More predictable and consistent

- **Imperative**: Define step-by-step instructions
  - Scripts, configuration management tools
  - Explicit instructions for changes
  - More flexible but harder to maintain

### Idempotency
- Running the same configuration multiple times yields the same result
- Safe to apply configurations repeatedly
- Essential for automated deployments
- Prevents configuration drift

### Version Control
- Store IaC in version control systems
- Track changes to infrastructure
- Enable collaboration and peer review
- Facilitate rollback and audit trails

## Popular IaC Tools

### Terraform
- Multi-cloud support
- Declarative configuration
- State management
- Extensive provider ecosystem

### AWS CloudFormation
- Native AWS integration
- JSON/YAML templates
- Stack-based management
- Change sets for preview

### Azure Resource Manager (ARM)
- Native Azure integration
- JSON templates
- Role-based access control
- Policy compliance

### Kubernetes Manifests
- Container orchestration focus
- YAML configuration
- Declarative resource management
- Built-in health management

## Best Practices

### Security
- Never hardcode secrets in IaC
- Use secure secret management
- Apply least privilege access
- Encrypt sensitive data at rest
- Scan for security vulnerabilities

### Modularity
- Break infrastructure into reusable modules
- Use variables and parameters
- Create templates for common patterns
- Promote consistency and reusability

### Testing
- Validate syntax before deployment
- Test in isolated environments
- Check for security misconfigurations
- Verify compliance requirements
- Perform load testing

### Documentation
- Comment complex configurations
- Document dependencies
- Create architecture diagrams
- Maintain deployment runbooks
- Record operational procedures

## State Management

### Remote State Storage
- Store state in remote backend
- Enable team collaboration
- Implement state locking
- Secure access to state files

### State Locking
- Prevent concurrent modifications
- Use backend-specific locking
- Handle lock failures gracefully
- Implement retry mechanisms

### State Migration
- Plan for state file moves
- Backup before migration
- Update references after move
- Verify integrity after migration

## Variable Management

### Variable Organization
```
variables.tf - Define variable declarations
terraform.tfvars - Assign variable values
terraform.tfvars.json - Alternative value assignment
auto.tfvars - Auto-loaded variable files
```

### Sensitive Variables
- Mark sensitive variables appropriately
- Use secure input methods
- Avoid logging sensitive values
- Encrypt variable files

## Module Development

### Module Structure
```
modules/
├── networking/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── README.md
└── compute/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    └── README.md
```

### Module Best Practices
- Keep modules focused and single-purpose
- Provide comprehensive documentation
- Include example usage
- Validate inputs and outputs
- Version modules for stability

## Testing IaC

### Syntax Validation
```bash
# Terraform validation
terraform validate

# CloudFormation validation
aws cloudformation validate-template --template-body file://template.yaml

# Kubernetes manifest validation
kubectl apply --dry-run=server -f manifest.yaml
```

### Security Scanning
- Use tools like tfsec, Checkov, or cfn-lint
- Scan for common misconfigurations
- Check for compliance violations
- Integrate with CI/CD pipelines

### Policy as Code
- Define infrastructure policies
- Enforce compliance automatically
- Use tools like Open Policy Agent (OPA)
- Implement governance controls

## CI/CD Integration

### Pipeline Integration
- Validate IaC in CI pipeline
- Create separate stages for different environments
- Implement approval gates for production
- Use immutable artifacts

### Automated Deployment
- Plan changes before applying
- Review plan output
- Apply only approved changes
- Monitor deployment status

### Change Management
- Track infrastructure changes
- Implement approval workflows
- Maintain audit logs
- Notify stakeholders of changes

## Disaster Recovery

### Backup Strategies
- Regular backup of state files
- Backup configuration repositories
- Document recovery procedures
- Test recovery processes

### Rollback Procedures
- Maintain previous configurations
- Plan for infrastructure rollback
- Test rollback procedures
- Document rollback impact

## Cost Optimization

### Resource Tagging
- Implement consistent tagging
- Track resource ownership
- Enable cost allocation
- Automate cleanup of unused resources

### Resource Management
- Right-size resources appropriately
- Use reserved instances where beneficial
- Implement auto-scaling
- Monitor resource utilization

## Common Anti-patterns

### Hardcoded Values
```
# Bad: Don't do this
resource "aws_instance" "web" {
  instance_type = "t3.medium"
}

# Good: Use variables
variable "instance_type" {
  description = "Instance type for web servers"
  type        = string
  default     = "t3.medium"
}

resource "aws_instance" "web" {
  instance_type = var.instance_type
}
```

### Tight Coupling
- Avoid interdependencies between modules
- Create loosely coupled components
- Use explicit interfaces
- Minimize cross-module references

### Manual Changes
- Never make manual changes to provisioned infrastructure
- All changes should go through IaC
- Monitor for configuration drift
- Implement drift detection