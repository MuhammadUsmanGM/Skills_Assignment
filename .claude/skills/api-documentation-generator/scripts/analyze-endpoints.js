#!/usr/bin/env node
// Script to perform deep endpoint analysis

const fs = require('fs');
const path = require('path');

function analyzeEndpoints(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const analysis = {
    endpoints: [],
    security: [],
    parameters: [],
    schemas: []
  };

  // Enhanced patterns for different frameworks
  const patterns = {
    express: [
      /app\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]\s*,/,
      /router\.(get|post|put|delete|patch|all)\(\s*['"`]([^'"`]+)['"`]\s*,/
    ],
    spring: [
      /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\s*\(\s*["']([^"']+)["']\s*\)/,
      /@RequestMapping\([^)]*value\s*=\s*["']([^"']+)["'][^)]*\)/
    ],
    flask: [
      /@app\.route\s*\(\s*['"`]([^'"`]+)['"`][^)]*\)/,
      /methods\s*=\s*\[([^\]]+)\]/  // Extract HTTP methods
    ]
  };

  // Analyze Express.js patterns
  for (const pattern of patterns.express) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const method = match[1]?.toUpperCase() || 'ALL';
      const route = match[2];

      analysis.endpoints.push({
        method: method,
        path: route,
        framework: 'Express.js',
        line: getLineNumber(content, match.index)
      });
    }
  }

  // Analyze Spring patterns
  for (const pattern of patterns.spring) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const annotation = match[1];
      let method = 'GET';

      if (annotation.includes('Post')) method = 'POST';
      else if (annotation.includes('Put')) method = 'PUT';
      else if (annotation.includes('Delete')) method = 'DELETE';
      else if (annotation.includes('Patch')) method = 'PATCH';

      const route = match[2] || '';

      analysis.endpoints.push({
        method: method,
        path: route,
        framework: 'Spring Boot',
        line: getLineNumber(content, match.index)
      });
    }
  }

  // Look for security annotations/middleware
  const securityPatterns = [
    /auth/i,
    /jwt/i,
    /bearer/i,
    /passport/i,
    /oauth/i,
    /@secured/i,
    /@preauthorize/i,
    /authenticate/i,
    /authorization/i,
    /middleware.*auth/i
  ];

  for (const lineIdx in lines) {
    const line = lines[lineIdx];
    for (const pattern of securityPatterns) {
      if (pattern.test(line)) {
        analysis.security.push({
          type: 'potential_security',
          code: line.trim(),
          line: parseInt(lineIdx) + 1
        });
      }
    }
  }

  // Look for parameter patterns
  const paramPatterns = [
    /req\.params\.(\w+)/gi,
    /req\.query\.(\w+)/gi,
    /req\.headers\.(\w+)/gi,
    /req\.body\.(\w+)/gi
  ];

  for (const pattern of paramPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      analysis.parameters.push({
        name: match[1],
        source: getParamSource(match[0]),
        line: getLineNumber(content, match.index)
      });
    }
  }

  return analysis;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function getParamSource(paramStr) {
  if (paramStr.includes('params')) return 'path';
  if (paramStr.includes('query')) return 'query';
  if (paramStr.includes('headers')) return 'header';
  if (paramStr.includes('body')) return 'body';
  return 'unknown';
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node analyze-endpoints.js <source-file-path>');
  process.exit(1);
}

const sourcePath = process.argv[2];
try {
  const analysis = analyzeEndpoints(sourcePath);

  console.log('=== DEEP ENDPOINT ANALYSIS ===\n');

  console.log(`Found ${analysis.endpoints.length} endpoints:`);
  analysis.endpoints.forEach(ep => {
    console.log(`  ${ep.method} ${ep.path} (${ep.framework}) - Line ${ep.line}`);
  });

  console.log(`\nFound ${analysis.security.length} potential security implementations:`);
  analysis.security.forEach(sec => {
    console.log(`  Line ${sec.line}: ${sec.code}`);
  });

  console.log(`\nFound ${analysis.parameters.length} parameters:`);
  analysis.parameters.forEach(param => {
    console.log(`  ${param.name} (${param.source})`);
  });

  // Save detailed analysis to file
  const outputPath = sourcePath.replace(/\.[^/.]+$/, '') + '-analysis.json';
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
  console.log(`\nDetailed analysis saved to: ${outputPath}`);
} catch (error) {
  console.error('Analysis failed:', error.message);
  process.exit(1);
}