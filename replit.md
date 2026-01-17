# Raga Music Library Manager

## Overview
Raga is a music library management application. This is the web app variant of the project, built with React, Vite, and Mantine UI components.

## Project Structure
- Monorepo managed with Yarn workspaces and Nx
- `packages/raga-web-app/` - Main web application (Vite + React)
- `packages/raga-types/` - Shared TypeScript types
- `packages/raga-lib/` - Shared library code
- `packages/raga-app/` - Electron desktop app
- `packages/raga-cli/` - Command line interface (Deno)

## Tech Stack
- Node.js 24
- Yarn 4.12.0 (Berry)
- Vite 7.x
- React 19
- Mantine UI 8.x
- TypeScript 5.x

## Development
- Frontend runs on port 5000
- Run `yarn dev:web` to start the web app in development mode
- Run `yarn build` to build all packages
- Run `yarn build:web` to build only the web app

## Key Configuration
- Vite config is in `packages/raga-web-app/vite.config.mjs`
- Server is configured to allow all hosts for Replit proxy compatibility
