# Test Coverage Metrics

## Types of Coverage

### Statement Coverage
- Measures percentage of executable statements exercised
- Formula: (Executed statements / Total statements) × 100
- Goal: Typically aim for 80%+ coverage
- Limitation: Doesn't guarantee all paths are tested

### Branch Coverage
- Measures percentage of decision points with both outcomes tested
- Formula: (Taken branches / Total branches) × 100
- Goal: Aim for 70%+ coverage
- More thorough than statement coverage

### Function Coverage
- Measures percentage of functions called during testing
- Formula: (Called functions / Total functions) × 100
- Goal: Aim for 90%+ coverage
- Good indicator of basic test presence

### Line Coverage
- Measures percentage of source lines executed
- Similar to statement coverage but at line level
- Formula: (Covered lines / Total lines) × 100
- Most commonly reported metric

### Condition Coverage
- Measures individual boolean sub-expressions
- Each condition in a decision takes on all possible outcomes
- More comprehensive than branch coverage
- Goal: Aim for 60%+ coverage

### Path Coverage
- Measures all possible execution paths through code
- Most comprehensive but often impractical
- Formula: (Visited paths / Total paths) × 100
- Goal: Focus on critical paths rather than 100%

## Quality Thresholds

### Minimum Acceptable Coverage
- Statement/Line: 80%
- Branch: 70%
- Function: 90%
- Critical modules: 95%+

### Coverage by Risk Level
- Critical business logic: 95%+
- Core functionality: 90%+
- Supporting utilities: 80%+
- UI components: 70%+ (if unit testable)

## Calculating Coverage

### Coverage Calculation Example
```javascript
function calculateDiscount(total, isMember) {
  if (total > 100 && isMember) {  // Branch: 4 possible outcomes
    return total * 0.1;          // Statement 1
  } else if (total > 100) {      // Statement 2
    return total * 0.05;         // Statement 3
  }
  return 0;                      // Statement 4
}
```

To achieve 100% branch coverage, you need 4 test cases:
1. `total > 100 && isMember = true`
2. `total > 100 && isMember = false`
3. `total <= 100 && isMember = true`
4. `total <= 100 && isMember = false`

## Coverage Analysis Tools

### JavaScript
- Istanbul/nyc: Most popular coverage tool
- Jest: Built-in coverage reporting
- Blanket.js: Browser-based coverage

### Python
- Coverage.py: Standard coverage tool
- Pytest-cov: Coverage plugin for pytest
- Ned Batchelder's coverage.py

### Java
- JaCoCo: Popular JVM coverage tool
- Cobertura: Traditional coverage tool
- Emma: Eclipse-based coverage tool

### C#
- OpenCover: Cross-platform coverage tool
- ReportGenerator: Coverage report generator
- Visual Studio Code Coverage

## Interpretation Guidelines

### High Coverage ≠ High Quality
- 90% coverage doesn't mean 90% of bugs are caught
- Focus on testing critical paths and error conditions
- Quality of tests matters more than quantity

### Coverage Gaps to Address
- Error handling code paths
- Boundary conditions
- Exception scenarios
- Configuration-dependent code
- Dead code (should be removed)

### Coverage Trends
- Monitor coverage over time
- Alert on coverage decreases
- Correlate with bug reports
- Track coverage by module/component

## Best Practices

### Setting Realistic Goals
- Don't aim for 100% coverage everywhere
- Focus on critical business logic
- Consider effort vs. benefit
- Maintain different goals for different components

### Measuring Effectiveness
- Correlate coverage with bug detection
- Track coverage of new code
- Measure coverage of risky changes
- Monitor coverage drift over time