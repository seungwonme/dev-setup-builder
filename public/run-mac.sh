#!/bin/bash
set -euo pipefail

if [ -z "${DEV_SETUP_SCRIPT_B64:-}" ]; then
  printf "DEV_SETUP_SCRIPT_B64 is missing.\n" >&2
  exit 1
fi

tmp="${TMPDIR:-/tmp}/dev-setup-builder-$$.command"
if ! printf "%s" "$DEV_SETUP_SCRIPT_B64" | base64 -D > "$tmp" 2>/dev/null; then
  printf "%s" "$DEV_SETUP_SCRIPT_B64" | base64 --decode > "$tmp"
fi

chmod +x "$tmp"
# Reconnect stdin to the terminal: when invoked via `curl | bash`, stdin is the
# consumed pipe, so Homebrew's installer (sudo password, prompts) could not read input.
# /dev/tty exists even without a controlling terminal (CI, cron), where opening it
# fails with ENXIO; probe that it is actually openable before redirecting.
if { : < /dev/tty; } 2>/dev/null; then
  bash "$tmp" < /dev/tty
else
  bash "$tmp"
fi
