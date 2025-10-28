# User Service

## Service Description

The User Service is responsible for user authentication, authorization, and profile management in the PeerPrep platform. It handles Google OAuth 2.0 authentication, JWT token generation and validation, user CRUD operations, and maintains user sessions using refresh tokens stored in MongoDB.

## Architecture and Dependencies

### Core Technologies
- **Express.js**
- **Prisma**
- **MongoDB**
- **Passport.js**
- **JWT (jsonwebtoken)**
- **Zod**
- **TypeScript**

### Dependencies
- **Shared Package** - Common types (UserRole, JwtRequest, AuthRequest)
- **MongoDB** - Primary data store
- **Google OAuth API** - Authentication provider

### Key Features
- **Google OAuth 2.0** - Secure third-party authentication
- **JWT Authentication** - Access and refresh token mechanism
- **User Profile Management** - CRUD operations for user data
- **Role-Based Access** - USER and ADMIN roles
- **Session Management** - Refresh token rotation for security

## Environment Variables

Create a `.env` file in the `user-service` directory with the following variables:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=<your-google-client-id>                    # OAuth 2.0 client ID from Google Console
GOOGLE_CLIENT_SECRET=<your-google-client-secret>            # OAuth 2.0 client secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback  # OAuth callback URL

# Database Configuration
MONGODB_CONNECTION_STRING=mongodb://localhost:27017/peerprep-users  # MongoDB connection string

# JWT Configuration (from root .env)
JWT_ACCESS_SECRET=<your-secret-key>                         # Secret for signing access tokens (15min expiry)
JWT_REFRESH_SECRET=<your-secret-key>                        # Secret for signing refresh tokens (7d expiry)

# Service Configuration (from root .env)
USER_SERVICE_PORT=3001                                      # Port for user service
UI_BASE_URL=http://localhost:3000                           # Frontend URL for CORS and redirects
```

### Getting Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- MongoDB instance (local or cloud)
- Google OAuth 2.0 credentials
- Shared package built and installed

### Steps

1. **Navigate to the User Service directory**:
   ```bash
   cd user-service
   ```

2. **Link the shared package**:
   ```bash
   yarn shared
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
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

- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are automatically cleaned up when users logout or are deleted
- User roles are either USER (default) or ADMIN
- The service expects `x-user-id` and `x-user-role` headers from the API Gateway
- Google OAuth callback redirects users to the UI frontend with tokens in cookies
- All user data changes are validated using Zod schemas
- Prisma migrations are managed via `db push` for MongoDB (no migration files)