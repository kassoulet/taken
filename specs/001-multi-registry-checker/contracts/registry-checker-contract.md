# API Contracts: Registry Checker Service

## Internal Service Interface: RegistryChecker

### Service: registry-checker.js

#### Function: checkPackageName

**Description**: Checks the availability of a package name across multiple registries

**Parameters**:

- packageName (string): The package name to check across registries
- options (object, optional):
  - timeout (number): Timeout for each registry request in milliseconds (default: 10000)
  - registries (array): List of registries to check (default: ['npm', 'pypi', 'cargo', 'github'])

**Returns**: Promise<RegistryCheckResult[]>

**Response Format**:

```javascript
[
  {
    registry: {
      name: string,           // Registry identifier (e.g., 'npm', 'pypi', 'cargo', 'github')
      displayName: string,    // Human-readable name (e.g., 'npm', 'PyPI', 'Cargo', 'GitHub')
      baseUrl: string         // Base URL for the registry API
    },
    packageName: string,      // The package name that was checked
    status: 'available' | 'taken' | 'error',  // The status result
    details?: object,         // Additional details in case of error
    timestamp: string         // ISO timestamp when the check was completed
  }
]
```

#### Function: validatePackageName

**Description**: Validates a package name according to each registry's specific rules

**Parameters**:

- packageName (string): The package name to validate

**Returns**: Promise<ValidationResult>

**Response Format**:

```javascript
{
  packageName: string,      // The package name that was validated
  isValid: boolean,         // Whether the name is valid for at least one registry
  validationByRegistry: {
    [registryName: string]: {
      isValid: boolean,
      errors?: string[]     // Array of validation errors if invalid
    }
  },
  timestamp: string         // ISO timestamp when validation was completed
}
```

#### Function: getCachedResult

**Description**: Retrieves a cached result for a package name if it exists in sessionStorage

**Parameters**:

- packageName (string): The package name to check in cache

**Returns**: Promise<RegistryCheckResult[] | null>

**Response Format**:

- Returns the same as checkPackageName if found in cache
- Returns null if not found in cache

#### Function: cacheResult

**Description**: Caches a result in sessionStorage for future use

**Parameters**:

- packageName (string): The package name that was checked
- results (RegistryCheckResult[]): The results to cache

**Returns**: void

## Error Handling

### HTTP Error Responses

When making requests to external registries, the service should handle:

- 404 responses: Mapped to 'available' status
- 200 responses: Mapped to 'taken' status
- All other status codes: Mapped to 'error' status
- Network timeouts: Mapped to 'error' status
- CORS errors: Mapped to 'error' status with details

### Timeout Handling

Default timeout is 10 seconds for each registry request. If a request exceeds this time:

- The registry status should be marked as 'error'
- The error should be logged for debugging
- The application should continue with other registry checks

## Registry Endpoints

The service will make GET requests to these endpoints:

- **npm**: `https://registry.npmjs.org/{packageName}`
- **PyPI**: `https://pypi.org/pypi/{packageName}/json`
- **Cargo**: `https://crates.io/api/v1/crates/{packageName}`
- **GitHub**: `https://api.github.com/repos/{packageName}` (assuming owner/repo format)

## Response Format for Registry Endpoints

The service expects these response structures:

### 200 Success Response

- npm: JSON object containing package information
- PyPI: JSON object containing project information
- Cargo: JSON object containing crate information
- GitHub: JSON object containing repository information

### 404 Not Found Response

- All registries return 404 when a package name is not found

## Browser Storage Contract

The service uses sessionStorage with these conventions:

- Keys follow the pattern: `registry-check-{registryName}-{packageName}`
- Values are JSON objects containing the RegistryCheckResult
- Data is automatically cleared when the browser tab/window is closed
