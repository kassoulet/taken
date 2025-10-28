# API Contracts: Multi-Registry Package Name Checker

## Internal Service Interface

### Registry Checker Service

#### Function: checkPackageName

**Description**: Checks the availability of a package name across multiple registries

**Parameters**:

- packageName (string): The validated and sanitized package name to check across registries
- options (object, optional):
  - timeout (number): Timeout for each registry request in milliseconds (default: 10000 per clarification)
  - registries (string[]): List of registries to check (default: ['npm', 'pypi', 'cargo', 'github'])

**Returns**: Promise<RegistryStatus[]>

**Response Format**:

```javascript
[
  {
    registry: {
      id: string,           // Registry identifier (e.g., 'npm', 'pypi', 'cargo', 'github')
      name: string,         // Display name (e.g., 'npm', 'PyPI', 'Cargo', 'GitHub')
      apiEndpoint: string   // Base URL for the registry API
    },
    packageName: string,      // The package name that was checked
    status: 'available' | 'taken' | 'error',  // The status result
    timestamp: string,        // ISO timestamp when the check was completed
    details?: object,         // Additional details in case of error
    error?: string            // Error message if status is 'error'
  }
]
```

**Error Handling**:

- Network errors: Mapped to 'error' status
- Timeout errors: Mapped to 'error' status (per 10-second timeout clarification)
- CORS errors: Mapped to 'error' status with details (per clarification Q2: treat all errors the same)
- Input validation errors: Thrown as exceptions before request

#### Function: validatePackageName

**Description**: Validates a package name according to each registry's specific rules

**Parameters**:

- packageName (string): The package name to validate
- registryId? (string): Optional specific registry ID to validate against

**Returns**: ValidationResult | RegistryValidationMap

**Response Format**:

```javascript
// For specific registry validation:
{
  packageName: string,      // The package name that was validated
  registryId: string,       // The registry being validated against
  isValid: boolean,         // Whether the name is valid for the registry
  errors?: string[]         // Array of validation errors if invalid
}

// For all registries validation:
{
  packageName: string,      // The package name that was validated
  isValid: boolean,         // Whether the name is valid for at least one registry
  validationByRegistry: {
    [registryId: string]: {
      isValid: boolean,
      errors?: string[]     // Array of validation errors if invalid
    }
  },
  timestamp: string         // ISO timestamp when validation was completed
}
```

### Cache Manager Service

#### Function: getCachedResult

**Description**: Retrieves a cached result for a package name if it exists in sessionStorage

**Parameters**:

- packageName (string): The package name to check in cache

**Returns**: Promise<RegistryStatus[] | null>

**Response Format**:

- Returns the same as checkPackageName if found in cache
- Returns null if not found in cache

#### Function: cacheResult

**Description**: Caches a result in sessionStorage for future use

**Parameters**:

- packageName (string): The package name that was checked
- results (RegistryStatus[]): The results to cache

**Returns**: void

#### Function: clearCache

**Description**: Clears all cached data from sessionStorage

**Parameters**: None

**Returns**: void

## Component Interfaces

### NameInput Component

**Props Interface**:

```javascript
{
  onValidate: (packageName: string, isValid: boolean) => void,  // Callback when validation status changes
  onDebouncedChange: (packageName: string) => void,            // Callback when input value changes after debounce
  onSanitizedInput: (sanitizedValue: string) => void,         // Callback when input is sanitized (per security clarification)
  debounceMs?: number,                                         // Debounce time in milliseconds (default: 500)
  placeholder?: string,                                        // Input placeholder text
  disabled?: boolean                                           // Whether the input is disabled
}
```

**State**:

- value: string - Current input value (filtered in real-time per clarification)
- isValid: boolean - Whether the current value is valid
- error: string | null - Error message if validation fails
- sanitizedValue: string - Value after sanitization

### RegistryStatusGrid Component

**Props Interface**:

```javascript
{
  packageName: string,          // The package name being checked
  registryStatuses: RegistryStatus[],  // Array of registry statuses to display
  loading: boolean,             // Whether checks are in progress
  error?: string,               // Error message if any occurred
  onRetry?: () => void,        // Callback to retry failed checks
}
```

### StatusBadge Component

**Props Interface**:

```javascript
{
  status: 'available' | 'taken' | 'error',  // Status to display
  registryName: string,                   // Name of the registry
  loading?: boolean,                      // Whether the status is still loading
  accessibilityLabel?: string,            // ARIA label for accessibility (per constitution)
}
```

## HTTP API Contracts (External Registries)

### npm Registry API

- **Endpoint**: `GET https://registry.npmjs.org/{sanitizedPackageName}`
- **Response**: 200 with package data if exists, 404 if not
- **Headers**: Accept: application/json
- **Rate Limits**: ~100 requests/second per IP
- **Security**: Input must be sanitized before request (per clarification Q7)

### PyPI Registry API

- **Endpoint**: `GET https://pypi.org/pypi/{sanitizedPackageName}/json`
- **Response**: 200 with package data if exists, 404 if not
- **Headers**: Accept: application/json
- **Security**: Input must be sanitized before request (per clarification Q7)

### Cargo Registry API

- **Endpoint**: `GET https://crates.io/api/v1/crates/{sanitizedPackageName}`
- **Response**: 200 with crate data if exists, 404 if not
- **Headers**: Accept: application/json
- **Security**: Input must be sanitized before request (per clarification Q7)

### GitHub API (Repository-focused per clarification Q11)

- **Endpoint**: `GET https://api.github.com/repos/{sanitizedOwner}/{sanitizedRepo}`
- **Response**: 200 with repo data if exists, 404 if not
- **Headers**: Accept: application/vnd.github.v3+json
- **Rate Limits**: 60 requests/hour for unauthenticated, 5000/hour for authenticated
- **Security**: Input must be sanitized before request (per clarification Q7)

## Browser Storage Contract

### sessionStorage Keys

- Format: `registry-check-{registryId}-{packageName}` (per spec and clarifications)
- Value: JSON string of RegistryStatus[]
- Lifecycle: Automatic cleanup when browser session ends (per clarification Q10)

### Session Storage Limits

- Per origin: ~5-10MB depending on browser
- Automatic cleanup when browser tab closes
- No cross-tab sharing (as designed for this feature)

## Security Contract

### Input Sanitization

- All user input must be sanitized before API requests
- Use DOMPurify or similar library for comprehensive sanitization (per clarification Q7)
- Prevent XSS and injection attacks
- Sanitize both before API requests and before display

### Client-Side Security

- No sensitive data stored client-side
- All processing happens in browser
- Proper headers and validation for external API calls
- Error messages do not expose sensitive information

## Accessibility Contract

### ARIA Attributes

- Components must include proper ARIA labels and roles
- Keyboard navigation support for all interactive elements
- Focus management for dynamic content updates
- Screen reader compatibility for all UI elements

### Semantic HTML

- Use proper HTML elements for their intended purpose
- Maintain proper heading hierarchy
- Include alt text for images
- Ensure proper color contrast ratios
