# Question Service

## Service Description

The Question Service maintains a repository of coding interview questions indexed by difficulty level, topics, and other criteria. It provides CRUD operations for managing questions and supports filtering and searching capabilities for efficient question retrieval during matching and collaboration sessions.

## Architecture and Dependencies

### Core Technologies
- **Express.js**
- **Prisma**
- **MongoDB**
- **TypeScript**

### Dependencies
- **Shared Package** - Common types (Question, Difficulty, Topic)
- **MongoDB** - Primary data store
- **API Gateway** - Receives user authentication context via headers

## Environment Variables

Create a `.env` file in the `question-service` directory with the following variables:

```bash
# Database Configuration
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/peerprep-questions  # MongoDB connection string

# Service Configuration (from root .env)
QUESTION_SERVICE_PORT=3003                                              # Port for question service
```

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- MongoDB instance (local or cloud)
- Shared package built and installed

### Steps

1. **Navigate to the Question Service directory**:
   ```bash
   cd question-service
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
   # Edit .env with your MongoDB connection string
   ```

5. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

6. **Push database schema to MongoDB**:
   ```bash
   npx prisma db push
   ```

7. **Run in development mode**:
   ```bash
   yarn dev
   ```
   The service will start with hot-reloading enabled via nodemon.

8. **Build for production**:
   ```bash
   yarn build
   ```

9. **Start in production mode**:
   ```bash
   yarn start
   ```

## Development Notes

- The service does not handle authentication - it relies on the API Gateway
- Only users with ADMIN role can create, update, or delete questions
- All users (authenticated) can view and search questions
- Prisma migrations are managed via `db push` for MongoDB (no migration files)