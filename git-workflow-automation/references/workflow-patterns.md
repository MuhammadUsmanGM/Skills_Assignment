# Git Workflow Patterns

## Git Flow
```
main (production-ready code)
├── develop (integration branch)
│   ├── feature/* (feature branches)
│   └── release/* (release preparation)
└── hotfix/* (urgent fixes)
```

### When to Use
- Projects with scheduled releases
- Teams with dedicated QA cycles
- When you need to maintain multiple versions

### Commands
```bash
# Start a feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Complete a feature
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature

# Start a release
git checkout develop
git merge --no-ff feature/*
git checkout -b release/v1.2.0

# Complete a release
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0
git checkout develop
git merge --no-ff release/v1.2.0
git branch -d release/v1.2.0
```

## GitHub Flow
```
main (always deployable)
└── feature/* (short-lived branches)
```

### When to Use
- Continuous deployment
- Smaller teams
- Rapid iteration cycles

### Commands
```bash
# Create feature branch
git checkout main
git pull origin main
git checkout -b feature/new-feature

# Complete feature
git push origin feature/new-feature
# Create pull request
# After review, merge via PR interface
git branch -d feature/new-feature
```

## GitLab Flow
Combines elements of both, with environment branches:
```
main
├── production
└── pre-production
```

## Feature Branch Workflow
- Create feature branch from main/develop
- Work on feature in isolation
- Regularly sync with main/develop
- Merge via pull request after review