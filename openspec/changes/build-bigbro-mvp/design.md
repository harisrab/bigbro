## Context

BigBro currently has no application code. The locked product brief defines a single-user Next.js dashboard centered on an infinite Campaign Canvas with persona cockpit workflows, strict human approval for publishing, and platform-specific voice controls. The architecture must support rapid MVP iteration while preventing accidental drift from defined UX constraints (no autonomous posting, no extra navigation hubs, no analytics expansion).

## Goals / Non-Goals

**Goals:**
- Stand up a deployable Next.js 15 App Router codebase with TypeScript and a reusable dark cyber design foundation.
- Implement the Phase 1 UX backbone: canvas workspace, draggable persona nodes, persona cockpit shell, and editable personality/style fields.
- Persist personas and canvas coordinates in Postgres through Prisma with clean server action boundaries.
- Introduce approval queue and platform credential data structures/interfaces to enforce human-in-the-loop publication and future integration readiness.
- Keep implementation modular so later phases (LLM generation, ingestion jobs, posting adapters) plug in without refactoring core domain models.

**Non-Goals:**
- Full posting integrations for every platform in this change.
- Background mention/comment aggregation workers in this change.
- Narrative map, grouping, edges/arrows, or A/B variant tooling.
- Multi-user collaboration or team permissions.

## Decisions

### 1) App architecture: Next.js 15 App Router + Server Actions
- Decision: Build routes with Server Components by default and mutate data through explicit Server Actions.
- Rationale: Matches the locked architecture, reduces API boilerplate, and keeps domain operations close to UI entry points.
- Alternative considered: REST API routes for all mutations. Rejected for MVP speed and increased ceremony.

### 2) Canvas engine: React Flow with persisted viewport/node positions
- Decision: Use React Flow in controlled mode with persona nodes backed by DB positions (`x`, `y`) and optional viewport state.
- Rationale: Satisfies infinite draggable canvas requirement and provides extensibility for future map-like overlays.
- Alternative considered: Custom CSS transform canvas. Rejected due to higher complexity and weaker ergonomics.

### 3) Data model: Persona-centric schema with embedded style content and platform subrecords
- Decision: Create Prisma models for `Persona`, `PersonaPlatform`, `Draft`, `ActivityItem`, and `EncryptedCredential`.
- Rationale: Aligns with cockpit UX where one persona is the center of editing, generation, activity, and approval.
- Alternative considered: Separate profile/style tables per platform. Rejected for unnecessary fragmentation in MVP.

### 4) Security boundary: encrypted credential vault service
- Decision: Add a dedicated encryption service wrapper around Node crypto using an app-level secret and authenticated encryption before persistence.
- Rationale: Enforces encrypted-at-rest API keys while keeping platform adapters agnostic of crypto details.
- Alternative considered: plaintext in DB for local MVP. Rejected due to explicit security requirement.

### 5) UI composition: single primary workspace + sliding cockpit
- Decision: Keep `/` as canonical Campaign Canvas route with right-drawer cockpit and expose Approval Queue via `/approval-queue` and top quick link.
- Rationale: Preserves locked interaction model where most workflows stay in canvas context.
- Alternative considered: separate tabbed pages per concern. Rejected due to product constraints.

## Risks / Trade-offs

- [Risk] React Flow + large node counts can degrade render performance. → Mitigation: memoized node renderers, minimal node payloads, and deferred loading for heavy cockpit sections.
- [Risk] Server Action errors can be opaque in production. → Mitigation: centralized action result helpers and typed error envelopes for UI feedback.
- [Risk] Credential encryption key misconfiguration can block all platform operations. → Mitigation: startup validation + explicit health check for crypto config.
- [Risk] Over-scoping MVP into full integration can stall delivery. → Mitigation: phase-gated task list with strict boundaries and placeholders for future adapters.

## Migration Plan

1. Initialize app dependencies and baseline configuration.
2. Create Prisma schema and run initial migration against Vercel Postgres.
3. Build Campaign Canvas + persona cockpit CRUD with persisted positions.
4. Add approval queue route and basic draft status transitions (approve/reject) without autonomous posting.
5. Introduce credential encryption persistence and connection-test stubs.
6. Deploy to Vercel preview and validate core acceptance criteria with seeded personas.

Rollback: if deployment introduces instability, revert to prior commit and keep DB migration additive-only for safe rollback.

## Open Questions

- Which exact persona profile image sourcing defaults should be used before final design assets are available?
- Should draft approval trigger immediate posting in this phase or remain mocked until platform adapter credentials are confirmed?
- Is Clerk setup desired now or in a follow-up change after local UX validation?
