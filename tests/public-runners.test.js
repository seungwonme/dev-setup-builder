import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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
assert.doesNotMatch(macContent, /^umask 077$/m);
assert.match(macContent, /mktemp/);
assert.match(macContent, /trap cleanup EXIT/);
assert.doesNotMatch(macContent, /\$\$/);
// Reconnect stdin to the terminal so `curl | bash` can drive interactive installers (sudo prompt).
assert.match(macContent, /bash "\$tmp" < \/dev\/tty/);
// Probe openability (ENXIO in CI/cron) instead of a fragile existence check that aborts under set -e.
assert.match(macContent, /\{ : < \/dev\/tty; \} 2>\/dev\/null/);
assert.doesNotMatch(macContent, /\[ -e \/dev\/tty \]/);

const windowsContent = readFileSync(windowsRunner, "utf8");
assert.match(windowsContent, /DEV_SETUP_SCRIPT_B64/);
assert.match(windowsContent, /FromBase64String/);
assert.match(windowsContent, /cmd\.exe \/c/);
assert.match(windowsContent, /\[Guid\]::NewGuid/);
assert.match(windowsContent, /try\s*{/);
assert.match(windowsContent, /finally\s*{/);
assert.match(windowsContent, /Remove-Item -LiteralPath \$path/);
assert.doesNotMatch(windowsContent, /\$PID/);

function runFixture(command, args, fixture) {
  const tempDir = mkdtempSync(join(tmpdir(), "dev-setup-builder-runner-"));
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env: {
      ...process.env,
      DEV_SETUP_SCRIPT_B64: Buffer.from(fixture).toString("base64"),
      TEMP: tempDir,
      TMP: tempDir,
      TMPDIR: tempDir
    }
  });
  const files = readdirSync(tempDir);
  rmSync(tempDir, { recursive: true, force: true });
  return { files, result };
}

const expectedUmask = process.umask().toString(8).padStart(4, "0");
const macFixture = runFixture("bash", [macRunner], '#!/bin/bash\nprintf "runner fixture ok\\n"\numask\nexit 7\n');
assert.equal(macFixture.result.status, 7, macFixture.result.stderr || macFixture.result.stdout);
assert.match(macFixture.result.stdout, /runner fixture ok/);
assert.match(macFixture.result.stdout, new RegExp(`^${expectedUmask}$`, "m"));
assert.deepEqual(macFixture.files, []);

const powerShell = process.platform === "win32" ? "powershell.exe" : "pwsh";
const powerShellProbe = spawnSync(powerShell, ["-NoProfile", "-Command", "exit 0"]);
if (!powerShellProbe.error && powerShellProbe.status === 0) {
  const windowsFixture = runFixture(
    powerShell,
    process.platform === "win32"
      ? ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", windowsRunner]
      : [
          "-NoProfile",
          "-Command",
          `function global:cmd.exe { & /bin/bash $args[1] }; & '${windowsRunner}'`
        ],
    process.platform === "win32"
      ? "@echo off\r\necho runner fixture ok\r\nexit /b 7\r\n"
      : '#!/bin/bash\nprintf "runner fixture ok\\n"\n'
  );
  assert.equal(windowsFixture.result.status, process.platform === "win32" ? 7 : 0, windowsFixture.result.stderr || windowsFixture.result.stdout);
  assert.match(windowsFixture.result.stdout, /runner fixture ok/);
  assert.deepEqual(windowsFixture.files, []);
}

console.log("public runner tests pass");
