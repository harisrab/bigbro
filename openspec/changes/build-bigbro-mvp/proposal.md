## Why

BigBro has a locked March 2026 product definition but no implementation yet, so we need a concrete foundation that turns the spec into working software quickly without reopening UX decisions. Delivering a Phase 1 baseline now unblocks iterative MVP delivery while preserving the final architecture and dark cyber visual direction.

## What Changes

- Initialize a production-grade Next.js 15 application with TypeScript, App Router, dark cyber theme tokens, and baseline shell navigation aligned with BigBro.
- Implement the primary Campaign Canvas experience with an infinite/zoomable workspace and draggable persona nodes.
- Implement persona creation/editing foundations with structured profile fields and markdown personality/style sections in a right-side sliding cockpit.
- Persist persona records and canvas coordinates in Vercel Postgres via Prisma.
- Add a dedicated Approval Queue route and data model scaffolding so generated drafts can flow through mandatory human approval in later phases.
- Establish extensible service boundaries for LLM generation, platform integrations, and background aggregation without enabling autonomous posting.

## Capabilities

### New Capabilities
- `campaign-canvas-workspace`: Infinite canvas workspace with draggable persona nodes, status indicators, and persistent positions.
- `persona-cockpit-management`: Persona lifecycle and cockpit editing for structured identity fields plus markdown personality/style content.
- `approval-queue-foundation`: Global pending-draft queue UI/data foundation enforcing human-in-the-loop publishing workflow.
- `platform-credentials-foundation`: Per-persona, per-platform credential storage interfaces with encrypted-at-rest persistence scaffolding.

### Modified Capabilities
- None.

## Impact

- New Next.js codebase under this repository (App Router routes, React components, server actions).
- New Prisma schema/migrations and DB access layer targeting Vercel Postgres.
- New UI dependency stack (React Flow, markdown editor, styling primitives) and state/data plumbing.
- Future integrations (Clerk, Vercel AI SDK, Inngest, platform APIs) are prepared through explicit interfaces but not fully activated until subsequent tasks.
