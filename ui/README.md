#### **AI Assistance Disclosure**
**Tool**: Microsoft Copilot  
**Scope**: Generated several sections (see AI-usage-log for details).  
**Author review**: Validated correctness and edited for style.  

---

# UI - Frontend Application

## Service Description

The UI is a Next.js application that serves as the frontend for the PeerPrep platform. It provides an intuitive user interface for authentication, question browsing, peer matching, and real-time collaborative coding sessions. Built with React and Tailwind CSS, it offers a modern, responsive, and performant user experience.

## Architecture and Dependencies

### Core Technologies
- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Socket.IO Client**

### Dependencies
- **Shared Package** - Common types and interfaces
- **API Gateway** - All backend API requests go through the gateway
- **WebSocket Services** - Direct connections to Matching and Collaboration services

## Environment Variables

Create a `.env` file in the `ui` directory with the following variables:

```bash
# API Gateway URLs (all backend requests route through gateway)
NEXT_PUBLIC_USER_SERVICE_BASE_URL=http://localhost:4000        # User/Auth endpoints
NEXT_PUBLIC_MATCHING_SERVICE_BASE_URL=http://localhost:4000    # Matching endpoints
NEXT_PUBLIC_QUESTION_SERVICE_BASE_URL=http://localhost:4000    # Question endpoints
NEXT_PUBLIC_COLLABORATION_SERVICE_BASE_URL=http://localhost:4000  # Collaboration endpoints
NEXT_PUBLIC_AI_SERVICE_BASE_URL=http://localhost:4000 # AI endpoints
```

**Note**: All services point to the API Gateway (port 4000) which handles routing to backend services.

## Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- Yarn package manager
- Shared package built and installed
- API Gateway and backend services running

### Steps

1. **Navigate to the UI directory**:
   ```bash
   cd ui
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
   # Edit .env if needed (default values should work with standard setup)
   ```

5. **Run in development mode**:
   ```bash
   yarn dev
   ```
   The application will start at http://localhost:3000 with hot-reloading enabled.

6. **Build for production**:
   ```bash
   yarn build
   ```

7. **Start production server**:
   ```bash
   yarn start
   ```

8. **Run linting**:
   ```bash
   yarn lint
   ```

## Development Notes

- **Hot Reloading**: Changes to code automatically refresh the browser
- **Turbopack**: Uses Next.js Turbopack for faster builds and HMR
- **Environment Variables**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- **Type Safety**: Shared types ensure consistency with backend services
- **Cookie Management**: Authentication tokens are stored in HTTP-only cookies
- **Error Handling**: User-friendly error messages and fallbacks
