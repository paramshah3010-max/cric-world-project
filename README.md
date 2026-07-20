# 🏏 CRIC WORLD

> **Every Ball. Every Run. Every Moment.**

CRIC WORLD is a premium cricket live-score and match-management platform. This
repository contains the **initial foundation** — a clean, working full-stack
base that can grow into a complete cricket scoring platform.

> ⚠️ **Foundation build.** Live scoring, ball-by-ball engine, WebSockets,
> tournament management and the advanced admin dashboard are **not** included
> yet. All teams, players and matches shipped here are clearly-marked **demo
> data**.

---

## 1. Project Overview

CRIC WORLD is split into two apps in one repository (a monorepo):

- **`client/`** — a React single-page app (the website users see).
- **`server/`** — an Express REST API backed by PostgreSQL via Prisma.

The frontend talks to the backend over a REST API. The code is intentionally
structured so real-time **Socket.IO** scoring can be layered on later without
rewriting the foundation.

### Current working features

- Responsive, dark, premium UI with an original CRIC WORLD brand.
- Pages: Home, Matches (All / Live / Upcoming / Completed), Match Details,
  Login, Register, plus placeholder pages for future sections.
- Reusable match cards and a match-details page with tabs
  (Summary works; Scorecard / Commentary / Statistics / Squads are ready-to-fill
  placeholders).
- REST API for matches and authentication.
- JWT + bcrypt authentication with role support (USER / SCORER / ADMIN).
- Prisma schema + seed with realistic demo data.

---

## 2. Technology Stack

| Layer      | Technology                                   |
| ---------- | -------------------------------------------- |
| Frontend   | React 18, Vite, TypeScript, React Router 6   |
| Styling    | Tailwind CSS (custom dark theme)             |
| Backend    | Node.js, Express 4                           |
| Database   | PostgreSQL                                   |
| ORM        | Prisma 5                                      |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs`            |
| Dev tools  | nodemon, concurrently                        |

---

## 3. Folder Structure

```
CRIC-WORLD/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, MatchCard, states, ...)
│   │   ├── pages/              # Route pages (Home, Matches, MatchDetails, ...)
│   │   ├── layouts/            # MainLayout (navbar + footer shell)
│   │   ├── hooks/              # useAsync data-fetching hook
│   │   ├── services/           # API client (fetch wrapper, matches, auth)
│   │   ├── context/            # AuthContext (login/register/session)
│   │   ├── utils/              # types + formatting helpers
│   │   └── assets/
│   └── package.json
│
├── server/                     # Express + Prisma backend
│   ├── src/
│   │   ├── controllers/        # Request handlers (match, auth)
│   │   ├── routes/             # Route definitions (+ /health)
│   │   ├── services/           # Business logic / DB access
│   │   ├── middleware/         # auth guard + error handling
│   │   ├── utils/              # ApiError, asyncHandler, jwt
│   │   └── config/             # env + prisma client
│   ├── prisma/
│   │   └── seed.js             # Demo data seeder
│   └── package.json
│
├── prisma/
│   └── schema.prisma           # Database models
│
├── .env.example                # Copy to server/.env
├── package.json                # Root scripts (run both apps together)
└── README.md
```

---

## 4. Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14 running locally (or a connection string to a remote DB)

If you have Docker, the quickest way to get PostgreSQL:

```bash
docker run -d --name cricworld-pg \
  -e POSTGRES_USER=cricworld \
  -e POSTGRES_PASSWORD=cricworld \
  -e POSTGRES_DB=cricworld \
  -p 5432:5432 postgres:16-alpine
```

---

## 5. Installation

Clone the repo, then install every package (root + client + server):

```bash
npm run install:all
```

(That runs `npm install` in the root, `server/` and `client/`.)

---

## 6. Environment Variables

Copy the example file into the server and adjust values as needed:

```bash
cp .env.example server/.env
```

| Variable         | Description                                        | Example                                                              |
| ---------------- | -------------------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string used by Prisma        | `postgresql://cricworld:cricworld@localhost:5432/cricworld?schema=public` |
| `JWT_SECRET`     | Secret used to sign JWT access tokens              | `a-long-random-string`                                               |
| `JWT_EXPIRES_IN` | Token lifetime                                     | `7d`                                                                 |
| `PORT`           | Port the API listens on                            | `4000`                                                               |
| `CLIENT_ORIGIN`  | Allowed CORS origin(s), comma-separated            | `http://localhost:5173`                                             |

