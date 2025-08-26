# DevSecOps React + Node/Express (No DB, JSON FS) Demo

A small full‑stack demo to practice **DevSecOps** with a React frontend and a Node/Express backend.
Data is stored in a local JSON file (no database). Includes CI with tests, linting, SAST, secret scanning, and dependency scanning.

## Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express, Helmet, CORS, Zod validation, Rate limiting, Morgan logging
- **Storage**: JSON file under `backend/data/items.json`
- **Tests**: Vitest (+ RTL) for frontend, Jest + Supertest for backend
- **Dev tooling**: ESLint + Prettier
- **Security**: Gitleaks (secrets), Semgrep (SAST), Trivy (filesystem/deps), npm audit
- **CI**: GitHub Actions (see `.github/workflows`)

## Quick start (local)
```bash
# 1) Install Node 20+ and Git
# 2) Install deps (workspace-aware)
npm install

# 3) Run dev servers (Vite + Express concurrently)
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:4000
```

## Useful scripts
```bash
npm run lint     # ESLint (frontend + backend)
npm test         # Tests (frontend + backend)
npm run audit    # npm audit (non-blocking)
npm run gitleaks # local secret scan (non-blocking)
```

## API (backend)
- `GET /api/items` → list items
- `POST /api/items` → `{ title: string }` add new
- `PUT /api/items/:id` → `{ title: string }` update title
- `DELETE /api/items/:id` → delete

## VS Code
- Recommended extensions will be suggested (ESLint, Prettier). Workspace settings are in `.vscode/`.
- Format on save is enabled.

## CI
- See `.github/workflows/ci.yml` and `codeql.yml`. Dependabot is enabled via `.github/dependabot.yml`.
```

