# BigBro

![BigBro Poster](/public/big-bro-poster.jpeg)

BigBro is a persona-driven social campaign workspace for generating and propagating narratives. Every action flows through a mandatory human approval step before anything reaches a platform. No autonomous posting. Ever.

---

## Core Concepts

**Campaign Canvas** — An infinite, zoomable workspace where each persona lives as a draggable node. This is the primary workspace. Everything starts here.

**Persona Cockpit** — A right-side sliding panel for editing a persona's profile, style guide, platform settings, and credentials. One persona at a time, in full detail.

**Approval Queue** — Every generated draft lands here before it can go anywhere. Approve or reject. The system will not publish without a human decision.

**Platform Credentials** — Per-persona credential storage for LinkedIn, X, Instagram, and Reddit. Isolated, per-platform, with an encryption-at-rest boundary.

---

## Current Status

Core MVP flows are implemented and running locally:

- Campaign Canvas route is live with React Flow — pan, zoom, drag, and node persistence
- Persona CRUD is wired end-to-end via Server Actions + Prisma (profile, style guide, canvas position)
- Persona Cockpit is functional with editable profile, style, and credential panels
- Approval Queue route exists with Approve / Reject actions backed by draft status transitions
- Platform connection tests are currently stubs — status is derived from saved credential payloads, not live API calls
- Autonomous posting is intentionally disabled

**Known gaps:**

- Credentials are stored in plain DB fields — encryption-at-rest boundary is not yet implemented
- No live platform posting pipeline (LinkedIn, X, Instagram, Reddit adapters are not wired)
- Current DB is SQLite — long-term target is Postgres
- Test coverage is minimal

---

## Tech Stack

- Next.js 15 (App Router) + TypeScript + React 19
- Tailwind CSS 4
- Prisma ORM (SQLite locally; Postgres targeted for production)
- React Flow (canvas workspace)
- Zod (schema validation)
- `@uiw/react-md-editor` (persona style guide editing)

---

## Local Development

Prerequisites: Node.js 20+

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000`.

---

## Scripts

```bash
npm run dev      # local dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint
```

---

## Repository Layout

```
src/app/                                       # Next.js App Router routes and components
openspec/changes/build-bigbro-mvp/            # Product definition and implementation plan
openspec/changes/build-bigbro-mvp/proposal.md # Why and what changes
openspec/changes/build-bigbro-mvp/design.md   # Architecture decisions and trade-offs
openspec/changes/build-bigbro-mvp/tasks.md    # Implementation task list
openspec/changes/build-bigbro-mvp/specs/      # Capability-level requirements
```

---

## Product Scope

The full MVP definition lives in `openspec/changes/build-bigbro-mvp`. The spec is locked. Do not expand scope mid-implementation. Later phases (LLM generation, ingestion workers, live posting adapters) plug in through established service boundaries without touching the core domain model.

Non-goals for the current phase: multi-user collaboration, narrative map edges/arrows, A/B variant tooling, background aggregation workers, full posting integration.
