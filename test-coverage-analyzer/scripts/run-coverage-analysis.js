#!/usr/bin/env node
// Script to analyze test coverage

const fs = require('fs');
const path = require('path');

function analyzeCoverageReport(reportPath) {
  try {
    const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    // Assuming this is an Istanbul coverage report format
    const summary = {
      totalFiles: 0,
      coveredFiles: 0,
      totalStatements: 0,
      coveredStatements: 0,
      totalBranches: 0,
      coveredBranches: 0,
      totalFunctions: 0,
      coveredFunctions: 0,
      lowCoverageFiles: []
    };

    for (const [filePath, fileData] of Object.entries(reportData)) {
      summary.totalFiles++;

      const fileSummary = fileData.s || {};
      const branchSummary = fileData.b || {};
      const functionSummary = fileData.f || {};

      // Count statements
      for (const [stmtId, hits] of Object.entries(fileSummary)) {
        summary.totalStatements++;
        if (hits > 0) {
          summary.coveredStatements++;
        }
      }

      // Count branches
      for (const [branchId, branchHits] of Object.entries(branchSummary)) {
        for (const hitCount of branchHits) {
          summary.totalBranches++;
          if (hitCount > 0) {
            summary.coveredBranches++;
          }
        }
      }

      // Count functions
      for (const [funcId, hits] of Object.entries(functionSummary)) {
        summary.totalFunctions++;
        if (hits > 0) {
          summary.coveredFunctions++;
        }
      }

      // Calculate file coverage percentage
      const statementPct = summary.totalStatements > 0 ?
        (summary.coveredStatements / summary.totalStatements) * 100 : 0;

      if (statementPct < 50) { // Flag files with low coverage
        summary.lowCoverageFiles.push({
          path: filePath,
          coverage: Math.round(statementPct * 100) / 100
        });
      }
    }

    return summary;
  } catch (error) {
    throw new Error(`Failed to parse coverage report: ${error.message}`);
  }
}

function generateCoverageReport(summary) {
  const pctStmt = summary.totalStatements > 0 ?
    Math.round((summary.coveredStatements / summary.totalStatements) * 100) : 0;
  const pctBranch = summary.totalBranches > 0 ?
    Math.round((summary.coveredBranches / summary.totalBranches) * 100) : 0;
  const pctFunc = summary.totalFunctions > 0 ?
    Math.round((summary.coveredFunctions / summary.totalFunctions) * 100) : 0;

  return `
=== TEST COVERAGE ANALYSIS ===

SUMMARY:
- Files analyzed: ${summary.totalFiles}
- Statements: ${summary.coveredStatements}/${summary.totalStatements} (${pctStmt}%)
- Branches: ${summary.coveredBranches}/${summary.totalBranches} (${pctBranch}%)
- Functions: ${summary.coveredFunctions}/${summary.totalFunctions} (${pctFunc}%)

COVERAGE QUALITY:
- Statements: ${pctStmt >= 80 ? '✅ GOOD' : pctStmt >= 60 ? '⚠️ FAIR' : '❌ POOR'}
- Branches: ${pctBranch >= 80 ? '✅ GOOD' : pctBranch >= 60 ? '⚠️ FAIR' : '❌ POOR'}
- Functions: ${pctFunc >= 80 ? '✅ GOOD' : pctFunc >= 60 ? '⚠️ FAIR' : '❌ POOR'}

FILES WITH LOW COVERAGE (<50%):
${summary.lowCoverageFiles.length > 0 ?
  summary.lowCoverageFiles.map(f => `  - ${f.path}: ${f.coverage}%`).join('\n') :
  '  No files with low coverage detected!'
}
`;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node run-coverage-analysis.js <coverage-report-json>');
  process.exit(1);
}

const reportPath = process.argv[2];

try {
  const summary = analyzeCoverageReport(reportPath);
  const report = generateCoverageReport(summary);
  console.log(report);
} catch (error) {
  console.error('Coverage analysis failed:', error.message);
  process.exit(1);
}