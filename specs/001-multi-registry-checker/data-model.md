# Data Model: Multi-Registry Package Name Checker

## Core Entities

### PackageName

- **Description**: The identifier entered by the user to check across registries
- **Type**: String
- **Format**: Alphanumeric characters, hyphens, underscores, dots, and @ (for scoped npm packages)
- **Validation**:
  - Length: 1-214 characters (npm maximum)
  - Pattern: /^[a-zA-Z0-9-_@./]+$/ (with registry-specific variations)
  - Additional registry-specific validation applied per registry rules
  - Must pass input sanitization to prevent XSS
- **Constraints**: Must conform to at least one registry's naming conventions
- **Immutability**: Input string is not modified after validation

### Registry

- **Description**: An external package registry that supports package name lookup
- **Properties**:
  - id (string): Unique identifier (e.g., "npm", "pypi", "cargo", "github")
  - name (string): Display name (e.g., "npm", "PyPI", "Cargo", "GitHub")
  - apiEndpoint (string): Base URL for API requests
  - validateFn (function): Function to validate package names per registry rules
  - docUrl (string): Documentation URL for the registry
- **Relationships**: One-to-many with RegistryStatus
- **Constraints**:
  - id must be unique
  - apiEndpoint must be a valid URL pattern
  - validateFn must be a defined function

### RegistryStatus

- **Description**: The result for a specific package name on a specific registry
- **Properties**:
  - registry (Registry): The registry the status is for
  - packageName (PackageName): The package name that was checked
  - status (string): One of "available", "taken", or "error"
  - timestamp (Date): When the check was performed
  - details (object, optional): Additional information about the result
  - error (string, optional): Error message if status is "error"
- **Validation**:
  - status must be one of the allowed values
  - timestamp must be present and recent
  - registry must be a valid Registry object
  - packageName must be a valid PackageName string
- **State transitions**: pending → checked → result available

### CachedQuery

- **Description**: A stored result from a previous query with timestamp for tracking
- **Properties**:
  - packageName (PackageName): The package name that was checked
  - results (Array<RegistryStatus>): The registry status results
  - timestamp (Date): When the cache entry was created (set to session time)
- **Validation**:
  - Results array must contain at least one RegistryStatus
  - All RegistryStatus items must be valid
  - Timestamp must be present
- **Lifecycle**: Created when a query is made, maintained during session (no explicit expiration per clarification)

## Data Relationships

```
PackageName "1" -- "*" RegistryStatus
Registry "1" -- "*" RegistryStatus
PackageName "1" -- "*" CachedQuery
CachedQuery "1" -- "*" RegistryStatus
```

## State Diagrams

### Registry Check Process

```
[User Input]
    ↓ (validated and sanitized)
[Package Name Ready]
    ↓ (query initiated)
[Query in Progress]
    ↓ (parallel requests to registries)
[Results Received]
    ↓ (cached in sessionStorage)
[Display Results]
    ↓ (status: available/taken/error)
[Results Displayed]
```

### Input Validation Process

```
[Raw User Input]
    ↓ (real-time validation with character filtering)
[Character Filtered/Rejected]
    ↓ (if valid character passes)
[Input Updated]
    ↓ (if invalid character)
[Input Rejected/Filtered]
```

## Validation Rules

1. PackageName must conform to at least one registry's format requirements
2. PackageName must pass input sanitization to prevent XSS
3. RegistryStatus.status must be one of: "available", "taken", "error"
4. RegistryStatus must have a timestamp when created
5. RegistryStatus can only be created after a registry check is performed
6. CachedQuery must be associated with valid RegistryStatus objects
7. All user inputs must be sanitized before API calls or display

## Data Flow

1. User provides PackageName via real-time validated and sanitized input
2. System validates PackageName format against registry rules (per clarification Q1: comprehensive input sanitization)
3. System checks CachedQuery for existing results in sessionStorage
4. If cached, return cached results
5. If not cached, initiate parallel registry checks via service (with 10-second timeout per clarification)
6. Create RegistryStatus objects for each registry
7. Store results as CachedQuery in sessionStorage
8. Sanitize data before displaying to user
9. Display RegistryStatus objects to user via components
