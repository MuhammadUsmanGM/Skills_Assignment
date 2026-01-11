#!/usr/bin/env node
// Script to extract and document data schemas from code

const fs = require('fs');
const path = require('path');

function extractSchemas(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const schemas = {
    requestSchemas: [],
    responseSchemas: [],
    dataModels: [],
    validationRules: []
  };

  // Look for common schema definition patterns
  const schemaPatterns = {
    // JS/TS interfaces and types
    interfaces: /interface\s+(\w+)\s*{([\s\S]*?)}/g,
    types: /type\s+(\w+)\s*=([\s\S]*?)(?=\n\s*(?:}|;))/g,

    // JS/TS classes
    classes: /class\s+(\w+)[\s\S]*?{([\s\S]*?)(?=^\s*})/gm,

    // Validation schemas (Express-validator, Joi, Yup, etc.)
    validators: [
      /body\(([^)]+)\)/g,
      /check\(([^)]+)\)/g,
      /joi\.[^(]+\([^)]+\)/g,
      /yup\.[^(]+\([^)]+\)/g
    ],

    // DTO patterns
    dtos: /dto[s]?[:\s]+([^{]*{[\s\S]*?})/gi,

    // Model definitions (various frameworks)
    models: [
      /sequelize\.define\(\s*['"`]([^'"`]+)['"`]\s*,\s*({[\s\S]*?})\s*,/g,
      /mongoose\.schema\(\s*({[\s\S]*?})\s*\)/g,
      /@entity\s*@table\s*class\s+(\w+)/gi
    ]
  };

  // Extract interfaces
  let match;
  while ((match = schemaPatterns.interfaces.exec(content)) !== null) {
    const name = match[1];
    const body = match[2];
    schemas.dataModels.push({
      name: name,
      type: 'interface',
      definition: body.trim(),
      properties: extractProperties(body),
      line: getLineNumber(content, match.index)
    });
  }

  // Extract types
  while ((match = schemaPatterns.types.exec(content)) !== null) {
    const name = match[1];
    const definition = match[2];
    schemas.dataModels.push({
      name: name,
      type: 'type',
      definition: definition.trim(),
      properties: extractProperties(definition),
      line: getLineNumber(content, match.index)
    });
  }

  // Extract validation rules
  for (const validatorPattern of schemaPatterns.validators) {
    while ((match = validatorPattern.exec(content)) !== null) {
      schemas.validationRules.push({
        rule: match[1]?.trim() || match[0],
        line: getLineNumber(content, match.index)
      });
    }
  }

  // Extract models
  for (const modelPattern of schemaPatterns.models) {
    while ((match = modelPattern.exec(content)) !== null) {
      const name = match[1] || 'UnknownModel';
      const definition = match[2] || '';

      schemas.dataModels.push({
        name: name,
        type: 'model',
        definition: definition.trim(),
        properties: extractProperties(definition),
        line: getLineNumber(content, match.index)
      });
    }
  }

  return schemas;
}

function extractProperties(schemaText) {
  const properties = [];

  // Look for property patterns in schema definition
  const propPattern = /(\w+)\s*[?:]\s*([^{]*?)(?:[;,]|$)/g;
  let propMatch;

  while ((propMatch = propPattern.exec(schemaText)) !== null) {
    const name = propMatch[1];
    let type = propMatch[2].trim();

    // Clean up type definition
    type = type.replace(/\s+/g, ' ').trim();

    properties.push({
      name: name,
      type: type,
      required: !propMatch[0].includes('?')
    });
  }

  return properties;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function generateJsonSchema(dataModel) {
  const schema = {
    type: "object",
    properties: {},
    required: []
  };

  dataModel.properties.forEach(prop => {
    schema.properties[prop.name] = getTypeDefinition(prop.type);
    if (prop.required) {
      schema.required.push(prop.name);
    }
  });

  return schema;
}

function getTypeDefinition(typeStr) {
  // Convert common TypeScript/JSDoc types to JSON Schema types
  const typeMap = {
    'string': { type: 'string' },
    'number': { type: 'number' },
    'boolean': { type: 'boolean' },
    'Date': { type: 'string', format: 'date-time' },
    'any': { type: 'object' },
    'object': { type: 'object' },
    'array': { type: 'array', items: {} }
  };

  // Handle basic types
  if (typeMap[typeStr]) {
    return typeMap[typeStr];
  }

  // Handle arrays: string[], number[], etc.
  if (typeStr.endsWith('[]')) {
    const baseType = typeStr.slice(0, -2);
    return {
      type: 'array',
      items: getTypeDefinition(baseType)
    };
  }

  // Handle unions: string | number
  if (typeStr.includes(' | ')) {
    const unionTypes = typeStr.split(' | ').map(t => t.trim());
    return {
      anyOf: unionTypes.map(t => getTypeDefinition(t))
    };
  }

  // Default to object
  return { type: 'object' };
}

// Main execution
if (process.argv.length < 3) {
  console.error('Usage: node extract-schemas.js <source-file-path>');
  process.exit(1);
}

const sourcePath = process.argv[2];
try {
  const schemas = extractSchemas(sourcePath);

  console.log('=== SCHEMA EXTRACTION RESULTS ===\n');

  console.log(`Found ${schemas.dataModels.length} data models:`);
  schemas.dataModels.forEach(model => {
    console.log(`\nModel: ${model.name} (${model.type}) - Line ${model.line}`);
    console.log('Properties:');
    model.properties.forEach(prop => {
      console.log(`  ${prop.name}${prop.required ? '' : '?'}: ${prop.type}`);
    });

    // Generate and show JSON Schema
    console.log('JSON Schema:');
    console.log(JSON.stringify(generateJsonSchema(model), null, 2));
  });

  console.log(`\nFound ${schemas.validationRules.length} validation rules:`);
  schemas.validationRules.forEach(rule => {
    console.log(`  Line ${rule.line}: ${rule.rule}`);
  });

  // Save extracted schemas to file
  const outputPath = sourcePath.replace(/\.[^/.]+$/, '') + '-schemas.json';
  fs.writeFileSync(outputPath, JSON.stringify(schemas, null, 2));
  console.log(`\nAll schemas saved to: ${outputPath}`);

} catch (error) {
  console.error('Schema extraction failed:', error.message);
  process.exit(1);
}