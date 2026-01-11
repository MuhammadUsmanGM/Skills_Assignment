# Claude Code Premium Skills

This directory contains 5 premium skills designed to enhance Claude Code's capabilities across various development workflows.

## Skills Overview

### 1. Git Workflow Automation
- **Purpose**: Automate Git operations and enforce best practices
- **Features**: Branch management, pull request creation, merge strategies, release management
- **Key Scripts**: `create-feature-branch.sh`, `sync-with-main.sh`, `prepare-release.sh`

### 2. Code Review Assistant
- **Purpose**: Provide comprehensive code review capabilities
- **Features**: Quality assessment, security scanning, performance analysis, best practice enforcement
- **Key Scripts**: `run-security-check.js`, `performance-analyzer.js`, `style-checker.js`, `test-coverage.js`

### 3. API Documentation Generator
- **Purpose**: Generate and maintain API documentation
- **Features**: OpenAPI/Swagger generation, endpoint analysis, integration guides
- **Key Scripts**: `generate-openapi.js`, `validate-spec.js`, `export-docs.js`, `check-completeness.js`

### 4. Test Coverage Analyzer
- **Purpose**: Analyze and report on test coverage metrics
- **Features**: Coverage reporting, gap identification, quality gates, risk assessment
- **Key Scripts**: `run-coverage-analysis.js`, `generate-report.js`, `check-thresholds.js`, `compare-coverage.js`

### 5. Deployment Orchestrator
- **Purpose**: Manage automated deployments across environments
- **Features**: Multi-environment deployment, infrastructure as code, rollback procedures, monitoring
- **Key Scripts**: `deploy-application.sh`, `provision-infrastructure.js`, `rollback-deployment.sh`, `health-check.js`

## Usage

Each skill follows the Claude Code skill format with:
- A `SKILL.md` file containing the skill definition and instructions
- A `scripts/` directory with executable tools for automation
- Proper YAML frontmatter with name and description for skill discovery

To use these skills, Claude Code will automatically recognize them when placed in the appropriate skills directory.

## Benefits

These premium skills provide:

- **Automation**: Reduce repetitive tasks with scripted operations
- **Consistency**: Enforce best practices across development teams
- **Quality**: Improve code quality through automated analysis
- **Efficiency**: Speed up development workflows with guided processes
- **Expertise**: Embed domain knowledge directly into the development process