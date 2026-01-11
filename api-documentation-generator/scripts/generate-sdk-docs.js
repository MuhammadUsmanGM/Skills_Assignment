#!/usr/bin/env node
// Script to generate client SDK documentation

const fs = require('fs');
const path = require('path');

function generateSdkDocs(specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

  const sdkDocs = {
    languages: {},
    methods: [],
    baseUrl: getBaseUrl(spec),
    authMethods: getAuthMethods(spec)
  };

  // Generate documentation for different languages
  sdkDocs.languages.javascript = generateJavaScriptSdk(spec);
  sdkDocs.languages.python = generatePythonSdk(spec);
  sdkDocs.languages.java = generateJavaSdk(spec);
  sdkDocs.languages.csharp = generateCSharpSdk(spec);

  // Extract method information
  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        sdkDocs.methods.push({
          method: method.toUpperCase(),
          path: path,
          operationId: operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`,
          summary: operation.summary || '',
          parameters: operation.parameters || [],
          requestBody: operation.requestBody,
          responses: operation.responses,
          tags: operation.tags || ['default']
        });
      }
    }
  }

  return sdkDocs;
}

function getBaseUrl(spec) {
  if (spec.servers && spec.servers.length > 0) {
    return spec.servers[0].url;
  }
  return 'https://api.example.com'; // default
}

function getAuthMethods(spec) {
  const authMethods = [];

  if (spec.components && spec.components.securitySchemes) {
    for (const [name, scheme] of Object.entries(spec.components.securitySchemes)) {
      authMethods.push({
        name: name,
        type: scheme.type,
        scheme: scheme.scheme,
        in: scheme.in,
        description: scheme.description
      });
    }
  }

  return authMethods;
}

function generateJavaScriptSdk(spec) {
  const baseUrl = getBaseUrl(spec);
  const methods = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const operationId = operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`;

        methods.push({
          name: operationId,
          signature: generateJsMethodSignature(operation),
          example: generateJsExample(method, path, operation, baseUrl)
        });
      }
    }
  }

  return {
    className: 'ApiClient',
    methods: methods,
    baseUrl: baseUrl,
    dependencies: ['axios'],
    exampleUsage: generateJsUsageExample(baseUrl, methods[0])
  };
}

function generateJsMethodSignature(operation) {
  const params = [];

  // Add path parameters
  const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
  pathParams.forEach(param => {
    params.push(`${param.name}`);
  });

  // Add query parameters
  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  if (queryParams.length > 0) {
    params.push('params = {}');
  }

  // Add request body
  if (operation.requestBody) {
    params.push('data = null');
  }

  return `(${params.join(', ')})`;
}

function generateJsExample(method, path, operation, baseUrl) {
  const operationId = operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`;
  const url = baseUrl + path.replace(/{([^}]+)}/g, '${$1}');

  return `// Example usage
const result = await api.${operationId}(${getJsExampleArgs(operation)});
console.log(result);`;
}

function getJsExampleArgs(operation) {
  const args = [];

  // Add path parameter examples
  const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
  pathParams.forEach(param => {
    const example = param.example || `"${param.name}Value"`;
    args.push(example);
  });

  // Add query parameters example
  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  if (queryParams.length > 0) {
    const paramObj = {};
    queryParams.forEach(param => {
      paramObj[param.name] = param.example || `"${param.name}Value"`;
    });
    args.push(JSON.stringify(paramObj));
  }

  // Add request body example
  if (operation.requestBody && operation.requestBody.content) {
    for (const [contentType, content] of Object.entries(operation.requestBody.content)) {
      if (content.schema && content.schema.example) {
        args.push(JSON.stringify(content.schema.example));
      } else {
        args.push('{}');
      }
      break; // Use first content type
    }
  }

  return args.join(', ');
}

function generatePythonSdk(spec) {
  const baseUrl = getBaseUrl(spec);
  const methods = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const operationId = operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`;

        methods.push({
          name: snakeCase(operationId),
          signature: generatePythonMethodSignature(operation),
          example: generatePythonExample(method, path, operation, baseUrl)
        });
      }
    }
  }

  return {
    className: 'ApiClient',
    methods: methods,
    baseUrl: baseUrl,
    dependencies: ['requests'],
    exampleUsage: generatePythonUsageExample(baseUrl, methods[0])
  };
}

