## ADDED Requirements

### Requirement: Per-Persona Platform Credential Management
The cockpit SHALL provide editable credential inputs per persona for LinkedIn, X, Instagram, and Reddit.

#### Scenario: User saves platform credentials
- **WHEN** a user enters credentials for a platform and saves
- **THEN** the credentials are persisted for that persona-platform pairing

### Requirement: Credential Encryption at Rest
The system SHALL encrypt platform credentials before database persistence and only decrypt when needed for platform operations.

#### Scenario: Stored credentials are encrypted
- **WHEN** credentials are stored in the database
- **THEN** the stored values are ciphertext and not plaintext keys

### Requirement: Connection Test Action
The cockpit SHALL expose a test-connection action per platform credential set.

#### Scenario: Connection test success
- **WHEN** a user runs connection test with valid credentials
- **THEN** the system returns a success status and updates platform connection indicator

#### Scenario: Connection test failure
- **WHEN** a user runs connection test with invalid credentials
- **THEN** the system returns a failure status without deleting existing stored credential records