> The frontend uses Vite's dev proxy, so it needs no env vars locally. To point
> the client at a non-local API, copy `client/.env.example` to `client/.env`
> and set `VITE_API_BASE_URL`.

**Never commit your real `.env`** — it is git-ignored.

---

## 7. Database Setup

With `server/.env` configured and PostgreSQL running:

```bash
# Generate the Prisma client, run migrations, and seed demo data in one go:
npm run db:setup

# ...or run the steps individually:
npm run prisma:generate   # generate the typed Prisma client
npm run prisma:migrate    # create tables (prisma migrate dev)
npm run prisma:seed       # load demo teams/players/matches
```

Handy Prisma commands (run from `server/`):

| Command                            | What it does                          |
| ---------------------------------- | ------------------------------------- |
| `npm run prisma:generate`          | Regenerate the Prisma client          |
| `npm run prisma:migrate`           | Create/apply a dev migration          |
| `npm run prisma:seed`              | Seed demo data                        |
| `npm run prisma:studio`            | Open Prisma Studio (DB GUI)           |

---

## 8. Running the App

### Run everything together (recommended)

From the repository root:

```bash
npm run dev
```

This starts the API on **http://localhost:4000** and the frontend on
**http://localhost:5173** concurrently. Open the frontend URL in your browser.

### Run each app separately

```bash
# Terminal 1 — backend
npm run dev:server        # or: cd server && npm run dev

# Terminal 2 — frontend
npm run dev:client        # or: cd client && npm run dev
```

### Production build (frontend)

```bash
npm run build             # type-checks and builds client/dist
```

### Demo login

The seed creates three demo accounts (password: `password123`):

| Email                   | Role   |
| ----------------------- | ------ |
| `admin@cricworld.dev`   | ADMIN  |
| `scorer@cricworld.dev`  | SCORER |
| `user@cricworld.dev`    | USER   |

---

## 9. API Endpoints

Base URL: `http://localhost:4000/api`

| Method | Endpoint                  | Auth | Description                       |
| ------ | ------------------------- | ---- | --------------------------------- |
| GET    | `/health`                 | —    | Service health check              |
| GET    | `/matches`                | —    | All matches                       |
| GET    | `/matches/live`           | —    | Live matches                      |
| GET    | `/matches/upcoming`       | —    | Upcoming matches                  |
| GET    | `/matches/completed`      | —    | Completed matches                 |
| GET    | `/matches/:id`            | —    | Single match by id                |
| POST   | `/auth/register`          | —    | Create an account, returns a JWT  |
| POST   | `/auth/login`             | —    | Log in, returns a JWT             |
| GET    | `/auth/me`                | ✅   | Current user (Bearer token)       |

**Response shape.** Success responses are wrapped as `{ "data": ... }`.
Errors are `{ "error": { "message": string, "details"?: any } }`.

Example:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/matches/live

# Log in and call a protected route
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@cricworld.dev","password":"password123"}' \
  | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).data.token))")

curl http://localhost:4000/api/auth/me -H "Authorization: Bearer $TOKEN"
```

---

## 10. Demo Data

The seed (`server/prisma/seed.js`) creates **fictional** content:

- **10 teams**, **30 players** (3 per team), **4 venues**, **3 tournaments**
- **10 matches**: **3 live**, **3 upcoming**, **4 completed**
- **3 users** (one per role)

None of it represents real cricket teams, players, or results.

---

## 11. Future Development Roadmap

The schema and component structure are designed to grow. Suggested phases:

1. **Live scoring engine** — add `Innings`, `Over`, `Ball`, `BattingScore`,
   `BowlingFigure`, `Partnership`, `FallOfWicket`, `Commentary` models that
   reference the existing `Match`.
2. **Real-time updates** — add a Socket.IO layer alongside the REST API
   (namespaced under `/socket`) to push ball-by-ball updates.
3. **Fill the Match Details tabs** — Scorecard, Commentary, Statistics, Squads.
4. **Tournament management** — standings, fixtures, points tables.
5. **Scorer & admin tooling** — role-gated dashboards for entering scores.
6. **Search, notifications, rankings, news** — the placeholder nav sections.

### Recommended next task

Build the **live scoring data model + endpoints**: add the innings/over/ball
Prisma models, a migration, and read endpoints (e.g. `GET /api/matches/:id/scorecard`)
so the Match Details "Scorecard" tab can render real data. This is the natural
next step before introducing real-time Socket.IO updates.

---

## License

Original project. Do not include proprietary branding, logos, or code from any
existing cricket application. All demo content is fictional.
