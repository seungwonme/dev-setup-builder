# Repository Instructions

## Stack

- Use `pnpm` for this repo.
- This is a Vite + React app deployed to GitHub Pages.
- Keep the Vite base path as `/dev-setup-builder/` unless the repository name changes and every dependent path is updated together.
- Keep `pnpm-workspace.yaml` in sync with CI install policy. The repo keeps pnpm's 24-hour release-age gate and excludes `@astryxdesign/*` because the UI intentionally depends on the current Astryx packages.

## Source Layout

- Generated script definitions live in `src/builder.js`.
- UI state and component wiring live in `src/App.jsx`.
- Application styling lives in `src/styles.css`.
- One-line terminal install runners live in `public/run-mac.sh` and `public/run-windows.ps1`; they are referenced by the deployed app and must remain committed.

## Behavior Rules

- Advanced observability packages are `claude-code-telemetry` and `codex-telemetry`.
- Advanced observability must stay off by default.
- The UI's full selection action must not enable advanced observability.
- Prompt/body collection toggles must stay off by default.
- Advanced settings drawers should be collapsed by default.
- Switching the UI target from macOS to Windows should enable `wsl2`.
- Git identity defaults should only write values when global Git name or email is missing.

## Verification

Run these before committing or deploying:

```bash
pnpm test
pnpm build
pnpm test:e2e
```

Do not commit `node_modules/`, `dist/`, `test-results/`, or `playwright-report/`.
