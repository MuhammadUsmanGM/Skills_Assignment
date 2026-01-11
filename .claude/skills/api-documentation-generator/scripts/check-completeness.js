#!/usr/bin/env node
// Script to verify API documentation completeness

const fs = require('fs');
const path = require('path');

function checkCompleteness(specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const issues = [];
  const suggestions = [];

  // Check for basic info
  if (!spec.info) {
    issues.push('Missing info object (title, version, description)');
  } else {
    if (!spec.info.title) {
      issues.push('Missing API title');
    }
    if (!spec.info.version) {
      issues.push('Missing API version');
    }
    if (!spec.info.description) {
      suggestions.push('Consider adding API description');
    }
  }

  // Check for servers
  if (!spec.servers || spec.servers.length === 0) {
    suggestions.push('Consider adding server definitions for base URLs');
  }

  // Check paths
  if (!spec.paths || Object.keys(spec.paths).length === 0) {
    issues.push('No paths defined in API specification');
  } else {
    let totalOperations = 0;
    let documentedOperations = 0;
    let operationsWithDescriptions = 0;
    let operationsWithExamples = 0;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
          totalOperations++;

          // Check if operation is properly documented
          documentedOperations++;

          if (operation.summary || operation.description) {
            operationsWithDescriptions++;
          }

          // Check for examples in responses
          if (operation.responses) {
            for (const [statusCode, response] of Object.entries(operation.responses)) {
              if (response.content) {
                for (const [contentType, content] of Object.entries(response.content)) {
                  if (content.examples || (content.schema && content.schema.example)) {
                    operationsWithExamples++;
                    break; // Count once per operation
                  }
                }
              }
            }
          }
        }
      }
    }

    // Calculate completeness metrics
    const descriptionCoverage = (operationsWithDescriptions / totalOperations) * 100;
    const exampleCoverage = (operationsWithExamples / totalOperations) * 100;

    if (descriptionCoverage < 80) {
      suggestions.push(`Only ${Math.round(descriptionCoverage)}% of operations have descriptions, consider adding more`);
    }

    if (exampleCoverage < 50) {
      suggestions.push(`Only ${Math.round(exampleCoverage)}% of operations have examples, consider adding request/response examples`);
    }

    if (totalOperations === 0) {
      issues.push('No HTTP operations defined in paths');
    }
  }

  // Check components
  if (spec.components) {
    // Check schemas
    if (spec.components.schemas) {
      let schemasWithoutDescriptions = 0;
      let schemasWithoutExamples = 0;

      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        if (!schema.description) {
          schemasWithoutDescriptions++;
        }

        if (!schema.example && !(schema.properties && Object.values(schema.properties).some(p => p.example))) {
          schemasWithoutExamples++;
        }
      }

      if (schemasWithoutDescriptions > 0) {
        suggestions.push(`${schemasWithoutDescriptions} schemas lack descriptions`);
      }

      if (schemasWithoutExamples > 0) {
        suggestions.push(`${schemasWithoutExamples} schemas lack examples`);
      }
    }

    // Check security schemes
    if (spec.components.securitySchemes) {
      for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
        if (!scheme.description) {
          suggestions.push(`Security scheme "${name}" lacks description`);
        }
      }
    }
  }

  // Check for common documentation gaps
  if (!spec.tags || spec.tags.length === 0) {
    suggestions.push('Consider adding tags to group related endpoints');
  }

  // Check for external documentation
  if (!spec.externalDocs) {
    suggestions.push('Consider adding external documentation links');
  }

  // Check parameter documentation
  if (spec.paths) {
    let paramsWithoutDescriptions = 0;
    let paramsWithoutExamples = 0;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (operation.parameters) {
          operation.parameters.forEach(param => {
            if (!param.description) {
              paramsWithoutDescriptions++;
            }
            if (!param.example && !param.schema?.example) {
              paramsWithoutExamples++;
            }
          });
        }
      }
    }

    if (paramsWithoutDescriptions > 0) {
      suggestions.push(`${paramsWithoutDescriptions} parameters lack descriptions`);
    }

    if (paramsWithoutExamples > 0) {
      suggestions.push(`${paramsWithoutExamples} parameters lack examples`);
    }
  }

  // Check response documentation
  if (spec.paths) {
    let responsesWithoutDescriptions = 0;
    let responsesWithoutSchemas = 0;

    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (operation.responses) {
          for (const [statusCode, response] of Object.entries(operation.responses)) {
            if (!response.description) {
              responsesWithoutDescriptions++;
            }

            if (!response.content && statusCode !== 'default') {
              responsesWithoutSchemas++;
            }
          }
        }
      }
    }

    if (responsesWithoutDescriptions > 0) {
      suggestions.push(`${responsesWithoutDescriptions} responses lack descriptions`);
    }

    if (responsesWithoutSchemas > 0) {
      suggestions.push(`${responsesWithoutSchemas} responses lack content schemas`);
    }
  }

  return {
    issues: issues,
    suggestions: suggestions,
    score: calculateCompletenessScore(spec, issues, suggestions)
  };
}

function calculateCompletenessScore(spec, issues, suggestions) {
  // Base score
  let score = 100;

  // Deduct points for critical issues
  score -= issues.length * 5;

  // Deduct points for suggestions (less severe)
  score -= suggestions.length * 1;

  // Bonus points for good practices
  if (spec.info?.description && spec.info.description.length > 50) score += 5;
  if (spec.tags && spec.tags.length > 0) score += 3;
  if (spec.externalDocs) score += 2;

  // Normalize score to 0-100 range
  score = Math.max(0, Math.min(100, score));

  return Math.round(score);
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node check-completeness.js <openapi-spec-path>');
  console.log('This script analyzes OpenAPI/Swagger specification for documentation completeness');
  process.exit(1);
}

const specPath = process.argv[2];
try {
  const result = checkCompleteness(specPath);

  console.log('=== API DOCUMENTATION COMPLETENESS CHECK ===\n');
  console.log(`Completeness Score: ${result.score}/100\n`);

  if (result.issues.length > 0) {
    console.log(`Issues Found (${result.issues.length}):`);
    result.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ❌ ${issue}`);
    });
    console.log('');
  }

  if (result.suggestions.length > 0) {
    console.log(`Suggestions (${result.suggestions.length}):`);
    result.suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. 💡 ${suggestion}`);
    });
    console.log('');
  }

  // Provide score interpretation
  if (result.score >= 90) {
    console.log('🎉 Excellent! Your API documentation is very complete.');
  } else if (result.score >= 70) {
    console.log('👍 Good! Your API documentation covers most important aspects.');
  } else if (result.score >= 50) {
    console.log('⚠️ Fair. Consider addressing the issues and suggestions to improve completeness.');
  } else {
    console.log('❌ Poor. Significant improvements needed for complete API documentation.');
  }

  console.log('\nFor better API documentation:');
  console.log('- Add descriptions to all endpoints and parameters');
  console.log('- Include request/response examples');
  console.log('- Document error responses');
  console.log('- Group related endpoints with tags');
  console.log('- Provide external documentation links');

} catch (error) {
  console.error('Completeness check failed:', error.message);
  process.exit(1);
}