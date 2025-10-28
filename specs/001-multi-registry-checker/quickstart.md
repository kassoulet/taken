# Quickstart Guide: Multi-Registry Package Name Checker

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Setup Instructions

1. **Create the project**

   ```bash
   npm create vite@latest multi-registry-checker -- --template react
   cd multi-registry-checker
   ```

2. **Install dependencies**

   ```bash
   npm install
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Install additional dependencies per constitution**

   ```bash
   npm install react-icons react-hook-form dompurify
   npm install -D @testing-library/react @testing-library/jest-dom jest axe-core
   ```

4. **Configure TailwindCSS**

   - Update `tailwind.config.js`:

   ```js
   /** @type {import('tailwindcss').Config} */
   export default {
     content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

   - Add Tailwind directives to `src/index.css`:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

## Project Structure

```
multi-registry-checker/
├── public/
├── src/
│   ├── components/
│   │   ├── NameInput/
│   │   │   ├── NameInput.jsx
│   │   │   ├── NameInput.css (Tailwind classes)
│   │   │   └── index.js
│   │   ├── StatusBadge/
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── StatusBadge.css (Tailwind classes)
│   │   │   └── index.js
│   │   └── RegistryStatusGrid/
│   │       ├── RegistryStatusGrid.jsx
│   │       ├── RegistryStatusGrid.css (Tailwind classes)
│   │       └── index.js
│   ├── services/
│   │   ├── registry-checker.js
│   │   └── cache-manager.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── sanitizer.js
│   │   └── helpers.js
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   └── useRegistryChecker.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── NameInput.test.js
│   │   │   ├── StatusBadge.test.js
│   │   │   └── RegistryStatusGrid.test.js
│   │   ├── services/
│   │   │   ├── registry-checker.test.js
│   │   │   └── cache-manager.test.js
│   │   └── utils/
│   │       ├── validators.test.js
│   │       └── sanitizer.test.js
│   ├── integration/
│   │   ├── registry-checker.test.js
│   │   └── App.integration.test.js
│   └── accessibility/
│       └── a11y.test.js
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Running the Application

1. **Development mode**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

2. **Build for production**

   ```bash
   npm run build
   ```

3. **Preview production build**
   ```bash
   npm run preview
   ```

## Component Development

### NameInput Component

- Responsible for accepting package name input
- Implements real-time validation and character filtering per clarification
- Provides debounced change events to prevent excessive API calls
- Includes comprehensive input sanitization per security requirements

### StatusBadge Component

- Displays status for a single registry
- Shows visual indicators for available/taken/error states
- Includes accessibility attributes per constitution

### RegistryStatusGrid Component

- Orchestrates the display of all registry statuses
- Manages loading states and error handling
- Coordinates with the registry checker service

## Key Configuration

### Registry Configuration

Registry configurations are defined in the service:

```javascript
export const REGISTRIES = [
  {
    id: "npm",
    name: "npm",
    apiEndpoint: "https://registry.npmjs.org/",
    validateFn: validateNpmPackageName,
  },
  {
    id: "pypi",
    name: "PyPI",
    apiEndpoint: "https://pypi.org/pypi/",
    validateFn: validatePypiPackageName,
  },
  {
    id: "cargo",
    name: "Cargo",
    apiEndpoint: "https://crates.io/api/v1/crates/",
    validateFn: validateCargoPackageName,
  },
];
```

### Timeout Configuration

All registry requests have a 10-second timeout as specified:

```javascript
const DEFAULT_TIMEOUT = 10000; // 10 seconds per clarification
```

## Security Implementation

### Input Sanitization

All user inputs are sanitized before API requests or display:

```javascript
import DOMPurify from "dompurify";

export function sanitizeInput(input) {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
  });
}
```

### XSS Prevention

- All user inputs are sanitized before making API requests
- All data returned from APIs is sanitized before display
- No direct use of innerHTML or dangerous functions

## Testing

1. **Run unit tests**

   ```bash
   npm run test:unit
   ```

2. **Run component tests**

   ```bash
   npm run test:components
   ```

3. **Run accessibility tests**

   ```bash
   npm run test:a11y
   ```

4. **Run all tests**
   ```bash
   npm run test
   ```

### Test Structure

```
tests/
├── unit/
│   ├── components/
│   │   ├── NameInput.test.js
│   │   ├── StatusBadge.test.js
│   │   └── RegistryStatusGrid.test.js
│   ├── services/
│   │   ├── registry-checker.test.js
│   │   └── cache-manager.test.js
│   └── utils/
│       ├── validators.test.js
│       └── sanitizer.test.js
├── integration/
│   ├── registry-checker.test.js
│   └── App.integration.test.js
└── accessibility/
    └── a11y.test.js
```

## Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Serve the `dist` folder**
   The application can be deployed as a static site to any hosting provider (Netlify, Vercel, GitHub Pages, etc.)

## Development Guidelines

### Input Validation

- Implement real-time validation to prevent invalid characters as per clarification
- Use comprehensive input sanitization per security requirements
- Show validation errors immediately

### Performance

- Use debouncing (500ms) to limit API requests
- Implement parallel requests to registries
- Use sessionStorage caching to avoid repeat requests

### Error Handling

- Treat all registry errors consistently with generic "error" status per clarification
- Show helpful error messages
- Implement timeout handling with 10-second limit per clarification

### Accessibility

- Ensure keyboard navigation support per constitution
- Include proper ARIA attributes per constitution
- Use sufficient color contrast per constitution

## Troubleshooting

### CORS Issues

Some registry APIs might have CORS restrictions. The application is designed to handle these gracefully with "error" status per clarification.

### Rate Limiting

Registry APIs may have rate limiting. The application handles errors gracefully and displays appropriate status.

### Network Timeouts

The application has a 10-second timeout for each registry request per clarification. Requests exceeding this time are marked as errors.
