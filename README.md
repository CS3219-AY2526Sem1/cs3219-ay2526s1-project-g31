[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/QUdQy4ix)
# CS3219 Project (PeerPrep) - AY2526S1
## Group: G31

## Project Overview
PeerPrep is a collaborative technical interview preparation platform that enables users to practice coding questions together in real-time. The application uses a microservices architecture to provide user authentication, question management, peer matching, and real-time collaboration features.

## Architecture and Dependencies

### Microservices Architecture
- **API Gateway** - Entry point for all client requests, handles routing and JWT authentication
- **User Service** - Manages user authentication, profiles, and sessions using Google OAuth
- **Question Service** - Handles CRUD operations for coding questions
- **Matching Service** - WebSocket-based service for real-time peer matching
- **Collaboration Service** - Enables real-time collaborative coding sessions
- **UI** - Next.js frontend application
- **Shared** - Common TypeScript types and interfaces shared across services

### Technology Stack
- **Runtime**: Node.js with TypeScript
- **Web Framework**: Express.js
- **Frontend**: Next.js
- **Databases**: MongoDB, Redis
- **ORM**: Prisma
- **Real-time Communication**: Socket.IO
- **Authentication**: JWT tokens with Google OAuth 2.0
- **API Gateway**: http-proxy-middleware with express-jwt
- **Containerization**: Docker

## Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

### Service Ports
```bash
UI_PORT=3000                          # Frontend Next.js application port
USER_SERVICE_PORT=3001                # User authentication service port
MATCHING_SERVICE_PORT=3002            # Peer matching service port
QUESTION_SERVICE_PORT=3003            # Question management service port
COLLABORATION_SERVICE_PORT=3004       # Real-time collaboration service port
API_GATEWAY_PORT=4000                 # API Gateway port (main entry point)
```

### Service Base URLs
```bash
UI_BASE_URL=http://localhost:3000                     # Frontend URL
USER_SERVICE_BASE_URL=http://localhost:3001           # User service internal URL
MATCHING_SERVICE_BASE_URL=http://localhost:3002       # Matching service internal URL
QUESTION_SERVICE_BASE_URL=http://localhost:3003       # Question service internal URL
COLLABORATION_SERVICE_BASE_URL=http://localhost:3004  # Collaboration service internal URL
API_GATEWAY_BASE_URL=http://localhost:4000            # API Gateway URL for clients
```

### Redis Configuration
```bash
REDIS_HOST=localhost                  # Redis host (use "redis" for docker)
REDIS_PORT=6379                       # Redis port
REDIS_PASSWORD=password               # Redis password
```

### JWT Secrets
```bash
JWT_ACCESS_SECRET=<your-secret-key>   # Secret for signing JWT access tokens
JWT_REFRESH_SECRET=<your-secret-key>  # Secret for signing JWT refresh tokens
```

**Note**: Generate strong random secrets for JWT tokens in production.

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Docker
- MongoDB instance (local)
- Redis instance (local)
- Google OAuth 2.0 credentials

### Local Development Setup

1. **Install Yarn globally** (if not already installed):
   ```bash
   npm install -g yarn
   ```

2. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd cs3219-ay2526s1-project-g31
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build and install shared package** (required first):
   ```bash
   cd shared
   yarn install
   yarn build
   cd ..
   ```

5. **Install dependencies for each service**:
   ```bash
   # Run this in each service directory
   cd api-gateway && yarn shared && yarn install && cd ..
   cd user-service && yarn shared && yarn install && cd ..
   cd question-service && yarn shared && yarn install && cd ..
   cd matching-service && yarn shared && yarn install && cd ..
   cd collaboration-service && yarn shared && yarn install && cd ..
   cd ui && yarn shared && yarn install && cd ..
   ```

6. **Set up databases**:
   - Start MongoDB and Redis (see `db/README.md` for Docker setup)
   - Configure connection strings in each service's `.env` file

7. **Run Prisma migrations** (for User and Question services):
   ```bash
   cd user-service && npx prisma generate && npx prisma db push && cd ..
   cd question-service && npx prisma generate && npx prisma db push && cd ..
   ```

8. **Run for development**:
   ```bash
   # In each service directory
   yarn dev
   ```

9. **Build for production**:
   ```bash
   # In each service directory
   yarn shared
   yarn install
   yarn build
   yarn start
   ```

## Running with Docker

Docker Compose provides an easy way to run all services together with their dependencies.

### Quick Start

1. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Build and start all services**:
   ```bash
   docker compose build --no-cache
   docker compose up
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - API Gateway: http://localhost:4000

## Development Notes

- **Hot Reload**: Not supported when running with Docker. For hot reload during development, run services individually as described in their respective `README.md` files.
- **Service Independence**: Each microservice can be developed and tested independently. Navigate to the respective service folder and follow the instructions in its `README.md`.
- **Shared Package**: After making changes to the `shared` package, you must rebuild it and update all services:
  ```bash
  # In each service directory:
  yarn shared
  ```
- **Database Migrations**: When modifying Prisma schemas, run migrations in the respective service directory:
  ```bash
  npx prisma generate
  npx prisma db push
  ```

## Service Documentation

Each microservice has its own detailed `README.md` file with specific setup instructions:

- [API Gateway](./api-gateway/README.md) - Request routing and authentication
- [User Service](./user-service/README.md) - User authentication and management
- [Question Service](./question-service/README.md) - Question CRUD operations
- [Matching Service](./matching-service/README.md) - Real-time peer matching
- [Collaboration Service](./collaboration-service/README.md) - Real-time collaborative coding
- [UI](./ui/README.md) - Frontend application
- [Shared](./shared/README.md) - Shared types and utilities
- [Database](./db/README.md) - Database setup and configuration

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure the ports specified in `.env` are not in use by other applications.
2. **Database connection errors**: Verify MongoDB and Redis are running and connection strings are correct.
3. **JWT errors**: Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set in `.env`.
4. **Shared package issues**: If services fail to start, rebuild the shared package: `cd shared && yarn build && cd .. && cd <service> && yarn shared`.
5. **Docker issues**: Clear Docker cache with `docker system prune -a` if builds fail.

### Note
- Individual microservices are developed within separate folders within this repository.
- The teaching team has been given access to the repository for history review in case of any disputes or disagreements. 
