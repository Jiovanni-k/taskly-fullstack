# ToDo API

A REST API for user accounts and personal to-do items, built with Express, TypeScript, and PostgreSQL through Prisma.

## Features

- User registration, login, and JWT authentication
- Admin-only user listing and admin access to all to-dos
- Create, list, retrieve, update, and delete to-dos
- Filtering, sorting, and pagination for the public to-do list
- OpenAPI documentation at `/api-docs`
- MCP tools for the demo to-do user

## Requirements

- Node.js 22 or later
- PostgreSQL 16 or later (or Docker)

## Setup

Install dependencies and configure environment variables:

```bash
npm ci
```

Create a `.env` file with at least:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
TEST_DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/TEST_DATABASE
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-secure-password
```

Apply migrations and optionally create the administrator:

```bash
npx prisma migrate deploy
npm run seed
```

Alternatively, run the API and PostgreSQL with Docker:

```bash
docker compose up --build
```

The API is exposed on `http://localhost:3001` in Docker. The database is exposed on port `5433`.

## Run

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

## Endpoints

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Health check |
| POST | `/users/register` | No | Register a user |
| POST | `/users/login` | No | Receive a JWT |
| GET | `/users/me` | Bearer token | Current user |
| GET | `/users` | Admin token | List users |
| GET | `/todos` | No | List to-dos; accepts filters and pagination |
| POST | `/todos` | Bearer token | Create a to-do |
| GET | `/todos/:id` | Owner or admin | Get a to-do |
| PUT | `/todos/:id` | Owner or admin | Update a to-do |
| DELETE | `/todos/:id` | Owner or admin | Delete a to-do |

Use `Authorization: Bearer <token>` for authenticated endpoints. Interactive API documentation is available at `/api-docs`.

## Validation

```bash
npm run build
npm run lint
npm test -- --run
```
