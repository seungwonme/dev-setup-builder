import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const macRunner = "public/run-mac.sh";
const windowsRunner = "public/run-windows.ps1";

assert.equal(existsSync(macRunner), true);
assert.equal(existsSync(windowsRunner), true);

const macSyntax = spawnSync("bash", ["-n", macRunner], { encoding: "utf8" });
assert.equal(macSyntax.status, 0, macSyntax.stderr || macSyntax.stdout);

const macContent = readFileSync(macRunner, "utf8");
assert.match(macContent, /DEV_SETUP_SCRIPT_B64/);
assert.match(macContent, /base64 -D/);
assert.match(macContent, /base64 --decode/);
// Reconnect stdin to the terminal so `curl | bash` can drive interactive installers (sudo prompt).
assert.match(macContent, /bash "\$tmp" < \/dev\/tty/);
// Probe openability (ENXIO in CI/cron) instead of a fragile existence check that aborts under set -e.
assert.match(macContent, /\{ : < \/dev\/tty; \} 2>\/dev\/null/);
assert.doesNotMatch(macContent, /\[ -e \/dev\/tty \]/);

const windowsContent = readFileSync(windowsRunner, "utf8");
assert.match(windowsContent, /DEV_SETUP_SCRIPT_B64/);
assert.match(windowsContent, /FromBase64String/);
assert.match(windowsContent, /cmd\.exe \/c/);

console.log("public runner tests pass");
