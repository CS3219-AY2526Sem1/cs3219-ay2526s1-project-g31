# Collaboration Service

## Service Description

The Collaboration Service provides real-time collaborative coding sessions between matched users. It enables concurrent code editing, shared state management, and real-time communication using WebSocket technology. The service maintains active collaboration sessions and ensures synchronized experiences for both participants working on the same coding problem.

## Architecture and Dependencies

### Core Technologies
- **Express.js**
- **Socket.IO**
- **TypeScript**

### Dependencies
- **Shared Package** - Common types and interfaces
- **API Gateway** - WebSocket proxy for client connections
- **Question Service** - Retrieves question details for collaboration sessions

### Key Features
- **Real-time Code Editing** - Synchronized code changes between two users
- **Session Management** - Maintains active collaboration sessions

## Environment Variables

This service uses environment variables from the root `.env` file:

```bash
# Service Configuration (from root .env)
COLLABORATION_SERVICE_PORT=3004                   # Port for collaboration service
UI_BASE_URL=http://localhost:3000                 # Frontend URL for CORS policy
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Shared package built and installed

### Steps

1. **Navigate to the Collaboration Service directory**:
   ```bash
   cd collaboration-service
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
   - Ensure the root `.env` file is configured with required variables

5. **Run in development mode**:
   ```bash
   yarn dev
   ```
   The service will start with hot-reloading enabled via nodemon.

6. **Build for production**:
   ```bash
   yarn build
   ```

7. **Start in production mode**:
   ```bash
   yarn start
   ```