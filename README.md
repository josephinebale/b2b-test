# Hireup for Providers — research prototype

Clickable research prototype of the provider experience. React, Vite, Tailwind, and `lucide-react` only.

**Source of truth:** [`PROJECT.md`](PROJECT.md) — current behaviour, data, flags, and deploy.  
**IA tree:** [`TARGET-IA.md`](TARGET-IA.md)  
**Visual audit:** [`AUDIT.md`](AUDIT.md)

**Live:** https://josephinebale.github.io/b2b-test/ (GitHub Pages from `main`)

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3021/ (hash routes, e.g. `#/bookings`). Port is pinned to **3021** in `package.json`.

## Check

```bash
npm run lint
node --test tests/*.test.ts
```

## Git tags

| Tag | Use |
|---|---|
| `demo-data-hand-authored` | Last commit before the realistic-scale seed (`ad25dd4`) — hand-authored CPA data for legible live demos |
| `pre-overview-redesign` | Seeded scale with audit findings closed through token gaps (`a97816e`) |
| `checkpoint-10-sep-2026` | Pre-experimental checkpoint (`93108b4`) |
