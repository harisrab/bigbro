## ADDED Requirements

### Requirement: Global Approval Queue Access
The system SHALL expose a global Approval Queue accessible from the primary navigation.

#### Scenario: User opens queue from navbar
- **WHEN** a user activates the Approval Queue quick link from the top navigation
- **THEN** the system navigates to the Approval Queue view

### Requirement: Pending Draft Visibility
The Approval Queue SHALL list pending drafts with persona identity, platform, and content preview.

#### Scenario: Pending drafts are listed
- **WHEN** the queue contains one or more drafts in pending state
- **THEN** each draft row displays persona, target platform, and preview text

### Requirement: Human-Only Decision Gate
The system SHALL require an explicit human decision on each draft before any posting action can proceed.

#### Scenario: Draft cannot auto-post
- **WHEN** a draft is generated and enters pending state
- **THEN** no publish operation executes until the user selects Approve

### Requirement: Queue Decision Actions
The Approval Queue SHALL support Approve and Reject/Edit actions for each pending draft.

#### Scenario: User approves draft
- **WHEN** a user clicks Approve on a pending draft
- **THEN** the draft transitions to approved state and is marked ready for platform posting workflow

#### Scenario: User rejects draft
- **WHEN** a user clicks Reject/Edit on a pending draft
- **THEN** the draft transitions to rejected state and remains editable
