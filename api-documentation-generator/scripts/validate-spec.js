#!/usr/bin/env node
// Script to validate API specification against standards

const fs = require('fs');
const path = require('path');

function validateSpec(specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const errors = [];
  const warnings = [];

  // Validate basic OpenAPI structure
  if (!spec.openapi && !spec.swagger) {
    errors.push('Missing openapi (3.x) or swagger (2.0) version field');
  } else if (spec.openapi) {
    if (!isValidOpenApiVersion(spec.openapi)) {
      errors.push(`Invalid OpenAPI version: ${spec.openapi}. Expected format like "3.0.0"`);
    }
  } else if (spec.swagger) {
    if (!isValidSwaggerVersion(spec.swagger)) {
      errors.push(`Invalid Swagger version: ${spec.swagger}. Expected "2.0"`);
    }
  }

  // Validate required fields
  if (!spec.info) {
    errors.push('Missing required info object');
  } else {
    if (!spec.info.title) {
      errors.push('Missing required info.title');
    }
    if (!spec.info.version) {
      errors.push('Missing required info.version');
    }
  }

  // Validate paths
  if (!spec.paths) {
    errors.push('Missing required paths object');
  } else {
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      if (typeof pathItem !== 'object') {
        errors.push(`Invalid path item for "${path}", expected object`);
        continue;
      }

      // Check for valid HTTP methods
      const validMethods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
      for (const [method, operation] of Object.entries(pathItem)) {
        if (!validMethods.includes(method.toLowerCase())) {
          warnings.push(`Unknown HTTP method "${method}" in path "${path}"`);
        }

        if (operation && typeof operation === 'object') {
          // Validate operation properties
          if (operation.responses) {
            for (const [statusCode, response] of Object.entries(operation.responses)) {
              if (isNaN(parseInt(statusCode)) && !['default'].includes(statusCode)) {
                warnings.push(`Invalid status code "${statusCode}" in ${method.toUpperCase()} ${path}`);
              }
            }
          }
        }
      }
    }
  }

  // Validate components (OpenAPI 3.x)
  if (spec.openapi && spec.components) {
    validateComponents(spec.components, errors, warnings);
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    specType: spec.openapi ? 'OpenAPI 3.x' : spec.swagger ? 'Swagger 2.0' : 'Unknown'
  };
}

function isValidOpenApiVersion(version) {
  return /^3\.\d+\.\d+$/.test(version);
}

function isValidSwaggerVersion(version) {
  return version === '2.0';
}

function validateComponents(components, errors, warnings) {
  if (components.schemas) {
    for (const [name, schema] of Object.entries(components.schemas)) {
      if (typeof schema !== 'object') {
        errors.push(`Invalid schema "${name}", expected object`);
        continue;
      }

      // Validate schema properties
      if (schema.properties) {
        for (const [propName, propDef] of Object.entries(schema.properties)) {
          if (typeof propDef !== 'object') {
            warnings.push(`Property "${propName}" in schema "${name}" should be an object`);
          }
        }
      }
    }
  }

  if (components.securitySchemes) {
    for (const [name, scheme] of Object.entries(components.securitySchemes)) {
      if (!scheme.type) {
        errors.push(`Security scheme "${name}" missing required type field`);
        continue;
      }

      const validTypes = ['apiKey', 'http', 'oauth2', 'openIdConnect'];
      if (!validTypes.includes(scheme.type)) {
        errors.push(`Invalid security scheme type "${scheme.type}" in scheme "${name}"`);
      }

      // Validate type-specific requirements
      switch (scheme.type) {
        case 'apiKey':
          if (!scheme.name) {
            errors.push(`apiKey security scheme "${name}" missing required name field`);
          }
          if (!scheme.in || !['query', 'header', 'cookie'].includes(scheme.in)) {
            errors.push(`apiKey security scheme "${name}" missing or invalid "in" field (expected query, header, or cookie)`);
          }
          break;
        case 'http':
          if (!scheme.scheme) {
            errors.push(`http security scheme "${name}" missing required scheme field`);
          }
          break;
        case 'oauth2':
          if (!scheme.flows) {
            errors.push(`oauth2 security scheme "${name}" missing required flows object`);
          }
          break;
        case 'openIdConnect':
          if (!scheme.openIdConnectUrl) {
            errors.push(`openIdConnect security scheme "${name}" missing required openIdConnectUrl field`);
          }
          break;
      }
    }
  }
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node validate-spec.js <openapi-spec-path>');
  console.log('Note: This script validates OpenAPI/Swagger JSON/YAML specification files');
  process.exit(1);
}

const specPath = process.argv[2];
try {
  const result = validateSpec(specPath);

  console.log('=== API SPECIFICATION VALIDATION ===\n');
  console.log(`Specification Type: ${result.specType}`);
  console.log(`Valid: ${result.isValid ? 'YES' : 'NO'}\n`);

  if (result.errors.length > 0) {
    console.log(`Errors (${result.errors.length}):`);
    result.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('');
  }

  if (result.warnings.length > 0) {
    console.log(`Warnings (${result.warnings.length}):`);
    result.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  if (result.isValid) {
    console.log('✅ Specification is valid according to basic OpenAPI/Swagger rules');
  } else {
    console.log('❌ Specification has validation errors');
    process.exit(1);
  }

} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}