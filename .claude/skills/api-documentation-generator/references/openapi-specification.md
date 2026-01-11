# OpenAPI Specification Guidelines

## OpenAPI Document Structure

```yaml
openapi: 3.0.3
info:
  title: Sample API
  description: Description of the API
  version: 1.0.0
servers:
  - url: https://api.example.com/v1
    description: Production server
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          format: int64
        name:
          type: string
      required:
        - id
        - name
```

## Info Object Properties

Required properties:
- `title` - API title
- `version` - API version

Optional properties:
- `description` - API description
- `termsOfService` - URL to terms of service
- `contact` - Contact information
- `license` - License information

## Paths Object

Path templating:
```yaml
/users/{userId}/orders/{orderId}
```

HTTP methods supported:
- `get`, `put`, `post`, `delete`, `options`, `head`, `patch`, `trace`

## Parameters

Parameter locations:
- `query` - Query parameters
- `header` - Header parameters
- `path` - Path parameters (required)
- `cookie` - Cookie parameters

Example:
```yaml
parameters:
  - name: userId
    in: path
    required: true
    schema:
      type: integer
      format: int64
```

## Request Bodies

```yaml
requestBody:
  description: User object
  required: true
  content:
    application/json:
      schema:
        $ref: '#/components/schemas/User'
```

## Responses

```yaml
responses:
  '200':
    description: Success
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
  '400':
    $ref: '#/components/responses/InvalidRequest'
```

## Data Types

Primitive types:
- `string` - String type
- `number` - Number type
- `integer` - Integer type
- `boolean` - Boolean type
- `array` - Array type
- `object` - Object type

## Schema Validation Keywords

For strings:
- `maxLength`, `minLength` - Length constraints
- `pattern` - Regular expression pattern
- `format` - Semantic format

For numbers:
- `maximum`, `minimum` - Value constraints
- `exclusiveMaximum`, `exclusiveMinimum`
- `multipleOf` - Multiples constraint

For arrays:
- `maxItems`, `minItems` - Item count constraints
- `uniqueItems` - Uniqueness requirement

For objects:
- `maxProperties`, `minProperties` - Property count constraints
- `required` - Required property names

## Security Schemes

HTTP authentication:
```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

API key authentication:
```yaml
components:
  securitySchemes:
    apiKey:
      type: apiKey
      in: header
      name: X-API-Key
```

OAuth2:
```yaml
components:
  securitySchemes:
    oauth2:
      type: oauth2
      flows:
        implicit:
          authorizationUrl: https://api.example.com/oauth/authorize
          scopes:
            read: Read access
            write: Write access
```

## Best Practices

1. Use descriptive operation IDs
2. Provide detailed descriptions
3. Include example values
4. Define proper response codes
5. Use consistent naming conventions
6. Leverage $ref for reusable components
7. Validate against the specification