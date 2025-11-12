# Backend - NestJS Microservices

[![CI/CD](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions/workflows/ci.yml/badge.svg)](https://github.com/mohammadaminrez/Full-Stack-Application-Monorepo/actions)

Two NestJS services: Gateway handles HTTP requests, Auth Service handles business logic. They talk via TCP.

📖 [Main Docs](../README.md) | 🎨 [Frontend](../frontend/README.md)

---

## How It Works

```
API Gateway (port 3000) → Auth Service (TCP 3001) → MongoDB (27017)
```

Gateway receives REST API calls, Auth Service does the heavy lifting with database operations.

---

## Project Structure

```
apps/gateway/        - HTTP endpoints, JWT guards, Swagger docs
apps/authentication/ - business logic, database access
common/              - shared DTOs and interfaces
core/                - config, database, logging setup
```

---

## API Endpoints

**Swagger docs:** http://localhost:3000/api/docs
**Postman collection:** [API_Collection.json](./API_Collection.json)

```
POST   /api/auth/register    - create account
POST   /api/auth/login       - get JWT token
GET    /api/auth/users       - list all users (JWT required)
GET    /api/users            - your created users (JWT required)
POST   /api/users            - create a user (JWT required)
GET    /api/users/:id        - get specific user (JWT required)
PATCH  /api/users/:id        - update user (JWT required)
DELETE /api/users/:id        - delete user (JWT required)
GET    /api/health           - health check
```

---

## Running Locally

**With Docker (easiest):**
```bash
docker-compose up mongodb authentication gateway
```

**Without Docker:**
```bash
npm install
cp .env.example .env
npm run start:dev authentication  # terminal 1
npm run start:dev gateway         # terminal 2
```

---

## Testing

```bash
npm test              # 15 unit tests
npm run test:cov      # with coverage
npm run test:e2e      # 1 E2E test
```

Coverage: https://app.codecov.io/github/mohammadaminrez/Full-Stack-Application-Monorepo

---

## Tech Used

NestJS 10.3, TypeScript, MongoDB + Mongoose, Passport JWT, Winston (logging), Jest + Supertest, Swagger

---

## What's Included

- JWT authentication (Passport + bcrypt)
- Winston centralized logging
- Rate limiting (10 req/min on sensitive endpoints)
- Health checks for container orchestration
- Input validation (class-validator + Joi)
- CORS and security headers
- Repository pattern for data access
- Swagger API documentation
- Railway deployment ([dashboard](https://railway.com/invite/Tp5AKxHSOnp))

---

## Environment Variables

```bash
GATEWAY_PORT=3000
AUTH_HOST=localhost
AUTH_PORT=3001
MONGODB_URI=mongodb://localhost:27017/aladia
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
THROTTLE_TTL=60000
THROTTLE_LIMIT=10
```

---

Mohammad Amin Rezaei Sepehr
[@mohammadaminrez](https://github.com/mohammadaminrez)
