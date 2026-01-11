#!/usr/bin/env node
// Script to generate OpenAPI specification from code

const fs = require('fs');
const path = require('path');

function extractEndpointsFromCode(fileContent) {
  // Regex patterns for common framework route definitions
  const patterns = [
    /app\.(get|post|put|delete|patch)\(['"`](\/[^'"`]+)['"`].*\)/g,
    /router\.(get|post|put|delete|patch)\(['"`](\/[^'"`]+)['"`].*\)/g,
    /@Route\.(Get|Post|Put|Delete|Patch)\(['"`](\/[^'"`]+)['"`]\)/g,
  ];

  const endpoints = [];
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(fileContent)) !== null) {
      const method = match[1].toUpperCase();
      const route = match[2];

      endpoints.push({
        method: method,
        route: route,
        params: extractParams(route),
        description: `Endpoint for ${method} ${route}`
      });
    }
  });

  return endpoints;
}

function extractParams(route) {
  const paramRegex = /:([a-zA-Z0-9_]+)/g;
  const params = [];
  let match;
  while ((match = paramRegex.exec(route)) !== null) {
    params.push(match[1]);
  }
  return params;
}

function generateOpenApiSpec(endpoints) {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'Generated API Documentation',
      version: '1.0.0',
      description: 'Automatically generated API documentation'
    },
    paths: {},
    components: {
      schemas: {}
    }
  };

  // Group endpoints by path
  endpoints.forEach(endpoint => {
    const path = endpoint.route;

    if (!spec.paths[path]) {
      spec.paths[path] = {};
    }

    spec.paths[path][endpoint.method.toLowerCase()] = {
      summary: endpoint.description,
      description: endpoint.description,
      parameters: endpoint.params.map(param => ({
        name: param,
        in: 'path',
        required: true,
        description: `Path parameter: ${param}`,
        schema: { type: 'string' }
      })),
      responses: {
        '200': {
          description: 'Successful response'
        },
        '404': {
          description: 'Not found'
        }
      }
    };
  });

  return spec;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node generate-openapi.js <source-file-path>');
  process.exit(1);
}

const sourcePath = process.argv[2];

try {
  const sourceCode = fs.readFileSync(sourcePath, 'utf8');
  const endpoints = extractEndpointsFromCode(sourceCode);
  const openApiSpec = generateOpenApiSpec(endpoints);

  const outputPath = path.join(path.dirname(sourcePath), 'openapi-generated.json');
  fs.writeFileSync(outputPath, JSON.stringify(openApiSpec, null, 2));

  console.log(`OpenAPI specification generated successfully!`);
  console.log(`Output saved to: ${outputPath}`);
  console.log(`Found ${endpoints.length} endpoints:`);
  endpoints.forEach(endpoint => {
    console.log(`  ${endpoint.method} ${endpoint.route}`);
  });
} catch (error) {
  console.error('Error generating OpenAPI specification:', error.message);
  process.exit(1);
}