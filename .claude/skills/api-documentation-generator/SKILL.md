---
name: api-documentation-generator
description: Automated API documentation generation with support for OpenAPI/Swagger specifications, endpoint analysis, request/response examples, authentication methods, rate limiting, and integration guides. Use when Claude needs to generate API documentation, analyze existing APIs, create specification files, or produce developer-friendly documentation.
---

# API Documentation Generator

## Overview
This skill automates the creation and maintenance of comprehensive API documentation with support for industry-standard formats and developer-friendly presentation.

## When to Use This Skill
- Generating OpenAPI/Swagger specifications from code
- Creating API documentation from existing endpoints
- Updating documentation to match API changes
- Producing developer guides and integration tutorials
- Analyzing API contracts and dependencies
- Converting API specifications between formats

## Supported Formats
- OpenAPI 3.0/3.1 (formerly Swagger)
- RAML
- API Blueprint
- Postman Collections
- GraphQL Schema Definition Language

## Documentation Components

### API Information
- Title and description
- Version information
- Contact details
- License information
- Terms of service

### Endpoints
- HTTP method and path
- Path, query, and header parameters
- Request body schema
- Response schema and status codes
- Example requests and responses
- Authentication requirements

### Security
- Authentication schemes (API keys, OAuth, JWT)
- Authorization scopes
- Security requirements per endpoint
- Rate limiting information

### Advanced Features
- Server definitions and variables
- Tags for organizing endpoints
- External documentation links
- Callback definitions
- Link relations

## Best Practices

### Writing Effective Descriptions
- Use clear, concise language
- Explain purpose and behavior
- Document side effects
- Specify business context
- Include usage examples

### Parameter Documentation
- Specify data types and constraints
- Indicate required vs optional
- Document default values
- Explain validation rules
- Include example values

### Response Documentation
- Detail all possible status codes
- Document error response formats
- Specify success and failure cases
- Include example payloads
- Explain response headers

## Generation Process

### 1. API Analysis
- Scan source code for endpoints
- Extract route definitions
- Identify request/response schemas
- Map authentication methods

### 2. Specification Creation
- Generate OpenAPI specification
- Validate against standards
- Add descriptions and examples
- Organize endpoints by tags

### 3. Documentation Generation
- Create human-readable documentation
- Generate interactive API explorer
- Produce client SDK documentation
- Build integration guides

## Quality Assurance
- Verify all endpoints are documented
- Check for consistent naming
- Validate example requests/responses
- Ensure security schemes are clear
- Confirm all parameters are documented

## Integration Guides
- Authentication setup
- Error handling patterns
- Rate limiting considerations
- Common use case examples
- Troubleshooting tips

## Scripts Available
- `scripts/generate-openapi.js` - Generate OpenAPI spec from code
- `scripts/validate-spec.js` - Validate API specification
- `scripts/export-docs.js` - Export documentation in various formats
- `scripts/check-completeness.js` - Verify documentation completeness

## References
- `references/openapi-specification.md` - Complete OpenAPI specification guidelines and best practices
- `references/documentation-best-practices.md` - API documentation best practices and writing guidelines