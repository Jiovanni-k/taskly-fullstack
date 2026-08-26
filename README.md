# Taskly

> A full-stack, type-safe task manager that pairs a production-minded Express API with a polished React dashboard, PostgreSQL persistence, JWT authorization, OpenAPI documentation, Docker support, CI, and Model Context Protocol (MCP) tools.

[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1120)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

Taskly is more than CRUD. It demonstrates how a modern TypeScript application can keep concerns separated, enforce ownership at the API boundary, persist authentication across browser refreshes, expose a discoverable REST contract, and make task operations available to MCP-capable clients.

## Contents

- [What it delivers](#what-it-delivers)
- [Architecture and design](#architecture-and-design)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Running the stack](#running-the-stack)
- [Authentication and authorization](#authentication-and-authorization)
- [REST API](#rest-api)
- [Frontend](#frontend)
- [MCP server](#mcp-server)
- [Database](#database)
- [Quality, testing, and CI](#quality-testing-and-ci)
- [Environment variables](#environment-variables)
- [Useful commands](#useful-commands)
- [Current implementation notes](#current-implementation-notes)

## What it delivers

### A real task workflow

- Register and log in with an email and password.
- Receive a signed JWT and stay signed in after a browser refresh.
- Create, read, edit, complete, uncomplete, and delete tasks against the real API.
- See active and completed task totals, all/active/completed filters, empty states, feedback, and operation-level loading states.
- Prevent unauthenticated users from visiting the dashboard.
- Surface friendly API, validation, authorization, and network errors instead of raw transport failures.

### Security and access control

- Passwords are hashed with `bcrypt`; plaintext passwords are never returned by the user repository.
- JWT bearer authentication is implemented with Passport's JWT strategy.
- The authenticated Express user is strongly typed through declaration merging.
- Ownership is enforced server-side: users may access, update, and delete their own tasks; administrators can manage all tasks.
- `GET /users` is restricted to the `admin` role.
- Public registration refuses the configured administrator email; the administrator is created through the seed script.
- CORS can be restricted through `CORS_ORIGIN` for a separately hosted frontend.

### Developer experience

- Strict TypeScript for server and client code.
- OpenAPI annotations rendered through Swagger UI.
- Prisma migrations and a repeatable admin seed workflow.
- Docker Compose for API + PostgreSQL, plus a GitHub Actions workflow that provisions PostgreSQL, migrates, builds, and tests.
- Unit and integration tests with Vitest, Supertest, and a real PostgreSQL test database.

## Architecture and design

Taskly follows a layered, dependency-directed backend design. HTTP concerns stay at the edge; business rules live in services; persistence stays in repositories.

```text
React + Vite frontend
        |
        | fetch + Authorization: Bearer <JWT>
        v
Express routes
        |
        v
Middleware pipeline
  CORS -> JSON -> Passport JWT -> validation -> authorization
        |
        v
Controllers  ->  Services  ->  Repositories  ->  Prisma  -> PostgreSQL
                    |
                    +-> ownership and business rules

MCP stdio client -> JSON-RPC request handler -> same Todo services -> repositories
```

### Patterns used

| Pattern / principle                  | Where it appears                                                | Why it matters                                                                                          |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Layered architecture                 | `routes -> controllers -> services -> repositories`             | Keeps transport, business rules, and database code independently understandable.                        |
| Repository pattern                   | `src/repositories/`                                             | Prisma queries are isolated from the rest of the application.                                           |
| Service layer                        | `src/services/`                                                 | Registration, login, ownership, and todo rules have one home.                                           |
| Middleware pipeline                  | `src/middleware/`                                               | Authentication, RBAC, ownership checks, UUID checks, validation, and logging compose cleanly per route. |
| Dependency inversion through modules | Services consume repository modules rather than Express objects | Business logic is testable without an HTTP server.                                                      |
| DTO / query object                   | `src/dtos/todo.dto.ts`, `queryBuilder.ts`                       | Pagination, filters, and sorting are parsed and constrained before reaching Prisma.                     |
| Context provider                     | `frontend/src/AuthContext.tsx`                                  | Authentication state is shared without prop drilling.                                                   |
| API service layer                    | `frontend/src/api.ts`                                           | One typed place for headers, errors, JWT use, and REST calls.                                           |
| Protected-route guard                | `frontend/src/App.tsx`                                          | Browser navigation respects authentication state.                                                       |
| Adapter boundary                     | Prisma + `@prisma/adapter-pg`                                   | Database access remains behind Prisma's client and PostgreSQL adapter.                                  |

## Technology stack

| Area                | Technology                                                  |
| ------------------- | ----------------------------------------------------------- |
| Backend             | Node.js 22, Express 5, TypeScript, ESM                      |
| Frontend            | React 19, React Router, Vite, CSS                           |
| Database            | PostgreSQL 16, Prisma ORM, Prisma PostgreSQL adapter, `pg`  |
| Authentication      | Passport JWT, JSON Web Tokens, bcrypt                       |
| API documentation   | Swagger UI, swagger-jsdoc / OpenAPI annotations             |
| AI interoperability | Model Context Protocol SDK and a stdio JSON-RPC tool server |
| Testing             | Vitest, Supertest, V8 coverage provider                     |
| Code quality        | ESLint, typescript-eslint, Prettier                         |
| Delivery            | Docker, Docker Compose, GitHub Actions                      |

## Project structure

```text
.
├── frontend/                    # React/Vite single-page application
│   ├── src/
│   │   ├── api.ts               # Typed fetch client and API error boundary
│   │   ├── AuthContext.tsx      # Persistent auth state
│   │   ├── App.tsx              # Routes, pages, dialogs, task interactions
│   │   ├── types.ts             # Frontend API contracts
│   │   └── styles.css           # Responsive visual system
│   └── .env.example             # Vite API URL example
├── prisma/
│   ├── schema.prisma            # User/task data model
│   ├── migrations/              # Versioned database evolution
│   └── seed.ts                  # Idempotent admin seed
├── src/
│   ├── config/                  # Prisma, Passport, Swagger configuration
│   ├── controllers/             # HTTP request / response orchestration
│   ├── dtos/                    # Query and response types
│   ├── mcp/                     # MCP JSON-RPC server and task tools
│   ├── middleware/              # Auth, RBAC, ownership, validation, logging
│   ├── repositories/            # Prisma persistence layer
│   ├── routes/                  # Express route and OpenAPI declarations
│   ├── services/                # Business logic
│   ├── tests/                   # Unit + integration suites
│   └── utils/                   # JWT, hashing, query parsing
├── .github/workflows/ci.yml     # PostgreSQL-backed CI pipeline
├── docker-compose.yml           # API + PostgreSQL development stack
├── Dockerfile                   # Production-oriented API image
└── vite.config.ts               # Frontend development proxy and build config
```

## Quick start

### Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL 16+ **or** Docker Desktop

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure the environment

Create `.env` in the repository root:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskly
TEST_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/taskly_test
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=1h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-this-with-a-secure-password

# Optional: required when the frontend is hosted on another origin.
CORS_ORIGIN=http://localhost:5173
```

### 3. Create the schema and administrator

```bash
npx prisma migrate deploy
npm run seed
```

### 4. Run the API and frontend

Open two terminals:

```bash
# Terminal 1: API at http://localhost:3000
npm run dev
```

```bash
# Terminal 2: frontend at http://localhost:5173
npm run frontend:dev
```

Visit:

- Frontend: `http://localhost:5173`
- API health: `http://localhost:3000/health`
- Swagger UI: `http://localhost:3000/api-docs`

## Running the stack

### Local development

Vite proxies browser calls from `/api/*` to `http://localhost:3000/*`, so the frontend works without embedding a backend URL in source code. The default frontend configuration is in `frontend/.env.example`:

```env
VITE_API_URL=/api
```

For a separately deployed frontend, create `frontend/.env` and use the public API URL instead:

```env
VITE_API_URL=https://api.example.com
```

Set `CORS_ORIGIN` on the API to the frontend origin in that deployment.

### Docker Compose

```bash
docker compose up --build
```

This starts:

| Service    | Host address            | Container address |
| ---------- | ----------------------- | ----------------- |
| PostgreSQL | `localhost:5433`        | `db:5432`         |
| API        | `http://localhost:3001` | `api:3000`        |

The API image runs `prisma migrate deploy` before starting the compiled server. The PostgreSQL data directory is persisted in the `postgres_data` named volume.

## Authentication and authorization

1. `POST /users/login` validates credentials and returns `{ token, user }`.
2. The frontend stores the token in `localStorage` and sends it as `Authorization: Bearer <token>`.
3. On refresh, `GET /users/me` restores the session from the backend rather than trusting stale client-side user data.
4. A missing, invalid, or expired token produces `401`; the frontend clears the session and sends the user to `/login`.
5. `authorizeTodoOwner` permits the task owner or an administrator to update a task. The service layer applies the same owner/admin rule to read and delete operations.

Role behavior:

| Action                                   | User | Admin |
| ---------------------------------------- | ---- | ----- |
| Register / login                         | Yes  | Yes   |
| Create own task                          | Yes  | Yes   |
| Read, update, delete own task            | Yes  | Yes   |
| Read, update, delete another user's task | No   | Yes   |
| List users                               | No   | Yes   |

## REST API

The interactive source of truth is Swagger UI at `/api-docs`. The route annotations in `src/routes/` generate the specification.

### Health and users

| Method | Path              | Auth         | Description                                    |
| ------ | ----------------- | ------------ | ---------------------------------------------- |
| `GET`  | `/health`         | No           | Returns `{ "status": "UP" }`.                  |
| `POST` | `/users/register` | No           | Creates a user from `{ "email", "password" }`. |
| `POST` | `/users/login`    | No           | Returns a JWT and safe user object.            |
| `GET`  | `/users/me`       | Bearer token | Returns the authenticated user.                |
| `GET`  | `/users`          | Admin token  | Lists users without password hashes.           |

### Todo endpoints

| Method   | Path         | Auth           | Body / query                                                      | Description                                                                                                 |
| -------- | ------------ | -------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `GET`    | `/todos`     | No             | Optional `page`, `limit`, `completed`, `title`, `sortBy`, `order` | Lists all tasks. With query parameters it returns `{ data, pagination }`; without them it returns an array. |
| `POST`   | `/todos`     | Bearer token   | `{ "title": "..." }`                                              | Creates a task owned by the authenticated user.                                                             |
| `GET`    | `/todos/:id` | Owner or admin | UUID path parameter                                               | Retrieves a task.                                                                                           |
| `PUT`    | `/todos/:id` | Owner or admin | `{ "title": "...", "completed": true }`                           | Replaces the editable task fields.                                                                          |
| `DELETE` | `/todos/:id` | Owner or admin | UUID path parameter                                               | Deletes a task and returns `204 No Content`.                                                                |

Example login:

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'
```

Example authenticated task creation:

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title":"Ship the Taskly README"}'
```

### Todo query behavior

`queryBuilder.ts` keeps list queries constrained and predictable:

- Default page: `1`
- Default limit: `10`
- Maximum limit: `100`
- Supported sort fields: `createdAt`, `updatedAt`, `title`, `completed`
- Sort order: `asc` or `desc`
- Title matching: case-insensitive containment
- Completion filtering: `completed=true` or `completed=false`

## Frontend

The React single-page application is intentionally coupled to the existing backend contract rather than a mock API.

### Routes

| Route       | Behavior                                                                       |
| ----------- | ------------------------------------------------------------------------------ |
| `/login`    | Sign in; authenticated visitors are redirected to `/todos`.                    |
| `/register` | Register, then automatically sign in using the API.                            |
| `/todos`    | Protected task dashboard. Unauthenticated visitors are redirected to `/login`. |

### UX details

- Responsive CSS layout for desktop and mobile.
- Task create/edit dialog with client-side title checks.
- Completion checkbox uses the real `PUT /todos/:id` contract.
- Delete confirmation uses the real `DELETE /todos/:id` contract.
- Buttons are disabled while their request is in progress to prevent duplicate operations.
- Filter views are computed from the authenticated user's fetched tasks.
- API failures use a typed `ApiError` and human-readable messages.
- A `401` event clears local session state automatically.

Build the deployable frontend assets with:

```bash
npm run frontend:build
```

The generated output is written to `frontend-dist/` and intentionally ignored by Git.

## MCP server

Taskly includes a stdio JSON-RPC MCP server so an MCP-capable client can perform task operations through tools rather than direct REST calls.

```bash
npm run mcp
```

### Available tools

| Tool             | Arguments                  | Behavior                  |
| ---------------- | -------------------------- | ------------------------- |
| `create_todo`    | `title`                    | Creates a task.           |
| `list_todos`     | None                       | Lists demo-user tasks.    |
| `get_todo_by_id` | `id`                       | Gets a demo-user task.    |
| `update_todo`    | `id`, `title`, `completed` | Updates a demo-user task. |
| `delete_todo`    | `id`                       | Deletes a demo-user task. |

The server implements the MCP initialization handshake, `tools/list`, `tools/call`, and an empty `resources/list` response. It returns JSON-RPC `-32601` errors for unknown tools or methods.

> **MCP demo constraint:** the current tools operate as a fixed demo user ID, and the constants in the tools use `8ec8cce9-88bd-4c28-80aa-6f4daf5d4741`. That user must exist in the database for create operations to succeed. The MCP auth types are present, but request-token authentication is not yet enforced in the request handler. This is suitable for a local demo; a multi-user MCP deployment should replace the fixed identity with validated caller credentials.

## Database

Prisma models two related entities:

```text
User (UUID)
  id, email [unique], password [bcrypt hash], role
  └── todos[]

Todo (UUID)
  id, title [max 255 chars], completed, userId
  createdAt, updatedAt
  └── belongs to User
```

Database evolution is checked into `prisma/migrations/`, including initial schema creation, authentication, UUID conversions, and creation/update timestamps.

Useful Prisma commands:

```bash
npx prisma validate
npx prisma migrate deploy
npx prisma studio
```

## Quality, testing, and CI

### Test strategy

| Layer       | Tools                           | Coverage focus                                                                                                                         |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Vitest + mocked Prisma          | User services, todo services, query parsing, update validation, and ownership middleware.                                              |
| Integration | Vitest + Supertest + PostgreSQL | Registration, login, session lookup, RBAC, authenticated task CRUD, UUID validation, ownership, administrator privileges, and sorting. |

Tests use `TEST_DATABASE_URL`, and `src/tests/setup.ts` assigns it as the active `DATABASE_URL` before the suite starts. Test files run serially to prevent database reset races.

```bash
npm test -- --run
npm run test:coverage
```

### CI pipeline

GitHub Actions runs for pull requests to `main` and pushes to `main`, `feature/*`, and `features*`. It:

1. Starts PostgreSQL 16 as a service.
2. Installs dependencies with `npm ci`.
3. Generates Prisma Client.
4. Applies migrations.
5. Builds TypeScript.
6. Runs the test suite.

### Formatting and linting

```bash
npm run lint
npm run lint:fix
npm run format:check
npm run format
```

## Environment variables

| Variable            | Required                                 | Purpose                                                                                      |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`      | Yes                                      | PostgreSQL connection used by the API and Prisma CLI.                                        |
| `TEST_DATABASE_URL` | Yes for tests                            | Separate PostgreSQL connection used by integration tests.                                    |
| `JWT_SECRET`        | Yes                                      | Secret used to sign and verify bearer tokens.                                                |
| `JWT_EXPIRES_IN`    | No                                       | JWT lifetime; defaults to `1h`.                                                              |
| `ADMIN_EMAIL`       | Yes for seed / reserved-email protection | Email for the seeded administrator.                                                          |
| `ADMIN_PASSWORD`    | Yes for seed                             | Password used by the admin seed script.                                                      |
| `CORS_ORIGIN`       | No                                       | Comma-separated allowed browser origins. If absent, CORS allows all origins.                 |
| `VITE_API_URL`      | No                                       | Frontend API base URL; defaults to `/api`. Set in `frontend/.env` for non-proxy deployments. |

Never commit `.env`, real connection strings, JWT secrets, or production credentials.

## Useful commands

| Command                    | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Start the API with file watching.              |
| `npm run build`            | Compile the backend to `dist/`.                |
| `npm start`                | Run the compiled backend.                      |
| `npm run frontend:dev`     | Start Vite on port `5173`.                     |
| `npm run frontend:check`   | Type-check frontend source.                    |
| `npm run frontend:build`   | Build frontend assets.                         |
| `npm run frontend:preview` | Preview the frontend production build.         |
| `npm test -- --run`        | Run all tests once.                            |
| `npm run seed`             | Create or update the configured admin account. |
| `npm run mcp`              | Start the stdio MCP server.                    |

## Current implementation notes

This README intentionally documents the application as it exists today.

- `GET /todos` is public and returns all tasks. The frontend filters this list to the authenticated user before displaying it; server-side ownership enforcement applies to single-task read/update/delete operations. A future privacy-hardening change could make list results authenticated and owner-scoped.
- The frontend uses `localStorage` because the backend currently returns a bearer token in the login response. For a high-security production environment, consider short-lived access tokens plus HttpOnly, Secure, SameSite refresh cookies and an XSS-hardening strategy.
- The MCP implementation is a local demo integration and should be given real request authentication before exposing it to multiple users or untrusted clients.
- Docker Compose starts the API and database. The React frontend is run separately with Vite or can be hosted as static output from `frontend-dist/`.

---

Built to demonstrate thoughtful full-stack engineering: clear boundaries, real persistence, explicit authorization, testable business logic, and interfaces for both people and AI tools.

## Author

Jiovanni Kitlo
