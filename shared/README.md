# Shared Package

## Service Description

The Shared package contains common TypeScript types, interfaces, and utilities used across all microservices and the UI in the PeerPrep platform. This centralized package ensures type consistency, reduces code duplication, and provides a single source of truth for data structures shared between frontend and backend services.

## Architecture and Dependencies

### Core Technologies
- **TypeScript** - Type definitions and interfaces
- **Express Types** - Extended request interfaces for middleware

### Purpose
This package serves as a dependency for:
- API Gateway
- User Service
- Question Service
- Matching Service
- Collaboration Service
- UI (Frontend)

### Key Features
- **Type Safety** - Shared TypeScript types across the entire stack
- **Consistency** - Single source of truth for data structures
- **Reusability** - Common interfaces used by multiple services
- **Version Control** - Centralized updates propagate to all services

### Building the Shared Package

1. **Navigate to the shared directory**:
   ```bash
   cd shared
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Build the package**:
   ```bash
   yarn build
   ```
   This compiles TypeScript files to JavaScript in the `dist/` directory.

### Using in Other Services

After building the shared package, install it in other services:

```bash
# In any service directory (e.g., user-service, api-gateway, ui)
yarn shared
```

This script:
1. Navigates to the shared package
2. Installs its dependencies
3. Builds the package
4. Adds it as a local dependency to the current service

### Available Scripts

- `yarn build` - Compile TypeScript to JavaScript

## Development Workflow

### Making Changes

1. **Edit types in `src/models/`**:
   ```bash
   cd shared
   # Edit files in src/models/
   ```

2. **Rebuild the package**:
   ```bash
   yarn build
   ```

3. **Update dependent services**:
   ```bash
   # In each service that uses shared (user-service, api-gateway, etc.)
   cd ../user-service
   yarn shared
   
   cd ../api-gateway
   yarn shared
   # Repeat for all services
   ```

4. **Restart services** to use updated types

### Adding New Types

1. Create or edit files in `src/models/`
2. Export from `src/index.ts`:
   ```typescript
   export * from './models/newtype'
   ```
3. Rebuild and update all services

## Development Notes

- **Always rebuild** the shared package after making changes
- **Update all services** that depend on shared after rebuilding
- **Version consistency** - All services should use the same version
- **Type safety** - Leverage TypeScript to catch type mismatches early
- **Breaking changes** - Coordinate updates across all services when making breaking changes
- **Documentation** - Keep types well-documented with JSDoc comments
- **Naming conventions** - Use clear, descriptive names for types and interfaces
- **Avoid circular dependencies** - Keep the shared package lightweight and dependency-free

## Common Issues

### "Cannot find module 'shared'"
**Solution**: Run `yarn shared` in the service directory to install the local package.

### Types not updating after changes
**Solution**: 
1. Rebuild shared package: `cd shared && yarn build`
2. Reinstall in service: `cd ../service && yarn shared`
3. Restart the service

### TypeScript errors after updating shared
**Solution**: Ensure all services have the updated shared package installed and TypeScript server is restarted in your IDE.