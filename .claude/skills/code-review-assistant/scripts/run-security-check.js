#!/usr/bin/env node
// Script to run security checks on code

const fs = require('fs');
const path = require('path');

function runSecurityCheck(filePath) {
  console.log(`Running security check on: ${filePath}`);

  // Read the file content
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const issues = [];

  // Look for common security issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Check for potential SQL injection
    if (/\b(INSERT|UPDATE|DELETE|SELECT)\b.*\$/.test(line) || /eval\(/.test(line)) {
      issues.push({
        type: 'HIGH',
        line: lineNumber,
        code: line.trim(),
        issue: 'Potential code injection vulnerability detected'
      });
    }

    // Check for hardcoded passwords/keys
    if (/(password|secret|key|token).*['"][^'"]{8,}['"]/.test(line.toLowerCase())) {
      issues.push({
        type: 'HIGH',
        line: lineNumber,
        code: line.trim(),
        issue: 'Potential hardcoded secret detected'
      });
    }

    // Check for potential XSS
    if (/(innerHTML|outerHTML|document\.write)/.test(line) && !line.includes('*/')) {
      issues.push({
        type: 'MEDIUM',
        line: lineNumber,
        code: line.trim(),
        issue: 'Potential XSS vulnerability - unsafe DOM manipulation'
      });
    }
  });

  return issues;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node security-checker.js <file-path>');
  process.exit(1);
}

const filePath = process.argv[2];
const issues = runSecurityCheck(filePath);

console.log('\n--- SECURITY ANALYSIS RESULTS ---');
if (issues.length === 0) {
  console.log('No security issues detected!');
} else {
  console.log(`Found ${issues.length} potential security issues:`);
  issues.forEach(issue => {
    console.log(`\n${issue.type}: Line ${issue.line}`);
    console.log(`Issue: ${issue.issue}`);
    console.log(`Code: ${issue.code}`);
  });
}