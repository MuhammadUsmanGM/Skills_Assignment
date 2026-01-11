# Security Checklist for Code Reviews

## Authentication & Authorization
- [ ] Verify proper authentication is implemented
- [ ] Check that authorization is enforced on all sensitive operations
- [ ] Ensure role-based access controls are properly implemented
- [ ] Validate that permissions are checked server-side
- [ ] Verify secure session management

## Input Validation
- [ ] All user inputs are validated on the server-side
- [ ] Input sanitization is applied where appropriate
- [ ] Maximum input lengths are enforced
- [ ] Regular expressions are properly escaped
- [ ] File uploads are validated for type and size

## SQL Injection Prevention
- [ ] Prepared statements or parameterized queries are used
- [ ] Stored procedures are used appropriately
- [ ] ORM frameworks are configured securely
- [ ] Dynamic queries are avoided

## Cross-Site Scripting (XSS) Prevention
- [ ] Output encoding is applied to all dynamic content
- [ ] Content Security Policy headers are set
- [ ] Untrusted data is properly sanitized before insertion
- [ ] Template engines escape output by default

## Cross-Site Request Forgery (CSRF) Protection
- [ ] Anti-CSRF tokens are implemented
- [ ] SameSite cookies are used where appropriate
- [ ] State-changing operations require additional validation

## Cryptography
- [ ] Strong, well-vetted algorithms are used
- [ ] Keys are properly managed and stored
- [ ] Passwords are hashed with salt using bcrypt/scrypt/PBKDF2
- [ ] Encryption is applied to sensitive data at rest and in transit

## Error Handling
- [ ] Error messages don't leak sensitive information
- [ ] Stack traces are not exposed to users
- [ ] Logging doesn't capture sensitive data

## Dependencies
- [ ] Third-party libraries are up-to-date
- [ ] Known vulnerabilities in dependencies are addressed
- [ ] Only trusted sources for dependencies are used

## Data Protection
- [ ] Personal data is handled according to privacy regulations
- [ ] Data retention policies are followed
- [ ] PII is encrypted when stored
- [ ] Secure protocols (HTTPS/TLS) are used for data transmission