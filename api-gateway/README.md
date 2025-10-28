# API Gateway

## Service Description

The API Gateway acts as the single entry point for all client requests to the PeerPrep platform. It handles authentication, authorization, request routing, and proxying to downstream microservices. The gateway verifies JWT tokens, enforces role-based access control, and forwards authenticated user information to backend services.

## Architecture and Dependencies

### Core Technologies
- **Express.js**
- **express-jwt**
- **http-proxy-middleware**
- **cookie-parser**
- **cors**
- **TypeScript**

### Dependencies
- **Shared Package** - Common types and interfaces (JwtRequest, UserRole, etc.)
- **User Service**
- **Question Service**
- **Matching Service**
- **Collaboration Service**

### Key Features
- **Centralized Authentication**: JWT token verification at the gateway level
- **Role-Based Authorization**: Route protection based on user roles (USER, ADMIN)
- **Request Proxying**: Forwards authenticated requests to appropriate microservices
- **Header Injection**: Passes user information (`x-user-id`, `x-user-role`) to downstream services
- **WebSocket Support**: Proxies WebSocket connections for real-time features

## Environment Variables

This service uses environment variables from the root `.env` file:

```bash
# Service Ports
API_GATEWAY_PORT=4000                             # Port for API Gateway

# Service Base URLs (for proxying to downstream services)
USER_SERVICE_BASE_URL=http://localhost:3001       # User service endpoint
QUESTION_SERVICE_BASE_URL=http://localhost:3003   # Question service endpoint
MATCHING_SERVICE_BASE_URL=http://localhost:3002   # Matching service endpoint
COLLABORATION_SERVICE_BASE_URL=http://localhost:3004  # Collaboration service endpoint

# CORS Configuration
UI_BASE_URL=http://localhost:3000                 # Frontend URL for CORS policy

# JWT Configuration
JWT_ACCESS_SECRET=<your-secret-key>               # Secret for verifying JWT access tokens
```

## Development Notes

- The gateway does not store any data; it only routes requests
- JWT tokens are verified at the gateway level before proxying to services
- User information is extracted from JWT and passed via headers (`x-user-id`, `x-user-role`)
- WebSocket connections are upgraded and proxied to appropriate services
- CORS is configured to allow requests from the UI frontend only
- All routes are protected by default unless explicitly marked as public