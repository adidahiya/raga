# Raga — Claude Code Guide

Raga is a music library management suite for DJs. It imports music libraries from
[Swinsian](https://swinsian.com/), analyzes tracks (BPM, metadata), and exports
libraries to formats compatible with [Rekordbox](https://rekordbox.com/) (Pioneer's
industry-standard DJ software). It ships as an Electron desktop app, a portable web
UI, a core Node.js library, and a standalone CLI.

---

## Monorepo Package Overview

This is a Yarn v4 workspace monorepo managed with Nx (task orchestration) and Lerna
(versioning). All packages live under `packages/`.

| Package | Purpose | Published |
|---------|---------|-----------|
| `raga-types` | Shared TypeScript interfaces + IPC event channel definitions | No |
| `raga-lib` | Core data-transformation library (plist parsing, FFmpeg conversion) | Yes (npm) |
| `raga-web-app` | React/Vite UI — runs standalone in browser or embedded in Electron | No |
| `raga-app` | Electron desktop app — wraps raga-web-app, adds IPC + file I/O | No |
| `raga-cli` | CLI tool for Swinsian → Rekordbox batch conversion | No |

**Dependency order:** `raga-types` ← `raga-lib` ← `raga-app` / `raga-cli`; `raga-web-app` uses `raga-types`.

---

## Prerequisites

```bash
node --version   # Must be v24.x (see .nvmrc; use `nvm use` or corepack)
yarn --version   # v4.x (enabled via `corepack enable`)
ffmpeg -version  # Required for audio conversion features
deno --version   # v2.x — only needed to build the raga-cli standalone binary
```

Install dependencies:

```bash
corepack enable
yarn install
```

---

## Development Commands

All commands run from the repo root via Nx task orchestration:

```bash
# Start dev servers
yarn dev:web        # Vite dev server for raga-web-app at http://localhost:3000
yarn dev:electron   # Full Electron app (also launches react-devtools)

# Build
yarn build          # TypeScript compilation for all packages (tsc)
yarn dist           # Package Electron app as distributable (.dmg / .deb)

# Type checking & linting
yarn check-types    # TypeScript type check (all packages)
yarn check-lint     # ESLint check (all packages)
yarn fix-lint       # Auto-fix ESLint issues
yarn check-format   # Prettier format check
yarn fix-format     # Auto-format with Prettier

# Testing
yarn test           # Run all Vitest suites
```

Run checks before committing: `yarn check-types && yarn check-lint && yarn check-format`.

---

## Architecture

### Electron Process Model

`raga-app` uses three separate OS processes:

1. **Main process** (`src/main.ts`) — creates the browser window, routes IPC messages.
2. **Utility process** (`src/server.ts`) — runs `@tinyhttp/app` HTTP server; handles
   CPU-heavy work: plist parsing, FFmpeg conversion, ID3 tag writing, Discogs API calls.
3. **Renderer process** — the compiled `raga-web-app` React bundle.

```
Renderer (React UI)
    ↕  window.api (context bridge)
Main process
    ↕  MessageChannelMain / IPC
Utility process (HTTP server on localhost)
```

The preload script (`src/preload.ts`) exposes `window.api` to the renderer via
`contextBridge`. It queues outgoing events until the utility process signals it is
ready (`APP_SERVER_PING` / `APP_SERVER_READY` handshake).

### IPC Event System

Event channels and payloads are defined in `raga-types`:

- **Client events** (renderer → server): `packages/raga-types/src/api/clientEvents.ts`
- **Server events** (server → renderer): `packages/raga-types/src/api/serverEvents.ts`

Channel names use camelCase string literals collected in the `ClientEventChannel` and
`ServerEventChannel` const objects. Always add new events there first before
implementing handlers.

### Web App Dual-Mode

`raga-web-app` detects its host environment at runtime via `window.api`:

- **Electron mode** — `window.api` is present; full feature set via IPC.
- **Standalone mode** — `window.api` is absent; falls back to `src/webApi.ts` which
  provides mock data and no-op stubs (useful for browser-only development).

### State Management

`raga-web-app` uses **Zustand** with an immer + persist middleware stack:

- Root store: `packages/raga-web-app/src/store/appStore.ts`
- State is split into slices under `src/store/slices/` (one file per domain)
- Use the `createSelectors` utility for memoized per-key subscriptions — do not
  subscribe to the entire store object
- Persisted state uses localStorage with a schema version key

### Async Patterns (Electron server)

Complex multi-step async operations in the utility process use the **Effection**
generator pattern:

```ts
import { run } from "effection";
yield* run(function* () { /* ... */ });
```

Use Effection for operations that need cancellation, timeouts, or structured
concurrency. Simple one-shot async calls can use plain `async/await`.

---

## Key Domain Concepts

| Term | Meaning |
|------|---------|
| **Swinsian library** | A plist XML file exported from the Swinsian music player containing tracks and playlists |
| **TrackDefinition** | The core track data structure (see `raga-types`); has ~25 fields: Track ID, Persistent ID, Location, BPM, Rating, Artist, Album, Genre, etc. |
| **Persistent ID** | Hex-encoded unique identifier for a track, used by both Swinsian and Music.app/Rekordbox |
| **Music.app / iTunes XML** | The plist format that Rekordbox ingests; raga converts Swinsian libraries into this format |
| **BPM** | Beats per minute; analyzed via `web-audio-beat-detector` in the browser or stored as ID3 metadata |
| **ID3 tags** | Metadata embedded in MP3 files; raga writes them via `node-taglib-sharp` |
| **Audio Files Server** | The HTTP server in the utility process that serves converted MP3s to the web audio player |

---

## Code Style & Conventions

These are enforced by ESLint + Prettier; the CI will catch violations.

### TypeScript

- Strict mode is on everywhere. Avoid `any`.
- Use the `type` keyword for type-only imports: `import type { Foo } from "./foo.js"`.
- Import order is auto-managed by `simple-import-sort` — don't manually reorder imports.
- `@typescript-eslint/consistent-type-imports` is enforced; run `yarn fix-lint` to auto-fix.

### React / UI

- Use **early returns** to reduce nesting.
- Style with **CSS modules using Sass syntax** (`.module.scss` files); never write plain
  inline styles or non-module CSS.
- Use the `classNames` package for conditional class names.
- Name event handlers with the `handle` prefix: `handleClick`, `handleKeyDown`.
- Add accessibility attributes on interactive elements: `tabIndex`, `aria-label`,
  `onKeyDown` alongside `onClick`.

### Logging

Use `roarr` scoped loggers — **not** `console.log`:

```ts
import { createLogger } from "../common/logger.js";
const log = createLogger("myModule");
log.debug("message", { context });
```

### Error handling across IPC

Serialize errors before sending them over IPC using `serialize-error`:

```ts
import { serializeError } from "serialize-error";
// in server event payload:
{ error: serializeError(err) }
```

---

## Testing

- Framework: **Vitest** (raga-web-app, raga-lib)
- Test files are colocated next to source files as `*.test.ts` or `*.test.tsx`
- Run all tests: `yarn test`
- Run tests in watch mode (from web-app package): `yarn workspace @adahiya/raga-web-app test --watch`

---

## Known Gotchas

- **`skipLibCheck: true` in raga-app** — there are pre-existing third-party type
  conflicts in the Electron package. Do not attempt to resolve them; this is intentional.
- **ffmpeg must be on PATH** — the audio conversion feature calls the system `ffmpeg`
  binary. Install it separately (e.g., `brew install ffmpeg`).
- **Discogs API credentials** — genre lookup requires `DISCOGS_CONSUMER_KEY` and
  `DISCOGS_CONSUMER_SECRET` in `packages/raga-app/.env`. See `.env.example` at the
  repo root.
- **glide-data-grid is canvas-based** — the track table (`TrackTable` component) uses
  `@glideapps/glide-data-grid` which renders to a `<canvas>` element, not DOM rows.
  Do not try to inspect or manipulate individual row DOM nodes.
- **Node 24 required** — the project uses Node 24 APIs. The GitHub Actions workflow
  currently pins Node 20 (a known discrepancy); CircleCI uses the correct `cimg/node:24.12`.
- **IPC event queuing** — the preload script queues renderer → server events until the
  `APP_SERVER_READY` signal arrives. If you add a new startup flow, be aware events
  sent before ready will be buffered and replayed.