function generatePythonMethodSignature(operation) {
  const params = ['self'];

  // Add path parameters
  const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
  pathParams.forEach(param => {
    params.push(param.name);
  });

  // Add query parameters
  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  if (queryParams.length > 0) {
    params.push('params=None');
  }

  // Add request body
  if (operation.requestBody) {
    params.push('data=None');
  }

  return `(${params.join(', ')})`;
}

function generatePythonExample(method, path, operation, baseUrl) {
  const operationId = snakeCase(operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`);

  return `# Example usage
result = client.${operationId}(${getPythonExampleArgs(operation)})
print(result)`;
}

function getPythonExampleArgs(operation) {
  const args = [];

  // Add path parameter examples
  const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
  pathParams.forEach(param => {
    const example = param.example || f"`{param.name}_value`";
    args.push(example);
  });

  // Add query parameters example
  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  if (queryParams.length > 0) {
    const paramDict = {};
    queryParams.forEach(param => {
      paramDict[param.name] = param.example || f"`{param.name}_value`";
    });
    args.push(JSON.stringify(paramDict));
  }

  // Add request body example
  if (operation.requestBody && operation.requestBody.content) {
    for (const [contentType, content] of Object.entries(operation.requestBody.content)) {
      if (content.schema && content.schema.example) {
        args.push(JSON.stringify(content.schema.example));
      } else {
        args.push('{}');
      }
      break;
    }
  }

  return args.join(', ');
}

function generateJavaSdk(spec) {
  const baseUrl = getBaseUrl(spec);
  const methods = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const operationId = camelCase(operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`);

        methods.push({
          name: operationId,
          signature: generateJavaMethodSignature(operation),
          example: generateJavaExample(method, path, operation, baseUrl)
        });
      }
    }
  }

  return {
    className: 'ApiClient',
    methods: methods,
    baseUrl: baseUrl,
    dependencies: ['org.apache.httpcomponents:httpclient:4.5.13'],
    exampleUsage: generateJavaUsageExample(baseUrl, methods[0])
  };
}

function generateJavaMethodSignature(operation) {
  const params = [];

  // Add path parameters
  const pathParams = (operation.parameters || []).filter(p => p.in === 'path');
  pathParams.forEach(param => {
    params.push(`String ${param.name}`);
  });

  // Add query parameters
  const queryParams = (operation.parameters || []).filter(p => p.in === 'query');
  if (queryParams.length > 0) {
    params.push('Map<String, Object> params');
  }

  // Add request body
  if (operation.requestBody) {
    params.push('Object data');
  }

  // Add return type
  let returnType = 'Object';
  if (operation.responses && operation.responses['200']) {
    returnType = 'Object'; // In a real implementation, this would be more specific
  }

  return `${returnType} ${params.join(', ')})`;
}

function generateCSharpSdk(spec) {
  const baseUrl = getBaseUrl(spec);
  const methods = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
        const operationId = pascalCase(operation.operationId || `${method}_${path.replace(/[\/{}]/g, '_')}`);

        methods.push({
          name: operationId,
          signature: generateCSharpMethodSignature(operation),
          example: generateCSharpExample(method, path, operation, baseUrl)
        });
      }
    }
  }

  return {
    className: 'ApiClient',
    methods: methods,
    baseUrl: baseUrl,
    dependencies: ['System.Net.Http', 'Newtonsoft.Json'],
    exampleUsage: generateCSharpUsageExample(baseUrl, methods[0])
  };
}

function snakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
}

function camelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function pascalCase(str) {
  return camelCase(str).charAt(0).toUpperCase() + camelCase(str).slice(1);
}

