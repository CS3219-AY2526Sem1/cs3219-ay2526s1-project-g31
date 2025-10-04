### User Service
Responsible for user profile management

### Set up
Copy `.env.example` to `.env` and fill in the required environment variables if empty.

1. `npm install -g yarn`
2. `yarn shared`
3. `yarn install`
4. `yarn dev`

### Prisma
- `npx prisma generate` to generate Prisma client
- `npx prisma db push` to push schema to the database