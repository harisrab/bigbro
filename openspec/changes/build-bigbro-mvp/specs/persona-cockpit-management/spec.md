## ADDED Requirements

### Requirement: Persona Creation and Core Profile Editing
The system SHALL allow users to create and edit personas with structured profile fields including age, location, political stance, and tone.

#### Scenario: User creates a persona
- **WHEN** a user submits the New Persona form with required identity fields
- **THEN** the system creates the persona and displays it on the Campaign Canvas

#### Scenario: User edits structured profile fields
- **WHEN** a user updates age, location, political stance, or tone in the cockpit
- **THEN** the system saves the changes and reflects them on subsequent cockpit opens

### Requirement: General Personality Markdown
The cockpit SHALL include an editable general markdown personality section with preview support.

#### Scenario: Markdown content is editable and previewable
- **WHEN** a user edits general personality markdown and toggles preview
- **THEN** the system renders the formatted markdown content accurately

### Requirement: Platform-Specific Style Guides
The cockpit SHALL provide editable markdown style guides for LinkedIn, X, Instagram, and Reddit in collapsible sections.

#### Scenario: Platform style guide persists
- **WHEN** a user edits a platform-specific style guide and saves
- **THEN** the updated markdown is persisted for that persona and platform

### Requirement: Reference Account Style Analysis Trigger
Each platform style section SHALL provide an Analyze Reference Account action that accepts a profile URL and requests generated style guidance.

#### Scenario: Analyze action records generated guidance
- **WHEN** a user submits a valid reference profile URL for a platform
- **THEN** the system stores generated style guidance for that platform and presents it in the style guide editor
