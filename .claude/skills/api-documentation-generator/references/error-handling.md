# API Error Handling Patterns

## HTTP Status Code Guidelines

### 2xx Success
- `200 OK` - Standard response for successful requests
- `201 Created` - Request fulfilled and new resource created
- `202 Accepted` - Request accepted for processing, not completed
- `204 No Content` - Request successful, no content to return

### 4xx Client Errors
- `400 Bad Request` - Request malformed or invalid
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource does not exist
- `405 Method Not Allowed` - HTTP method not allowed for resource
- `409 Conflict` - Request conflicts with current state
- `422 Unprocessable Entity` - Well-formed but semantically invalid
- `429 Too Many Requests` - Rate limit exceeded

### 5xx Server Errors
- `500 Internal Server Error` - Generic server error
- `502 Bad Gateway` - Invalid response from upstream server
- `503 Service Unavailable` - Server temporarily unavailable
- `504 Gateway Timeout` - Upstream server timeout

## Error Response Formats

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request data is invalid",
    "details": [
      {
        "field": "email",
        "issue": "Invalid email format"
      }
    ],
    "timestamp": "2023-01-01T12:00:00Z",
    "requestId": "req-12345"
  }
}
```

### RFC 7807 Problem Details
```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation Failed",
  "status": 422,
  "detail": "The request data is invalid",
  "instance": "/users",
  "errors": [
    {
      "field": "email",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

### Simplified Error Format
```json
{
  "message": "User not found",
  "status": 404,
  "code": "USER_NOT_FOUND"
}
```

## Common Error Categories

### Validation Errors
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "value": "invalid-email"
      },
      {
        "field": "age",
        "message": "Must be greater than 0",
        "value": -5
      }
    ]
  }
}
```

### Authentication Errors
```json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid authentication credentials",
    "details": {
      "reason": "token_expired"
    }
  }
}
```

### Authorization Errors
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to access this resource",
    "details": {
      "required_scope": "admin",
      "actual_scopes": ["read"]
    }
  }
}
```

### Resource Errors
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {
      "resource_type": "user",
      "resource_id": "12345"
    }
  }
}
```

## Framework-Specific Error Handling

### Express.js Error Handling
```javascript
// Error middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(errorResponse);
});

// Custom error classes
class ValidationError extends Error {
  constructor(message, fieldErrors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 422;
    this.code = 'VALIDATION_ERROR';
    this.fieldErrors = fieldErrors;
  }
}
```

### Spring Boot Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex) {

        List<FieldErrorDetail> fieldErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> new FieldErrorDetail(
                error.getField(),
                error.getDefaultMessage(),
                error.getRejectedValue()))
            .collect(Collectors.toList());

        ErrorResponse errorResponse = ErrorResponse.builder()
            .code("VALIDATION_ERROR")
            .message("Validation failed")
            .details(fieldErrors)
            .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }
}
```

### ASP.NET Core Error Handling
```csharp
public class ErrorDetails
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string TraceId { get; set; }
}

public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;

    public ErrorHandlerMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception error)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorDetails();

            switch (error)
            {
                case AppException e:
                    response.StatusCode = (int)HttpStatusCode.BadRequest;
                    errorResponse.Message = e.Message;
                    break;
                case NotFoundException e:
                    response.StatusCode = (int)HttpStatusCode.NotFound;
                    errorResponse.Message = e.Message;
                    break;
                default:
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.Message = "Internal server error";
                    break;
            }

            errorResponse.StatusCode = response.StatusCode;
            errorResponse.TraceId = Activity.Current?.Id ?? context.TraceIdentifier;

            var result = JsonSerializer.Serialize(errorResponse);
            await response.WriteAsync(result);
        }
    }
}
```

## Rate Limiting Errors

### Standard Rate Limit Headers
```
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1609459200
```

### Rate Limit Error Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again later.",
    "details": {
      "retry_after_seconds": 3600,
      "limit": 100,
      "time_window": "1 hour"
    }
  }
}
```

## Error Documentation Best Practices

### Document All Possible Errors
```yaml
paths:
  /users/{id}:
    get:
      responses:
        '200':
          description: User retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: Invalid user ID provided
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Authentication required
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Insufficient permissions
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: User not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: Rate limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
```

### Consistent Error Format
- Use the same error response structure across all endpoints
- Maintain consistent field names and types
- Document the error format in the API specification
- Provide examples for each error type

### Error Hierarchy
```
Application Error
├── Validation Error
│   ├── Field Validation Error
│   └── Business Rule Error
├── Authentication Error
├── Authorization Error
├── Resource Error
│   ├── Not Found Error
│   └── Conflict Error
└── System Error
    ├── Database Error
    ├── Network Error
    └── Internal Error
```

## Error Monitoring and Logging

### Error Classification
- Transient errors (retryable)
- Permanent errors (not retryable)
- System errors vs. client errors
- Business logic errors vs. technical errors

### Error Context Information
- Request ID for tracing
- Timestamp of error
- User information (when appropriate)
- Request details (method, path, headers)
- Stack trace (in development only)

### Retry Logic
- Exponential backoff for transient errors
- Maximum retry attempts
- Circuit breaker patterns
- Idempotent operation handling