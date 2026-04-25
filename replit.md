# Raga Music Library Manager

## Overview
Raga is a music library management application. This is the web app variant of the project, built with React, Vite, and Mantine UI components.

## Project Structure
- Monorepo managed with Yarn workspaces and Nx
- `packages/raga-web-app/` - Main web application (Vite + React)
- `packages/raga-design-system/` - `@adahiya/raga-design-system`: tokens, primitives,
  and a kitchen-sink spec sheet (Vite + React, Tailwind CSS v4, Radix Primitives,
  CVA, lucide-react). Ships dark + light themes; the dark map is the source of
  truth in `src/tokens/tokens.ts`, with `LIGHT_TOKENS` providing the colour-bearing
  overrides. Both themes are emitted as `:root[data-theme="dark"|"light"]` blocks
  in `src/styles/tokens.css` (auto-generated) and registered with Tailwind via
  `@theme` in `src/styles/global.css`. The kitchen-sink page exposes a theme
  toggle that flips `document.documentElement.dataset.theme`.
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
- Web app runs on port 5000 (workflow: "Web App", `yarn dev:web`)
- Mockup sandbox runs on port 3000 (workflow: "artifacts/mockup-sandbox: Component
  Preview Server")
- The design-system kitchen sink lives inside the web app as a dev-only route at
  `/__kitchen-sink`. It is lazy-loaded behind `import.meta.env.DEV` so neither
  the page nor its Tailwind CSS are emitted in production builds. The
  `DesignSystemLink` dev tool (bottom-right pill) opens it.
- Run `yarn build` to build all packages
- Run `yarn build:web` to build only the web app

## Key Configuration
- Vite config is in `packages/raga-web-app/vite.config.mjs`
- Design-system Vite config is in `packages/raga-design-system/vite.config.ts`
- Servers are configured to allow all hosts for Replit proxy compatibility
