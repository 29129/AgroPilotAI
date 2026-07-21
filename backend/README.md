# AgroPilot AI API

Backend REST versionado de AgroPilot AI. Está aislado en `backend/` para permitir el desarrollo paralelo del frontend.

## Requisitos

- Node.js 20+
- Docker Desktop (para PostgreSQL) o una instancia PostgreSQL 16+

## Inicio local

```bash
cd backend
cp env.example .env
docker compose up -d postgres
npm install
npm run db:generate
npm run db:deploy
npm run dev
```

La API quedará disponible en `http://localhost:4000/api/v1` y la documentación Swagger/OpenAPI en `http://localhost:4000/api/docs`.

## Comandos

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts development server |
| `npm run build` | Compiles TypeScript |
| `npm run typecheck` | Verifies TypeScript without emitting files |
| `npm run lint` | Runs ESLint |
| `npm run test` | Runs automated tests |
| `npm run db:deploy` | Applies committed migrations |

## Data model

Prisma models users, secure refresh tokens, farms, plots, crops, diagnoses, multi-agent analyses, recommendations, weekly plans, conversations and notifications. The initial migration lives in `prisma/migrations` and is never edited after publication.

See [the shared API contract](../API_CONTRACT.md) for the frontend integration contract.

## Database integration tests

Start the isolated test database with `docker compose up -d postgres-test`, copy `TEST_DATABASE_URL` from `env.example` to `.env`, and apply migrations with `DATABASE_URL=$TEST_DATABASE_URL npm run db:deploy` (or set that variable in your shell). `npm test` skips database tests unless `TEST_DATABASE_URL` is set; CI always runs them.
