# Matching Service

## Service Description

The Matching Service is responsible for pairing users who want to practice coding interviews together in real-time. It uses WebSocket connections for instant matching notifications and Redis as a queue to efficiently match users based on their selected difficulty level, topics, and programming language preferences. The service includes timeout handling and automatic cleanup of expired match requests.

## Architecture and Dependencies

### Core Technologies
- **Express.js**
- **Socket.IO**
- **Redis (ioredis)**
- **JWT (jsonwebtoken)**
- **TypeScript**

### Dependencies
- **Shared Package** - Common types (UserRole, Question criteria)
- **Redis** - Matching queue and temporary data storage
- **Question Service** - Fetches random questions based on match criteria
- **API Gateway** - WebSocket proxy for client connections

### Key Features
- **Real-time Matching** - WebSocket-based instant peer matching
- **Intelligent Queue** - Redis-backed queue with multiple matching criteria
- **Timeout Handling** - Automatic cleanup after 1 minute if no match found
- **Match Criteria** - Difficulty level, topics, and programming language
- **Concurrent Connection Prevention** - One active connection per user

## Environment Variables

Create a `.env` file in the `matching-service` directory with the following variables:

```bash
# Redis Configuration
REDIS_HOST=localhost                              # Redis server host
REDIS_PORT=6379                                   # Redis server port (default: 6379)
REDIS_PASSWORD=password                           # Redis password (if required)

# Service Configuration (from root .env)
MATCHING_SERVICE_PORT=3002                        # Port for matching service
UI_BASE_URL=http://localhost:3000                 # Frontend URL

# JWT Configuration (from root .env)
JWT_ACCESS_SECRET=<your-secret-key>               # Secret for verifying JWT tokens

# Dependent Services (from root .env)
QUESTION_SERVICE_BASE_URL=http://localhost:3003   # Question service endpoint for fetching questions
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Redis instance (local or cloud)
- Shared package built and installed
- Question Service running

### Steps

1. **Navigate to the Matching Service directory**:
   ```bash
   cd matching-service
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Link the shared package**:
   ```bash
   yarn shared
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your Redis configuration
   ```

5. **Ensure Redis is running**:
   ```bash
   cd db
   docker compose up
   ```

6. **Run in development mode**:
   ```bash
   yarn dev
   ```
   The service will start with hot-reloading enabled via nodemon.

7. **Build for production**:
   ```bash
   yarn build
   ```

8. **Start in production mode**:
   ```bash
   yarn start
   ```

## Development Notes

- WebSocket connections are authenticated using JWT tokens
- Only one active WebSocket connection per user is allowed
- Match requests automatically expire after 1 minute
- Redis is used for temporary queue storage (no persistent data)
- The service notifies both users simultaneously when a match is found
- WebSocket connections are closed after successful match or timeout
- Expired match requests are automatically cleaned up from Redis
- The service handles connection errors and user disconnections gracefully
- CORS is configured to allow connections from the UI frontend only