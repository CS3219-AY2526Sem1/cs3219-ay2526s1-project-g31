# API Gateway

The API Gateway acts as a single entry point for all client requests, handling authentication, authorization, and routing to downstream microservices.

## Features

- **Centralized Authentication**: JWT token verification happens at the gateway level
- **Role-Based Authorization**: Routes are protected based on user roles (USER, ADMIN)
- **Request Proxying**: Forwards authenticated requests to appropriate microservices
- **Header Injection**: Passes user information to downstream services via headers