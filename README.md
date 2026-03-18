# THIS REPO IS COMPLETELY MADE AND MAINTAINED BY CLAUDE CODE, AS AN ATTEMPT TO MAXIMIZE IT'S ABILITY TO DEVELOP.
## Book Library API (TypeScript + Express)

A production-style demo REST API for a library catalog.

This project is intentionally designed to showcase backend engineering practices, not just CRUD logic. It demonstrates:

- Layered architecture (Route -> Controller -> Service -> Repository)
- Repository Pattern for data-access abstraction
- Immutable data updates in the in-memory store
- Input and environment validation with Zod
- Security middleware (Helmet, rate limiting, JSON body limits)
- Centralized error handling and consistent API response envelopes
- Multi-level testing (unit, integration, e2e) with coverage thresholds

## Table of Contents

- [What This Project Is](#what-this-project-is)
- [What This Project Is Not](#what-this-project-is-not)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Run the Application](#run-the-application)
- [Scripts](#scripts)
- [API Reference](#api-reference)
- [Validation Rules](#validation-rules)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Current Known Caveats](#current-known-caveats)
- [Security Features](#security-features)
- [Design Decisions](#design-decisions)
- [Roadmap Ideas](#roadmap-ideas)
- [License](#license)

## What This Project Is

This is a backend API for managing book records in a library catalog.

You can:

- Create books
- List books (with pagination)
- Get one book by id
- Replace a book
- Partially update a book
- Delete a book
- Check health status

## What This Project Is Not

This is not an e-reader or digital book delivery service.

- It does not store PDF/EPUB files
- It does not render pages for reading
- It does not include user accounts/authentication yet
- It currently uses in-memory storage (data resets on restart)

## Tech Stack

- Runtime: Node.js
- Language: TypeScript (strict mode)
- Web framework: Express 5
- Validation: Zod
- Security middleware: Helmet, express-rate-limit
- Logging: Winston
- Tests: Jest + Supertest + ts-jest
- Formatting and linting: Prettier + ESLint

## Architecture

Request flow:

1. Route receives HTTP request
2. Controller validates input and maps request/response
3. Service applies business rules
4. Repository handles persistence operations
5. Response helpers return a consistent envelope

Dependency direction:

- Routes depend on Controllers
- Controllers depend on Services
- Services depend on Repository interface
- Repository implementation can be swapped (in-memory today, DB tomorrow)

## Project Structure

```text
src/
  app.ts                      # Express app composition (middleware + routes)
  server.ts                   # Process entrypoint and graceful shutdown
  config/
    env.ts                    # Env schema + parser (Zod)
  controllers/
    book.controller.ts        # HTTP handlers for books
  lib/
    logger.ts                 # Winston logger factory
    response.ts               # Standard API response builders
    uuid.ts                   # UUID helper (if needed by future layers)
  middleware/
    request-logger.ts         # Request logging middleware
    not-found.ts              # 404 handler
    error-handler.ts          # Centralized error handling
  repositories/
    book.repository.ts        # Repository contract
    in-memory-book.repository.ts
  routes/
    health.route.ts
    book.route.ts
  schemas/
    book.schema.ts            # Request validation schemas
  services/
    book.service.ts           # Business logic + NotFound domain error
  types/
    book.ts
    api-response.ts
  __tests__/
    unit/
    integration/
    e2e/
```

## Getting Started

### Prerequisites

- Node.js 20+ recommended
- npm 10+ recommended

### Install dependencies

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and adjust values if needed:

```bash
cp .env.example .env
```

`.env.example` contains:

```env
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

Variable details:

- `PORT`: server port (required)
- `NODE_ENV`: `development` | `test` | `production`
- `RATE_LIMIT_WINDOW_MS`: rate limit window in milliseconds
- `RATE_LIMIT_MAX`: max requests per IP in a window
- `LOG_LEVEL`: Winston level (`error`, `warn`, `info`, `debug`)

## Run the Application

### Development mode (standard)

```bash
npm run dev
```

If your shell does not load `.env` automatically, run with explicit variables:

```bash
PORT=3000 NODE_ENV=development npm run dev
```

### Build and run production output

```bash
npm run build
npm start
```

### Health check

```bash
curl -sS http://localhost:3000/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  },
  "error": null
}
```

## Scripts

- `npm run dev`: run server with ts-node
- `npm run build`: compile TypeScript into `dist/`
- `npm start`: run built server from `dist/server.js`
- `npm test`: run Jest with coverage
- `npm run test:watch`: run Jest in watch mode
- `npm run lint`: lint TypeScript source files
- `npm run format`: format TypeScript source files

## API Reference

Base URL:

- `http://localhost:3000`

Books base path:

- `/api/v1/books`

### 1) Health

- Method: `GET`
- Path: `/health`
- Success: `200`

### 2) List Books

- Method: `GET`
- Path: `/api/v1/books`
- Query params:
  - `page` (optional, integer >= 1)
  - `limit` (optional, integer >= 1)

Example:

```bash
curl -sS "http://localhost:3000/api/v1/books?page=1&limit=10"
```

Success response (`200`):

```json
{
  "success": true,
  "data": [
    {
      "id": "2f2dc2af-4447-44df-a7a5-8e303de8fb74",
      "title": "Dune",
      "author": "Frank Herbert",
      "isbn": "9780441013593",
      "publishedYear": 1965,
      "genre": "Science Fiction",
      "createdAt": "2026-03-17T10:10:10.100Z",
      "updatedAt": "2026-03-17T10:10:10.100Z"
    }
  ],
  "error": null,
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### 3) Get Book by ID

- Method: `GET`
- Path: `/api/v1/books/:id`

Example:

```bash
curl -sS http://localhost:3000/api/v1/books/<BOOK_ID>
```

Success response (`200`):

```json
{
  "success": true,
  "data": {
    "id": "2f2dc2af-4447-44df-a7a5-8e303de8fb74",
    "title": "Dune",
    "author": "Frank Herbert",
    "isbn": "9780441013593",
    "publishedYear": 1965,
    "genre": "Science Fiction",
    "createdAt": "2026-03-17T10:10:10.100Z",
    "updatedAt": "2026-03-17T10:10:10.100Z"
  },
  "error": null
}
```

### 4) Create Book

- Method: `POST`
- Path: `/api/v1/books`
- Body: JSON

Request body:

```json
{
  "title": "Dune",
  "author": "Frank Herbert",
  "isbn": "9780441013593",
  "publishedYear": 1965,
  "genre": "Science Fiction"
}
```

Example:

```bash
curl -sS -X POST http://localhost:3000/api/v1/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dune",
    "author": "Frank Herbert",
    "isbn": "9780441013593",
    "publishedYear": 1965,
    "genre": "Science Fiction"
  }'
```

Success response (`201`): same envelope as Get Book.

### 5) Replace Book

- Method: `PUT`
- Path: `/api/v1/books/:id`
- Body: full book payload required

Example:

```bash
curl -sS -X PUT http://localhost:3000/api/v1/books/<BOOK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dune Messiah",
    "author": "Frank Herbert",
    "isbn": "9780441172696",
    "publishedYear": 1969,
    "genre": "Science Fiction"
  }'
```

Success: `200`

### 6) Patch Book

- Method: `PATCH`
- Path: `/api/v1/books/:id`
- Body: one or more optional fields

Example:

```bash
curl -sS -X PATCH http://localhost:3000/api/v1/books/<BOOK_ID> \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dune (Updated)"
  }'
```

Success: `200`

### 7) Delete Book

- Method: `DELETE`
- Path: `/api/v1/books/:id`

Example:

```bash
curl -i -X DELETE http://localhost:3000/api/v1/books/<BOOK_ID>
```

Success: `204 No Content`

## Validation Rules

Book payload rules:

- `title`: string, min 1, max 200 chars
- `author`: string, min 1, max 100 chars
- `isbn`: string, exactly 13 digits (`^\d{13}$`)
- `publishedYear`: integer between 1000 and current year
- `genre`: one of:
  - Fiction
  - Non-Fiction
  - Science Fiction
  - Fantasy
  - Mystery
  - Thriller
  - Romance
  - Horror
  - Biography
  - History

Path rules:

- `id`: must be a valid UUID

Query rules:

- `page`: integer >= 1
- `limit`: integer >= 1

Invalid input returns `422` with a message in the standard error envelope.

## Response Format

The API uses a consistent envelope:

### Success

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Error

```json
{
  "success": false,
  "data": null,
  "error": "Human readable message"
}
```

## Error Handling

Status codes used:

- `200`: successful read/update
- `201`: resource created
- `204`: resource deleted, no body
- `404`: route not found or book not found
- `422`: validation errors
- `500`: unexpected server error

Behavior:

- Domain not-found errors are converted into `404` responses
- Unknown errors are logged and returned as `500 Internal Server Error`
- Unmatched routes return `404 Not Found`

## Testing

### Run full test suite with coverage

Use env vars so app initialization passes in tests:

```bash
PORT=3000 NODE_ENV=test npm test
```

Coverage threshold target (configured in `jest.config.ts`):

- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

Current observed result on this repository state:

- 9/9 suites passed
- 173 tests passed
- Global coverage above threshold

### Watch mode

```bash
PORT=3000 NODE_ENV=test npm run test:watch
```

## Current Known Caveats

1. Build currently fails in strict TypeScript mode

At the moment, `npm run build` reports type errors related to `exactOptionalPropertyTypes` interactions in:

- `src/controllers/book.controller.ts`
- `src/repositories/in-memory-book.repository.ts`

2. Workaround for running the app during development

If you hit those type-check issues in local dev, this command runs via ts-node transpile-only mode:

```bash
PORT=3000 NODE_ENV=development TS_NODE_TRANSPILE_ONLY=1 npm run dev
```

3. In-memory persistence only

- Data is lost whenever the process restarts
- This is suitable for demos/tests, not production persistence

## Security Features

Implemented safeguards:

- Helmet security headers
- Rate limiting with configurable window/max values
- JSON payload limit (`10kb`)
- Input validation at request boundaries
- Structured error responses

## Design Decisions

- Repository interface separates business logic from storage implementation
- Service layer throws domain-specific errors (`NotFoundError`)
- Middleware pipeline keeps cross-cutting concerns isolated
- Response helper utilities ensure API consistency
- Immutable update patterns reduce accidental side effects

## Roadmap Ideas

Possible improvements to evolve this into a production-ready service:

1. Replace in-memory repository with PostgreSQL (or another persistent DB)
2. Add authentication/authorization (JWT or session-based)
3. Add OpenAPI/Swagger docs generation
4. Add request id and structured tracing for observability
5. Add pagination links and sorting/filtering support
6. Add CI workflow for lint/test/build gates
7. Add containerization (`Dockerfile` + compose profile)
8. Fix strict TypeScript build issues and enforce build in CI
