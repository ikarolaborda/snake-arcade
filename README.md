# Snake Arcade

A classic Snake game with Nokia-style wrap-around mechanics, a 15-level progression system, and a leaderboard. Built with Vue 3 and Express.js.

## Quick Start

Requires **Node.js 20+**.

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev          # runs on :3001

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # runs on :5173, proxies /api to backend
```

Open `http://localhost:5173`.

## Gameplay

- **Wrap-around** — the snake exits one edge and enters from the opposite side (Nokia style, no wall death)
- **15 levels** — score thresholds determine your level; each level increases speed and points per food
- **Special food** — spider food (triple points) and blue food (40% speed reduction for 6s) spawn randomly after eating
- **Collision grace** — a brief input window before self-collision kills you, so fast direction changes don't feel unfair
- **Leaderboard** — scores are submitted to the backend and persisted in SQLite

### Controls

| Input | Action |
|-------|--------|
| Arrow keys / WASD | Move |
| Space / Escape / P | Pause / Resume |
| Touch swipe | Move (mobile) |
| D-pad buttons | Move (mobile, portrait) |

### Level Progression

Each level has a score threshold, its own points-per-food value, and a tick speed. The table lives in `frontend/src/types/index.ts` (`LEVEL_TABLE`).

| Level | Score Threshold | Pts/Food | Speed (ms) |
|-------|----------------|----------|------------|
| 1 | 0 | 10 | 200 |
| 2 | 500 | 15 | 180 |
| 3 | 1,500 | 20 | 160 |
| 4 | 3,500 | 30 | 145 |
| 5 | 7,000 | 40 | 130 |
| 6 | 12,000 | 55 | 118 |
| 7 | 20,000 | 75 | 106 |
| 8 | 32,000 | 100 | 95 |
| 9 | 50,000 | 130 | 85 |
| 10 | 75,000 | 170 | 76 |
| 11 | 110,000 | 220 | 68 |
| 12 | 160,000 | 280 | 62 |
| 13 | 230,000 | 350 | 57 |
| 14 | 330,000 | 440 | 53 |
| 15 | 480,000 | 550 | 50 |

Spider food awards `pointsPerFood × 3`. Blue food awards no points but slows the snake by 40% for 6 seconds.

## Project Structure

```
backend/
  src/
    controllers/       # Request handlers
    middleware/         # Error handling, rate limiting
    repositories/      # Data access (SQLite; swappable via interface)
    routes/            # API route definitions
    services/          # Validation, business logic
    types/             # Shared TypeScript interfaces
  tests/               # Vitest unit tests

frontend/
  src/
    components/        # Vue SFC (GameBoard, ScorePanel, LeaderboardPanel, etc.)
    composables/       # Game logic (useSnakeGame), controls, leaderboard, sound
    types/             # Game types, level table, direction maps
    utils/             # API client
  tests/               # Vitest unit tests
```

## API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/scores?limit=10&page=1` | Top scores (paginated) |
| `POST` | `/api/scores` | Submit a score |
| `GET` | `/api/scores/stats` | Aggregate stats |

### POST /api/scores

```json
{
  "name": "Player1",
  "score": 1250,
  "duration": 93,
  "moves": 312
}
```

Validation: name 1–20 chars, score 0–999,999,999, duration 0–7200s, moves 0–50,000. Rate limited to 10 submissions per minute.

## Configuration

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | API server port |
| `DB_PATH` | `./data/scores.db` | SQLite database file |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | `10` | Max submissions per window |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3001/api` | Backend API URL |

The Vite dev server proxies `/api` to the backend, so the env var is only needed for production builds.

## Tests

```bash
cd backend && npm test    # 23 tests (service validation, repository, pagination)
cd frontend && npm test   # 36 tests (wrap-around, collision, food spawning, level table)
```

## Swapping to PostgreSQL

The backend uses a repository pattern. To switch storage:

1. Create `src/repositories/postgres.repository.ts`
2. Implement the `ScoreRepository` interface from `src/types/index.ts` (`initialize`, `create`, `getTopScores`, `getStats`, `count`)
3. Swap the instantiation in `src/app.ts`

No changes needed in the service or controller layers.

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite, TypeScript, Tailwind CSS
- **Backend**: Express.js, TypeScript, better-sqlite3
- **Testing**: Vitest
- **Fonts**: Press Start 2P, Inter