function generateJsUsageExample(baseUrl, firstMethod) {
  return `// Initialize the API client
const api = new ApiClient('${baseUrl}');

// Make authenticated requests
api.setAuthToken('your-api-token');

// Call API methods
const result = await api.${firstMethod ? firstMethod.name : 'someMethod'}();`;
}

function generatePythonUsageExample(baseUrl, firstMethod) {
  return `# Initialize the API client
client = ApiClient('${baseUrl}')

# Make authenticated requests
client.set_auth_token('your-api-token')

# Call API methods
result = client.${firstMethod ? firstMethod.name : 'some_method'}()`;
}

function generateJavaUsageExample(baseUrl, firstMethod) {
  return `// Initialize the API client
ApiClient client = new ApiClient("${baseUrl}");

// Make authenticated requests
client.setAuthToken("your-api-token");

// Call API methods
Object result = client.${firstMethod ? firstMethod.name : 'someMethod'}();`;
}

function generateCSharpUsageExample(baseUrl, firstMethod) {
  return `// Initialize the API client
var client = new ApiClient("${baseUrl}");

// Make authenticated requests
client.SetAuthToken("your-api-token");

// Call API methods
var result = await client.${firstMethod ? firstMethod.name : 'SomeMethod'}();`;
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node generate-sdk-docs.js <openapi-spec-path>');
  console.log('Note: This script expects a valid OpenAPI/Swagger JSON specification file');
  process.exit(1);
}

const specPath = process.argv[2];
try {
  const sdkDocs = generateSdkDocs(specPath);

  console.log('=== SDK DOCUMENTATION GENERATION ===\n');

  console.log('Supported Languages:');
  for (const [lang, info] of Object.entries(sdkDocs.languages)) {
    console.log(`- ${lang}: ${info.methods.length} methods`);
  }

  console.log(`\nBase URL: ${sdkDocs.baseUrl}`);

  console.log('\nAuthentication Methods:');
  sdkDocs.authMethods.forEach(auth => {
    console.log(`- ${auth.name}: ${auth.type} ${auth.scheme || ''}`);
  });

  console.log('\nFirst few API methods:');
  sdkDocs.methods.slice(0, 3).forEach(method => {
    console.log(`- ${method.method} ${method.path}: ${method.summary || 'No summary'}`);
  });

  // Save SDK documentation
  const outputDir = path.dirname(specPath);
  const outputPath = path.join(outputDir, 'sdk-documentation.json');
  fs.writeFileSync(outputPath, JSON.stringify(sdkDocs, null, 2));

  // Generate language-specific documentation files
  for (const [lang, langInfo] of Object.entries(sdkDocs.languages)) {
    const langPath = path.join(outputDir, `sdk-${lang}.md`);
    const langDoc = generateLanguageSdkDoc(lang, langInfo);
    fs.writeFileSync(langPath, langDoc);
  }

  console.log(`\nSDK documentation generated successfully!`);
  console.log(`- Main SDK docs: ${outputPath}`);
  for (const lang of Object.keys(sdkDocs.languages)) {
    console.log(`- ${lang} SDK guide: ${outputDir}/sdk-${lang}.md`);
  }

} catch (error) {
  console.error('SDK documentation generation failed:', error.message);
  process.exit(1);
}

function generateLanguageSdkDoc(language, info) {
  let doc = `# ${info.className} SDK for ${language.charAt(0).toUpperCase() + language.slice(1)}\n\n`;

  doc += `## Installation\n\n`;
  if (info.dependencies.length > 0) {
    if (language === 'javascript') {
      doc += `\`\`\`bash\nnpm install ${info.dependencies.join(' ')}\n\`\`\`\n\n`;
    } else if (language === 'python') {
      doc += `\`\`\`bash\npip install ${info.dependencies.join(' ')}\n\`\`\`\n\n`;
    }
  }

  doc += `## Initialization\n\n`;
  doc += `\`\`\`${language}\n${info.exampleUsage}\n\`\`\`\n\n`;

  doc += `## Available Methods\n\n`;
  info.methods.forEach(method => {
    doc += `- \`${method.name}${method.signature}\`: ${method.example}\n\n`;
  });

  return doc;
}