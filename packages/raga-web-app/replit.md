# Raga Web App

Mantine 8 + Vite SPA with the redesigned "CommandBar — Docked" aesthetic.

## Stack
- React 19, Mantine 8, CSS Modules + SCSS
- @mantine/spotlight for the global command palette (⌘K)
- @glideapps/glide-data-grid for the track table (themed for the dark monochrome look)
- react-resizable-panels for the resizable layout
- wavesurfer.js for the waveform
- zustand + immer (`appStore`)

## Layout (top → bottom)
1. **AppChrome** (`components/chrome/appChrome.tsx`)
   - Logo mark, segmented Tracks/Export toggle, docked command-bar trigger (opens spotlight),
     LibraryControls + UserSettingsDropdown.
2. **LibraryView** (`views/libraryView.tsx`)
   - Left: collapsible icon rail (~56 px) with optional playlist tree panel.
   - Right: now-playing bar + audio player + waveform + dark-themed TrackTable.
3. **StatusBar** (`components/library/statusBar.tsx`)
   - Bottom 28 px monospace status bar with library count, analyzer/audio-server state and hotkey hints.

## Theme tokens
Defined in `common/mantine-overrides.scss` for both color schemes:
`--raga-surface-1`, `--raga-surface-2`, `--raga-border`, `--raga-border-strong`,
`--raga-text-dim/-muted/-bright`, `--raga-accent` (#3b82f6), `--raga-accent-soft`.
Mantine theme sets a monospace stack (`fontFamilyMonospace`) used by numerics in the status bar,
track table, BPM overlay and player time display. App defaults to dark color scheme.

## Command palette
`components/chrome/commandPalette.tsx` registers actions, playlists, and tracks for ⌘K-driven
navigation; switches workspace mode, selects playlists/tracks, triggers analyzer, opens the
hotkeys dialog, and opens settings.

## Hotkeys (preserved)
- ⌘K — open command palette
- ⌘I — global hotkeys dialog
- ⌘F — track filter
- ⌘L — scroll to selected
- Space / arrows — audio player controls
