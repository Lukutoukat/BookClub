# BookClub repository instructions

## Project overview

BookClub is a TypeScript application split into two independently managed packages:

- `bookclub-front/`: React 19 + Vite frontend using Tailwind CSS, React Router, Axios, Vitest, and Testing Library.
- `bookclub-backend/`: Node.js + Express backend using Prisma, PostgreSQL, JWT authentication, Jest, and Supertest.
- `manifests/`: OpenShift/Kubernetes deployment manifests for staging and production.
- Root Docker Compose files provide local and production-oriented orchestration.

Keep frontend and backend changes isolated to the relevant package unless an API contract, shared behavior, or deployment configuration requires coordinated changes.

## General development guidance

- Use TypeScript throughout; avoid introducing JavaScript unless the surrounding tool configuration requires it.
- Prefer small, focused changes that preserve existing behavior and public API contracts.
- Follow the existing code style and nearby patterns before introducing a new abstraction.
- Use descriptive names and keep functions/components focused on one responsibility.
- Do not commit secrets, credentials, real database URLs, tokens, generated build output, or local environment files.
- Treat user input and all external request data as untrusted; validate it at API boundaries.
- Preserve accessibility in UI changes: use semantic elements, labels, keyboard support, and visible focus states.
- Update documentation when commands, environment variables, API behavior, or deployment steps change.

## Frontend instructions (`bookclub-front`)

- Use React functional components and TypeScript types/interfaces for component props and API data.
- Use the existing Tailwind CSS setup and design language; avoid adding one-off styling systems or inline styles without a clear reason.
- Reuse existing UI components, utilities, icons, and class-name helpers where available.
- Keep API calls and error/loading states explicit. Do not silently swallow failed requests.
- Keep routing changes compatible with the existing React Router setup.
- Add or update Vitest/Testing Library tests for meaningful UI behavior, user interactions, loading states, error states, and accessibility-sensitive changes.
- Run frontend commands from `bookclub-front/`:
  - `npm run lint`
  - `npm test`
  - `npm run coverage` when coverage information is relevant
  - `npm run build`
  - `npm run format` only when intentionally formatting files

## Backend instructions (`bookclub-backend`)

- Follow the existing Express route, controller/service, middleware, and Prisma patterns.
- Keep authentication and authorization checks on the server; never rely on frontend checks for security.
- Never log passwords, JWTs, secrets, connection strings, or other sensitive request data.
- Use Prisma for database access and keep schema changes, migrations, generated client changes, and application code consistent.
- Validate request bodies, query parameters, route parameters, and authorization context before use.
- Return consistent HTTP status codes and response shapes, and avoid exposing internal errors or stack traces to clients.
- Add or update Jest/Supertest tests for endpoint behavior, validation, authorization, error handling, and database-related changes.
- Run backend commands from `bookclub-backend/`:
  - `npm run lint`
  - `npm test`
  - `npm run coverage` when coverage information is relevant
  - `npm run tsc`
  - `npx prisma generate` when the Prisma schema or client usage changes
  - `npm run format` only when intentionally formatting files

## Database and environment configuration

- Backend local configuration belongs in `bookclub-backend/.env`; use documented placeholder values locally.
- Required configuration includes the database connection and JWT signing secret. Keep environment-specific values out of source control.
- For schema changes, consider backward compatibility and deployment order. Do not make destructive production changes without an explicit migration and rollout plan.
- Keep `manifests/configmaps.yaml` out of version control when it contains real environment values.

## Docker and deployment

- Check both `docker-compose.yaml` and the relevant Dockerfiles when changing runtime, ports, build output, or service dependencies.
- Keep container behavior reproducible and avoid relying on files that are ignored or generated only on a developer machine.
- When changing deployment behavior, update the appropriate files under `manifests/` and `manifests/README.md`.
- Verify staging and production configuration differences before modifying shared manifest structure.

## Validation expectations

Before submitting changes, run the relevant package checks and tests. For cross-cutting changes, run both frontend and backend checks plus a production build where practical. Review the diff for accidental secrets, generated files, unrelated formatting changes, and broken API contracts.
