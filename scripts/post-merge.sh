#!/usr/bin/env bash
# Runs automatically after a task is merged into the main branch.
# Keep this idempotent and non-interactive.
set -euo pipefail

# Yarn 4 install: respect the lockfile and fail loudly if it would change.
yarn install --immutable

# Reset Nx's cache so target inputs (new packages, changed configs) are
# picked up cleanly on the next run.
yarn nx reset >/dev/null 2>&1 || true
