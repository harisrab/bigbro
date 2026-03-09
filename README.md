# BigBro

BigBro is a persona-driven social campaign workspace focused on:

- A primary infinite Campaign Canvas with draggable persona nodes
- A right-side Persona Cockpit for profile and style editing
- A mandatory human Approval Queue before any publishing
- Per-persona platform credential management with encryption-at-rest

The product scope is defined in OpenSpec under `openspec/changes/build-bigbro-mvp`.

## Current Status

This repository is at the bootstrap stage:

- Next.js + TypeScript app scaffold is in place
- Dependencies for the MVP stack are installed (Prisma, React Flow, markdown editor, Zod)
- OpenSpec proposal/design/spec/tasks for the MVP are present
- Core product features are not implemented yet

## MVP Scope (Planned)

From the active spec (`build-bigbro-mvp`), the first implementation phase includes:

- Campaign Canvas workspace with pan/zoom and persistent node positions
- Persona creation and cockpit editing (structured fields + markdown style guides)
- Approval Queue route with Approve / Reject flow
- Credential storage per platform (LinkedIn, X, Instagram, Reddit) with encryption boundaries

See:

- `openspec/changes/build-bigbro-mvp/proposal.md`
- `openspec/changes/build-bigbro-mvp/design.md`
- `openspec/changes/build-bigbro-mvp/tasks.md`
- `openspec/changes/build-bigbro-mvp/specs/*`

## Tech Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma ORM (targeting Postgres in MVP plan)
- React Flow (canvas/workspace UI)
- `@uiw/react-md-editor` (markdown editing)
- Zod (schema validation)

## Local Development

Prerequisites:

- Node.js 20+
- npm

Run locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - run ESLint

## Repository Layout

```text
src/app/                                      # Next.js app router entrypoints
openspec/changes/build-bigbro-mvp/            # Product definition and implementation plan
openspec/changes/build-bigbro-mvp/specs/      # Capability-level requirements
```
