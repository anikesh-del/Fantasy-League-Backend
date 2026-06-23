# Fantasy League Backend

Backend API for a Fantasy Premier League–style application built with Node.js, Express, PostgreSQL, Redis, and BullMQ.

The project allows users to create and manage fantasy teams, track gameweek points, view leaderboards, and process gameweek settlements. Player and fixture data are periodically synced from the official Fantasy Premier League API using background workers.

## Features

* User authentication using JWT
* Create and manage fantasy teams
* Squad validation with budget, position, and transfer constraints
* Captain and vice-captain point multipliers
* Gameweek point calculation and player-level breakdowns
* Leaderboards with ranking support
* Background jobs for FPL data synchronization
* Gameweek settlement using BullMQ workers
* Redis caching for frequently accessed data
* Redis-based sliding window rate limiting
* Request validation using Zod

---

## Architecture

[Architecture Diagram](docs/architecture.png)

Client (Postman / Browser)
        │
        ▼
     Express API
        │
  ┌─────┴─────┐
  ▼           ▼
PostgreSQL   Redis
  │           │
  │           ▼
  │        BullMQ
  │           │
  └─────┬─────┘
        ▼
     Workers
        │
        ▼
      FPL API




## Tech Stack

| Layer            | Technology             |
| ---------------- | ---------------------- |
| Runtime          | Node.js                |
| Framework        | Express.js             |
| Database         | PostgreSQL             |
| Cache            | Redis                  |
| Queue System     | BullMQ                 |
| Authentication   | JWT, bcrypt            |
| Validation       | Zod                    |
| Testing          | Jest, Supertest        |
| Migrations       | dbmate                 |
| Containerization | Docker, Docker Compose |

---

## Setup

### Clone the repository

```bash
git clone https://github.com/anikesh-del/Fantasy-League-Backend.git
cd Fantasy-League-Backend
```

### Install dependencies

```bash
npm install
```

### Create environment variables

Create a `.env` file:

```env
DATABASE_URL=postgres://fantasy_user:fantasy_password@localhost:5432/fantasy_db
JWT_SECRET=your_secret
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=5000
```

### Start PostgreSQL and Redis

```bash
docker compose up -d postgres redis
```

### Run migrations

```bash
npx dbmate up
```

### Start the application

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

### Run the full Docker stack

```bash
docker compose up -d
```

### Health Check

```bash
curl http://localhost:5000/health
```

---

## API Documentation

The Postman collection is available in:

```text
docs/Fantasy-League.postman_collection.json
```

Import the collection into Postman and set the `baseUrl` variable to your local or deployed URL.

---

## Main Endpoints

| Method | Endpoint                                | Description                    |
| ------ | --------------------------------------- | ------------------------------ |
| GET    | `/health`                               | Health check                   |
| POST   | `/api/v1/auth/signup`                   | Register user                  |
| POST   | `/api/v1/auth/login`                    | Login                          |
| GET    | `/api/v1/auth/getme`                    | Current user profile           |
| POST   | `/api/v1/fantasy/team`                  | Create fantasy team            |
| GET    | `/api/v1/fantasy/team`                  | Get team details               |
| POST   | `/api/v1/fantasy/team/players`          | Add player                     |
| DELETE | `/api/v1/fantasy/team/players/:id`      | Remove player                  |
| PATCH  | `/api/v1/fantasy/team/captain`          | Update captain or vice-captain |
| DELETE | `/api/v1/fantasy/team/reset`            | Reset squad                    |
| GET    | `/api/v1/fantasy/points`                | Get gameweek points            |
| GET    | `/api/v1/fantasy/leaderboard`           | View leaderboard               |
| POST   | `/api/v1/admin/sync`                    | Trigger data sync              |
| POST   | `/api/v1/admin/sync/gameweek-stats/:id` | Sync gameweek stats            |
| POST   | `/api/v1/admin/settle/:gameweek_id`     | Trigger gameweek settlement    |

---

## Future Improvements

* CI/CD pipeline
* OpenAPI / Swagger documentation
* Automated deployment
* Additional integration tests
* Monitoring and observability


