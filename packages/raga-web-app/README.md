# Raga Web App

This package contains the portable web UI for Raga music library management. It can be run as a standalone web application or embedded within the Electron app.

## Development

To run the web app in development mode:

```bash
yarn dev
```

This will start a Vite dev server at http://localhost:3000

## Building

To build the web app for production:

```bash
yarn build
```

The built files will be in the `dist` directory.

## Preview

To preview the production build:

```bash
yarn preview
```

## Architecture

This web app is designed to work in two modes:

1. **Standalone mode**: When running as a regular web app, it uses a mock API (`webApi.ts`) that provides the same interface as the Electron API but with limited functionality.

2. **Electron mode**: When embedded in the Electron app, it uses the actual Electron API exposed through the context bridge.

## Key Features

- Built with React 19 and TypeScript
- Uses Mantine UI components
- Vite for fast development and optimized builds
- Sass modules for styling
- Zustand for state management

## Limitations in Standalone Mode

When running as a standalone web app (not in Electron), certain features are limited:

- File system access is restricted to web standards
- No direct audio file tag writing
- No native OS integrations
- IPC communications are mocked

These limitations do not apply when the app is running within Electron.
