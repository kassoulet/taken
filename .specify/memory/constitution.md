# Frontend Web Application Constitution

## Core Principles

### I. Component-First Architecture

Every UI element starts as a standalone, reusable component; Components must be self-contained, independently testable, and properly documented; Clear purpose required - no organizational-only components that don't serve a user-facing function.

### II. Client-Side Security Focus

All data processing occurs in the browser; No sensitive data stored locally without user consent; All external API calls must handle authentication securely and implement proper error handling; XSS and injection attacks must be prevented through proper input sanitization.

### III. Test-First (NON-NEGOTIABLE)

TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced; Unit tests for all business logic, integration tests for component interactions.

### IV. Performance Optimization

All user interactions must feel instantaneous (under 100ms feedback); Bundle sizes must remain under 250KB initial load; Lazy loading required for non-critical components; Images and assets must be optimized before inclusion.

### V. Accessibility & User Experience

All features must be accessible via keyboard navigation; Proper ARIA attributes required for dynamic content; Responsive design mandatory for all screen sizes; Error states must provide clear user guidance.

## Additional Constraints

### Technology Stack Requirements

- React 18+ for component architecture
- Vite for build tooling
- TailwindCSS for styling consistency
- Modern ES2022+ syntax with TypeScript type safety
- Jest + React Testing Library for testing framework

### Performance Standards

- Initial load under 3 seconds on 3G connection
- Interaction response under 100ms
- Smooth animations at 60fps
- Core Web Vitals scores in green zone

## Development Workflow

### Code Review Process

- All PRs require at least one approval
- Automated tests must pass before review
- Component documentation required for all new components
- Performance budget checks must pass

### Quality Gates

- Minimum 80% code coverage
- No accessibility violations (zero axe-core violations)
- Bundle size increases require approval
- Performance regressions not allowed

## Governance

Constitution supersedes all other practices; Amendments require documentation, approval, and migration plan.

All PRs/reviews must verify compliance; Complexity must be justified with clear user benefit; Performance degradation requires explicit approval.

**Version**: 1.0.0 | **Ratified**: 2025-10-25 | **Last Amended**: 2025-10-25
