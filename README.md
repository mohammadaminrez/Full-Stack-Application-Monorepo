# Full-Stack Application Monorepo

[![CI/CD](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions)
[![codecov](https://codecov.io/gh/mohammadaminrez/Full-Stack-Application-Monorepo/branch/main/graph/badge.svg)](https://codecov.io/gh/mohammadaminrez/Full-Stack-Application-Monorepo)

A full-stack app built with NestJS microservices and Next.js 14. Includes proper CI/CD pipeline, comprehensive testing, and production deployment.

🚀 **[Live Demo](https://web-production-9514b.up.railway.app/)** | 📖 [Backend](./backend/README.md) | 📖 [Frontend](./frontend/README.md)

---

## Quick Start

Clone and run everything with Docker:

```bash
git clone https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo.git
cd Full-Stack-Application-Monorepo
docker-compose up --build
```

Then visit:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000/api
- API Docs: http://localhost:3000/api/docs

---

## Architecture

The app uses a microservices setup:

- **Frontend (Next.js 14)** on port 3001 - handles UI with 5 reusable components and dark mode
- **API Gateway (NestJS)** on port 3000 - receives HTTP requests, handles JWT auth, rate limiting
- **Auth Service (NestJS)** on TCP 3001 - business logic and data access layer
- **MongoDB** on port 27017 - database

Gateway talks to Auth Service via TCP for better performance. Frontend talks to Gateway via REST.

---

## Testing

**Backend (16 tests total)**
- Jest for unit tests - covers controllers, services, and repositories
- Supertest for E2E - tests the full auth flow
- Uses in-memory MongoDB so tests run fast

**Frontend (13 tests total)**
- Vitest for component tests - all 5 UI components covered
- Cypress for E2E - login, register, and CRUD flows
- Storybook for component docs - [visual tests on Chromatic](https://69149bd7273a23278e7b0974-qycxktqtfp.chromatic.com/)

Coverage reports: https://app.codecov.io/github/mohammadaminrez/Full-Stack-Application-Monorepo

---

## CI/CD

GitHub Actions runs on every push. Here's what happens:

1. **Backend tests** - linting, build, Jest tests, coverage to Codecov
2. **Frontend tests** - linting, type check, Vitest tests, build check, coverage to Codecov
3. **E2E tests** - spins up MongoDB + backend, runs Cypress (saves videos if fails)
4. **Visual tests** - builds Storybook, runs Chromatic for visual diffs
5. **Docker build** - creates production images for both services

Everything must pass before merge. Auto-deploys to Railway on main branch.

---

## What's Inside

**Backend**
- NestJS microservices (Gateway + Auth Service over TCP)
- MongoDB with Mongoose, using repository pattern
- JWT auth with Passport
- Swagger docs at `/api/docs`
- Rate limiting on auth endpoints
- Winston logging
- [Postman collection](backend/API_Collection.json) included

**Frontend**
- Next.js 14 with App Router
- 5 UI components (Button, Card, InputField, Modal, Tabs) - all tested and documented
- Dark mode toggle
- Form validation with React Hook Form + Zod
- Tailwind for styling
- Axios with auto JWT token injection

**DevOps**
- Docker Compose for local dev (4 services)
- GitHub Actions CI/CD pipeline
- [Codecov](https://app.codecov.io/github/mohammadaminrez/Full-Stack-Application-Monorepo) for coverage
- [Railway](https://railway.com/invite/Tp5AKxHSOnp) for production hosting

---

## API Endpoints

```
POST   /api/auth/register    - Sign up
POST   /api/auth/login       - Get JWT token
GET    /api/auth/users       - List all users (needs JWT)
GET    /api/users            - Your created users (needs JWT)
POST   /api/users            - Create a user (needs JWT)
GET    /api/users/:id        - Get user by ID (needs JWT)
PATCH  /api/users/:id        - Update user (needs JWT)
DELETE /api/users/:id        - Delete user (needs JWT)
GET    /api/health           - Health check
```

Try them: http://localhost:3000/api/docs (Swagger UI)
Or import: [Postman collection](backend/API_Collection.json)

---

## Tech Stack

**Backend:** NestJS 10.3, TypeScript, MongoDB + Mongoose, Passport JWT, Winston logging, Jest + Supertest

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vitest, Cypress, Storybook, Chromatic

**DevOps:** Docker Compose, GitHub Actions, Railway, Codecov

---

## Deployment

**Production:** https://web-production-9514b.up.railway.app/

Running on Railway ([dashboard here](https://railway.com/invite/Tp5AKxHSOnp)). The CI/CD pipeline auto-deploys when you push to main (after all tests pass).

**Local Docker:**
```bash
docker-compose up --build -d   # Start all services
docker-compose logs -f          # Watch logs
docker-compose down -v          # Stop and clean up
```

---

## Features Worth Mentioning

- **Microservices** - Gateway and Auth service communicate via TCP
- **Comprehensive testing** - 29 tests total (unit, E2E, visual regression)
- **CI/CD pipeline** - automated testing and deployment
- **Production ready** - proper logging, rate limiting, health checks
- **Security** - JWT auth, bcrypt passwords, input validation, CORS
- **Developer friendly** - hot reload, TypeScript, ESLint, Prettier, Swagger docs
- **Component library** - 5 reusable UI components with Storybook docs
- **Code coverage tracking** - integrated with Codecov

---

## Environment Variables

Copy the example files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Backend needs: MongoDB URI, JWT secret, rate limit configs
Frontend needs: API URL

---

**More details:** [Backend README](./backend/README.md) | [Frontend README](./frontend/README.md)

---

Mohammad Amin Rezaei Sepehr
[@mohammadaminrez](https://github.com/mohammadaminrez)
