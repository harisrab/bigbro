## 1. Project Bootstrap and UI Foundation

- [x] 1.1 Initialize a Next.js 15 TypeScript App Router project with required dependencies (React Flow, Prisma, markdown editor, icons, Zod).
- [x] 1.2 Implement global white cyber theme styling, top navigation shell, and shared layout primitives for canvas + queue routes.

## 2. Data Model and Persistence Layer

- [x] 2.1 Define Prisma schema for Persona, PersonaPlatform, Draft, ActivityItem, and PlatformCredential with canvas position fields.
- [x] 2.2 Add database client utilities and server actions for creating/updating personas and saving canvas coordinates.

## 3. Campaign Canvas Workspace

- [x] 3.1 Build the root Campaign Canvas view with React Flow, persona nodes, pan/zoom controls, and position persistence.
- [x] 3.2 Implement New Persona flow and searchable/filterable node list behavior on the canvas.

## 4. Persona Cockpit and Approval Queue

- [x] 4.1 Implement right-side sliding persona cockpit with structured fields and markdown editors for general + platform style guides.
- [x] 4.2 Build Approval Queue page with pending draft cards and Approve / Reject actions backed by draft status updates.

## 5. Platform Connection Stubs (Security Deferred)

- [x] 5.1 Implement plain local credential persistence for platform keys and wire persona-platform save actions.
- [x] 5.2 Add per-platform connection test stubs and platform status indicators in nodes/cockpit without enabling autonomous posting.

## 6. Narrative System — Backend (Deferred)

- [ ] 6.1 Add `Narrative` model to Prisma schema with fields: `id`, `title`, `description`, `status` (ACTIVE/DRAFT), `postCaps` (JSON), `createdAt`, `updatedAt`.
- [ ] 6.2 Add `NarrativePersona` join table to track which personas are assigned to a narrative (many-to-many).
- [ ] 6.3 Implement server actions: `createNarrativeAction`, `updateNarrativeAction`, `assignPersonaToNarrativeAction`, `updateNarrativePostCapsAction`.
- [ ] 6.4 Add `listNarratives` data fetch and wire into canvas page server component so narratives hydrate from DB on load.
- [ ] 6.5 Expose a narrative indicator on persona canvas nodes showing the active narrative name (if assigned).
