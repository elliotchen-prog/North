# LifeAssist — Frontend

Next.js frontend for the AI Life Assistant (Chris's portion).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features (Phase 1 MVP)

- **Home screen** — Input box + example suggestion chips
- **Results screen** — Situation card, possible causes, action plan, draft message (when available), tools (Generate message / Adjust plan / Ask follow-up)
- **API layer** — Calls backend `/api/analyze` and `/api/message` when available
- **Mock mode** — Uses in-app mock responses when `NEXT_PUBLIC_USE_MOCK_API` is not set to `"false"`, so you can demo without the backend

## Connect to backend

1. Copy `.env.local.example` to `.env.local`
2. Set `NEXT_PUBLIC_USE_MOCK_API=false`
3. Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` (or your backend URL)

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
