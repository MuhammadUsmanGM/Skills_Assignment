# API Security Schemes

## Authentication Methods

### API Key Authentication
API keys are simple token-based authentication for identifying applications or users.

#### Header-based API Keys
```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key passed in header
```

#### Query Parameter API Keys
```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: query
      name: apiKey
      description: API key passed as query parameter
```

#### Cookie-based API Keys
```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: cookie
      name: sessionId
      description: Session ID stored in cookie
```

### HTTP Authentication

#### Bearer Token (JWT)
```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token for authentication
```

#### Basic Authentication
```yaml
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
      description: Basic authentication with username/password
```

#### Digest Authentication
```yaml
components:
  securitySchemes:
    DigestAuth:
      type: http
      scheme: digest
      description: Digest authentication (more secure than basic)
```

### OAuth 2.0 Flows

#### Authorization Code Flow
```yaml
components:
  securitySchemes:
    OAuth2AuthCode:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          refreshUrl: https://example.com/oauth/refresh
          scopes:
            read: Read access
            write: Write access
            admin: Administrative access
```

#### Client Credentials Flow
```yaml
components:
  securitySchemes:
    OAuth2ClientCredentials:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Read access
            write: Write access
```

#### Implicit Flow
```yaml
components:
  securitySchemes:
    OAuth2Implicit:
      type: oauth2
      flows:
        implicit:
          authorizationUrl: https://example.com/oauth/authorize
          scopes:
            read: Read access
            write: Write access
```

#### Password Flow
```yaml
components:
  securitySchemes:
    OAuth2Password:
      type: oauth2
      flows:
        password:
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Read access
            write: Write access
```

### OpenID Connect
```yaml
components:
  securitySchemes:
    OpenID:
      type: openIdConnect
      openIdConnectUrl: https://example.com/.well-known/openid_configuration
```

## Security Application Patterns

### Global Security Requirement
```yaml
openapi: 3.0.0
info:
  title: Secure API
  version: 1.0.0
security:
  - BearerAuth: []
paths:
  /users:
    get:
      # This endpoint inherits global security requirement
      responses:
        '200':
          description: OK
```

### Per-Operation Security
```yaml
paths:
  /public-data:
    get:
      security: []  # No security required
      responses:
        '200':
          description: Public data
  /private-data:
    get:
      security:
        - BearerAuth: [read]
      responses:
        '200':
          description: Private data
  /admin-data:
    get:
      security:
        - BearerAuth: [admin]
      responses:
        '200':
          description: Admin data
```

### Multiple Security Options
```yaml
paths:
  /secure-endpoint:
    get:
      security:
        - BearerAuth: []
        - ApiKeyAuth: []
      responses:
        '200':
          description: Secured data
```

### Combining Multiple Requirements
```yaml
paths:
  /critical-endpoint:
    get:
      security:
        - BearerAuth: [admin]
        - ApiKeyAuth: []
      responses:
        '200':
          description: Critical data
```

## Security Best Practices

### API Key Security
- Rotate API keys regularly
- Use different keys for different applications
- Implement rate limiting per key
- Log and monitor API key usage
- Set appropriate expiration dates

### JWT Security
- Use strong signing algorithms (RS256 preferred over HS256)
- Implement proper token expiration
- Use short-lived access tokens with refresh tokens
- Validate all claims properly
- Implement token blacklisting for revocation

### OAuth 2.0 Security
- Always use HTTPS
- Implement PKCE for public clients
- Validate redirect URIs
- Use state parameter to prevent CSRF
- Implement proper scope validation

### Rate Limiting Headers
```yaml
# Include rate limiting information in responses
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

### Security Headers
```yaml
# Recommended security headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Security Documentation Guidelines

### Clear Authentication Instructions
Document exactly how to authenticate:

```
Authentication:
To access this API, you must include a valid Bearer token in the Authorization header:
Authorization: Bearer YOUR_TOKEN_HERE
```

### Scope Explanations
Clearly explain what each scope allows:
```
Scopes:
- read: Allows reading data
- write: Allows creating/updating data
- delete: Allows deleting data
- admin: Full administrative access
```

### Error Responses
Document authentication-related error responses:
```
HTTP 401 Unauthorized: Invalid or missing authentication
HTTP 403 Forbidden: Insufficient permissions for requested action
HTTP 429 Too Many Requests: Rate limit exceeded
```

### Security Testing
- Test authentication bypasses
- Validate authorization boundaries
- Check for privilege escalation
- Verify token expiration handling
- Test for secure transport requirements