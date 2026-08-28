# 🐋 Docker To-Do List — Fullstack Application

![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

A full-stack to-do list application with real JWT authentication, a MongoDB-backed
REST API, and a Dockerized development/production setup.

## Features

- User registration and login with JWT (`jsonwebtoken` + `bcryptjs` password hashing).
- Create, list, edit, complete, delete, and drag-and-drop reorder tasks — reordering
  is persisted on the server (`PATCH /todos/reorder`), not just visual.
- Optional due dates per task.
- Data persistence with MongoDB.
- Responsive interface with TailwindCSS + shadcn/ui components.
- Backend health check endpoint (`GET /health`) and Docker `HEALTHCHECK`.
- Automated CI (GitHub Actions): backend lint + tests, frontend lint + typecheck +
  build, and a Docker image build check.

## Technologies Used

- **Frontend:** React 19, Vite, TypeScript, TailwindCSS, shadcn/ui, @dnd-kit.
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs.
- **Database:** MongoDB.
- **Infrastructure:** Docker, Docker Compose.
- **DevOps:** GitHub Actions (CI).
- **Testing:** Jest + Supertest (backend), with Mongoose models mocked so the suite
  runs deterministically without a live database connection.

## Project Structure

```
backend/
  src/
    config/       # env loading + Mongo connection
    models/       # Mongoose schemas (User, Todo)
    middlewares/   # auth guard, centralized error handler
    controllers/   # route handlers
    routes/        # Express routers (auth, todos, health)
    app.js         # Express app factory (used by both server and tests)
    index.js       # process entrypoint (validates env, connects DB, starts server)
  tests/
    unit/          # pure validation logic
    integration/   # HTTP-level tests via supertest, with mocked Mongoose models
frontend/
  src/             # React app (Vite + TypeScript)
docker-compose.yml # db, api, web, tests services
.github/workflows/ci.yml
```

## How to Run (Docker)

You need **Docker** and **Docker Compose**. No local Node or MongoDB install required.

1. Copy the environment template and set a real JWT secret:

   ```bash
   cp .env.example .env
   # Edit .env and replace JWT_SECRET with the output of:
   openssl rand -base64 48
   ```

2. Start the stack:

   ```bash
   docker-compose up --build
   ```

3. Access the application:

   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000
   - Backend health check: http://localhost:5000/health

## How to Run (local, without Docker)

Requires Node.js 20+ and a running MongoDB instance.

```bash
# Backend
cd backend
cp .env.example .env   # set JWT_SECRET and MONGO_URI
npm install
npm run dev             # http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev              # http://localhost:8080
```

## Testing

Backend tests are unit/integration tests written with Jest and Supertest. The
integration tests exercise the real Express routes and middleware, but the
Mongoose models are mocked with deterministic fixtures — **they do not require
a running MongoDB instance** and do not hit any external service.

```bash
# Locally
cd backend
npm test

# Via Docker Compose
docker-compose run --rm tests
```

There is currently **no automated frontend test suite**. Frontend correctness is
covered by `npm run lint`, `npm run typecheck`, and `npm run build` in CI.

## Backend Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start once, no auto-restart |
| `npm run lint` | ESLint |
| `npm test` | Jest test suite |
| `npm run test:coverage` | Jest with coverage report |

## Frontend Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## API Overview

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create a user account |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/auth/me` | Yes | Return the authenticated user |
| GET | `/todos` | Yes | List the user's tasks |
| POST | `/todos` | Yes | Create a task |
| PUT | `/todos/:id` | Yes | Toggle `completed` |
| PATCH | `/todos/:id` | Yes | Edit `text` and/or `dueDate` |
| PATCH | `/todos/reorder` | Yes | Persist a new task order (`{ orderedIds: string[] }`) |
| DELETE | `/todos/:id` | Yes | Delete a task |
| GET | `/health` | No | Liveness/readiness check |

All `/todos` routes are scoped to the authenticated user's own tasks.

## Known Limitations

- No password-reset flow.
- No rate limiting on `/auth/login` or `/auth/register` (recommended before any
  public deployment).
- No end-to-end/browser test suite — only backend unit/integration tests exist.
- The production frontend bundle is a single ~260 KB gzip chunk; code-splitting
  was intentionally left out of scope for this pass.

## Security Notes

- `JWT_SECRET` **must** be provided via environment variable; the application
  refuses to start without it outside of the test environment.
- If you obtained this repository from a version where a real secret value was
  committed to `docker-compose.yml` or `backend/src/index.js`, treat that value
  as compromised and rotate/replace it — do not reuse it.

#### Developed by [RobotEby](https://github.com/RobotEby)
