# Multi-Registry Package Name Checker

A web application that checks the availability of package names across multiple registries including npm, PyPI, and Cargo.

## Features

- Check package name availability across multiple registries (npm, PyPI, Cargo)
- Real-time validation as you type
- Dark mode support (respects system preference)
- Responsive design for all screen sizes
- Visual indicators for package availability

## Registries Supported

- npm (Node.js packages)
- PyPI (Python packages)
- Cargo (Rust packages)

## How to Use

1. Enter a package name in the search field
2. The application will automatically check availability across all supported registries
3. Results will show the status of the package on each registry
4. Green checkmarks indicate the package is available
5. Red X marks indicate the package is taken

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build
- `npm run test` - Run tests
- `npm run lint` - Run linting

## Author

Created by [Gautier Portet](https://github.com/kassoulet/taken)

## License

MIT License - see the [LICENSE](LICENSE) file for details.
