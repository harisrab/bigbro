## ADDED Requirements

### Requirement: Infinite Campaign Canvas Workspace
The system SHALL provide a Campaign Canvas as the default primary workspace where all personas are displayed as draggable nodes on an infinite zoomable plane.

#### Scenario: Canvas opens as primary view
- **WHEN** an authenticated user navigates to the root application route
- **THEN** the system renders the Campaign Canvas with pan/zoom controls and visible persona nodes

#### Scenario: Canvas supports free dragging
- **WHEN** a user drags a persona node to a new location on the canvas
- **THEN** the node position updates interactively without page reload

### Requirement: Persona Node Summary Card
Each persona node SHALL display profile image, persona name, primary handle, and per-platform connection status indicators for LinkedIn, X, Instagram, and Reddit.

#### Scenario: Node renders required metadata
- **WHEN** personas are loaded for the canvas
- **THEN** each node displays avatar, name, primary handle, and four platform status indicators

### Requirement: Canvas Position Persistence
The system SHALL persist persona node positions so layout is restored between sessions.

#### Scenario: Position persists after reload
- **WHEN** a user moves a persona node and later reloads the page
- **THEN** the persona appears at its last saved coordinates

### Requirement: Persona Cockpit Entry Point
The system SHALL open the persona cockpit sidebar when a persona node is selected.

#### Scenario: Selecting a node opens cockpit
- **WHEN** a user clicks a persona node on the canvas
- **THEN** the right-side cockpit opens with data for the selected persona
