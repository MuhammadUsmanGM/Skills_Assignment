#!/usr/bin/env node
// Script to export API documentation in various formats

const fs = require('fs');
const path = require('path');

function exportDocs(specPath, format = 'html') {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  let exportedContent;
  let extension;

  switch (format.toLowerCase()) {
    case 'html':
      exportedContent = generateHtmlDocs(spec);
      extension = '.html';
      break;
    case 'markdown':
    case 'md':
      exportedContent = generateMarkdownDocs(spec);
      extension = '.md';
      break;
    case 'postman':
      exportedContent = generatePostmanCollection(spec);
      extension = '.json';
      break;
    case 'raml':
      exportedContent = generateRaml(spec);
      extension = '.raml';
      break;
    case 'asciidoc':
      exportedContent = generateAsciiDoc(spec);
      extension = '.adoc';
      break;
    default:
      throw new Error(`Unsupported format: ${format}. Supported formats: html, markdown, postman, raml, asciidoc`);
  }

  return {
    content: exportedContent,
    extension: extension,
    format: format
  };
}

function generateHtmlDocs(spec) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${spec.info?.title || 'API Documentation'}</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1, h2, h3 { color: #333; }
    .endpoint { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .method { display: inline-block; padding: 2px 8px; border-radius: 3px; color: white; margin-right: 10px; }
    .get { background-color: #4CAF50; }
    .post { background-color: #2196F3; }
    .put { background-color: #FF9800; }
    .delete { background-color: #f44336; }
    .patch { background-color: #9C27B0; }
    .parameter { margin: 5px 0; }
    .response { background-color: #f9f9f9; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>${spec.info?.title || 'API Documentation'}</h1>
  ${spec.info?.description ? `<p>${spec.info.description}</p>` : ''}

  ${spec.info?.version ? `<p><strong>Version:</strong> ${spec.info.version}</p>` : ''}
  ${spec.servers ? `<p><strong>Servers:</strong><br>${spec.servers.map(server => `<code>${server.url}</code> - ${server.description || ''}`).join('<br>')}</p>` : ''}

  <h2>Endpoints</h2>
  ${generateHtmlPaths(spec.paths)}

  ${spec.components?.schemas ? generateHtmlSchemas(spec.components.schemas) : ''}
</body>
</html>`;
}

function generateHtmlPaths(paths = {}) {
  let html = '';

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
        html += `
<div class="endpoint">
  <span class="method ${method}">${method.toUpperCase()}</span>
  <h3>${path}</h3>
  ${operation.summary ? `<h4>${operation.summary}</h4>` : ''}
  ${operation.description ? `<p>${operation.description}</p>` : ''}

  ${operation.parameters && operation.parameters.length > 0 ? `
  <h5>Parameters:</h5>
  <div>
    ${operation.parameters.map(param => `
      <div class="parameter">
        <strong>${param.name}</strong> (${param.in}): ${param.description || ''}
        ${param.required ? '<em>(required)</em>' : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${operation.responses ? `
  <h5>Responses:</h5>
  <div>
    ${Object.entries(operation.responses).map(([code, response]) => `
      <div class="response">
        <strong>${code}</strong>: ${response.description || 'Response'}
        ${response.content ? `
        <details>
          <summary>Response Schema</summary>
          <pre>${JSON.stringify(response.content, null, 2)}</pre>
        </details>
        ` : ''}
      </div>
    `).join('')}
  </div>
  ` : ''}
</div>`;
      }
    }
  }

  return html;
}

function generateHtmlSchemas(schemas = {}) {
  let html = '<h2>Data Models</h2>';

  for (const [name, schema] of Object.entries(schemas)) {
    html += `
<div class="endpoint">
  <h3>${name}</h3>
  <pre>${JSON.stringify(schema, null, 2)}</pre>
</div>`;
  }

  return html;
}

function generateMarkdownDocs(spec) {
  let md = `# ${spec.info?.title || 'API Documentation'}\n\n`;

  if (spec.info?.description) {
    md += `${spec.info.description}\n\n`;
  }

  if (spec.info?.version) {
    md += `**Version:** ${spec.info.version}\n\n`;
  }

  if (spec.servers) {
    md += `## Servers\n\n`;
    spec.servers.forEach(server => {
      md += `- \`${server.url}\` - ${server.description || ''}\n`;
    });
    md += '\n';
  }

  md += `## Endpoints\n\n`;

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
        md += `### ${method.toUpperCase()} ${path}\n\n`;

        if (operation.summary) {
          md += `**${operation.summary}**\n\n`;
        }

        if (operation.description) {
          md += `${operation.description}\n\n`;
        }

        if (operation.parameters && operation.parameters.length > 0) {
          md += `#### Parameters\n\n`;
          md += '| Name | Location | Type | Required | Description |\n';
          md += '|------|----------|------|----------|-------------|\n';

          operation.parameters.forEach(param => {
            md += `| ${param.name} | ${param.in} | ${param.schema?.type || 'N/A'} | ${param.required ? 'Yes' : 'No'} | ${param.description || ''} |\n`;
          });
          md += '\n';
        }

        if (operation.responses) {
          md += `#### Responses\n\n`;
          for (const [code, response] of Object.entries(operation.responses)) {
            md += `**${code}**: ${response.description || 'Response'}\n\n`;

            if (response.content) {
              for (const [contentType, content] of Object.entries(response.content)) {
                if (content.schema) {
                  md += '```json\n';
                  md += JSON.stringify(content.schema, null, 2);
                  md += '\n```\n\n';
                }
              }
            }
          }
        }

        md += '\n---\n\n';
      }
    }
  }

  if (spec.components?.schemas) {
    md += `## Data Models\n\n`;

    for (const [name, schema] of Object.entries(spec.components.schemas)) {
      md += `### ${name}\n\n`;
      md += '```json\n';
      md += JSON.stringify(schema, null, 2);
      md += '\n```\n\n';
    }
  }

  return md;
}

function generatePostmanCollection(spec) {
  const collection = {
    info: {
      name: spec.info?.title || 'API Collection',
      description: spec.info?.description || '',
      version: spec.info?.version || '1.0.0',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    item: []
  };

  // Add paths as Postman requests
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    const folder = {
      name: path,
      item: []
    };

    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
        const request = {
          name: operation.operationId || `${method.toUpperCase()} ${path}`,
          request: {
            method: method.toUpperCase(),
            header: [],
            url: {
              raw: '{{baseUrl}}' + path,
              host: ['{{baseUrl}}'],
              path: path.replace(/^\//, '').split('/')
            }
          }
        };

        // Add description
        if (operation.description || operation.summary) {
          request.request.description = operation.description || operation.summary;
        }

        // Add parameters
        if (operation.parameters) {
          const queryParams = [];
          const pathParams = [];
          const headerParams = [];

          operation.parameters.forEach(param => {
            if (param.in === 'query') {
              queryParams.push({
                key: param.name,
                value: param.example || '',
                description: param.description || ''
              });
            } else if (param.in === 'header') {
              headerParams.push({
                key: param.name,
                value: param.example || '',
                description: param.description || ''
              });
            }
          });

          if (queryParams.length > 0) {
            request.request.url.query = queryParams;
          }

          if (headerParams.length > 0) {
            request.request.header = headerParams;
          }
        }

        // Add request body for POST/PUT/PATCH
        if (operation.requestBody && ['post', 'put', 'patch'].includes(method)) {
          const content = operation.requestBody.content;
          if (content) {
            const contentType = Object.keys(content)[0]; // Use first content type
            if (contentType) {
              request.request.body = {
                mode: 'raw',
                raw: JSON.stringify(content[contentType].schema?.example || {}, null, 2),
                options: {
                  raw: {
                    language: 'json'
                  }
                }
              };
            }
          }
        }

        folder.item.push(request);
      }
    }

    collection.item.push(folder);
  }

  // Add variables
  collection.variable = [
    {
      key: 'baseUrl',
      value: spec.servers?.[0]?.url || 'http://localhost:3000',
      type: 'string'
    }
  ];

  return collection;
}

function generateRaml(spec) {
  let raml = `#%RAML 1.0 DataType\n`;
  raml += `title: ${spec.info?.title || 'API'}\n`;
  raml += `version: ${spec.info?.version || '1.0.0'}\n`;

  if (spec.servers?.[0]) {
    raml += `baseUri: ${spec.servers[0].url}\n`;
  }

  raml += `\n`;

  // Convert paths
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    const ramlPath = path.replace(/{([^}]+)}/g, '{$1}');
    raml += `${ramlPath}:\n`;

    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
        raml += `  ${method}:\n`;
        raml += `    displayName: ${operation.operationId || `${method.toUpperCase()} ${path}`}\n`;

        if (operation.summary) {
          raml += `    description: ${operation.summary}\n`;
        }

        if (operation.description) {
          raml += `    description: |\n      ${operation.description.split('\n').map(line => `      ${line}`).join('\n')}\n`;
        }

        // Add parameters
        if (operation.parameters) {
          raml += `    queryParameters:\n`;
          operation.parameters.filter(p => p.in === 'query').forEach(param => {
            raml += `      ${param.name}:\n`;
            raml += `        type: string\n`;  // Simplified
            raml += `        required: ${param.required || false}\n`;
            if (param.description) {
              raml += `        description: ${param.description}\n`;
            }
          });
        }

        // Add responses
        if (operation.responses) {
          raml += `    responses:\n`;
          for (const [code, response] of Object.entries(operation.responses)) {
            raml += `      ${code}:\n`;
            raml += `        description: ${response.description || 'Response'}\n`;
          }
        }
      }
    }
  }

  return raml;
}

function generateAsciiDoc(spec) {
  let adoc = `= ${spec.info?.title || 'API Documentation'}\n`;
  adoc += `:doctype: book\n`;
  adoc += `:icons: font\n`;
  adoc += `:source-highlighter: highlightjs\n\n`;

  if (spec.info?.description) {
    adoc += `${spec.info.description}\n\n`;
  }

  if (spec.info?.version) {
    adoc += `Version: {version}\n\n`;
  }

  adoc += `== Endpoints\n\n`;

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].includes(method)) {
        adoc += `=== ${method.toUpperCase()} ${path}\n\n`;

        if (operation.summary) {
          adoc += `_${operation.summary}_\n\n`;
        }

        if (operation.description) {
          adoc += `${operation.description}\n\n`;
        }

        adoc += `==== Parameters\n\n`;
        adoc += `[cols=\"2,1,1,3\"]\n`;
        adoc += `|===\n`;
        adoc += `|Name |Location |Required |Description\n`;

        if (operation.parameters) {
          operation.parameters.forEach(param => {
            adoc += `|${param.name} |${param.in} |${param.required ? 'Yes' : 'No'} |${param.description || ''}\n`;
          });
        }

        adoc += `|===\n\n`;

        adoc += `==== Responses\n\n`;
        if (operation.responses) {
          for (const [code, response] of Object.entries(operation.responses)) {
            adoc += `* *${code}* - ${response.description || 'Response'}\n`;
          }
        }

        adoc += `\n`;
      }
    }
  }

  return adoc;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node export-docs.js <openapi-spec-path> [format]');
  console.log('Supported formats: html (default), markdown, postman, raml, asciidoc');
  process.exit(1);
}

const specPath = process.argv[2];
const format = process.argv[3] || 'html';

try {
  const result = exportDocs(specPath, format);

  const outputDir = path.dirname(specPath);
  const baseName = path.basename(specPath, path.extname(specPath));
  const outputPath = path.join(outputDir, `${baseName}-docs${result.extension}`);

  fs.writeFileSync(outputPath, result.content);

  console.log(`=== EXPORT COMPLETE ===`);
  console.log(`Exported ${result.format} documentation to: ${outputPath}`);
  console.log(`Format: ${result.format}`);
  console.log(`File size: ${Buffer.byteLength(result.content)} bytes`);

} catch (error) {
  console.error('Export failed:', error.message);
  process.exit(1);
}