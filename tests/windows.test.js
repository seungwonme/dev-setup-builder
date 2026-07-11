import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildWindowsScript,
  resolveSelection,
  selfTest
} from "../src/builder.js";

const settings = { gitName: "A", gitEmail: "a@example.com" };

const codex = resolveSelection(new Set(["codex"]), "win");
const codexScript = buildWindowsScript(codex, settings);
const nodeIndex = codexScript.indexOf("Install-Winget -Label 'Node.js LTS'");
const codexCallIndex = codexScript.lastIndexOf("Install-CodexCli");
const codexNativeIndex = codexScript.indexOf("https://chatgpt.com/codex/install.ps1");
const codexNpmIndex = codexScript.indexOf("Install-NpmGlobal -Label 'Codex CLI'");

assert.equal(codex.has("node"), true);
assert.equal(nodeIndex >= 0 && nodeIndex < codexCallIndex, true);
assert.equal(codexNativeIndex >= 0 && codexNativeIndex < codexNpmIndex, true);

const claudeCode = resolveSelection(new Set(["claude-code"]), "win");
const claudeCodeScript = buildWindowsScript(claudeCode, settings);
const claudeNativeIndex = claudeCodeScript.indexOf("https://claude.ai/install.ps1");
const claudeWingetIndex = claudeCodeScript.indexOf("winget install --id Anthropic.ClaudeCode");
const claudeNpmIndex = claudeCodeScript.indexOf("Install-NpmGlobal -Label 'Claude Code CLI'");

assert.equal(claudeCode.has("node"), true);
assert.equal(claudeNativeIndex >= 0 && claudeNativeIndex < claudeWingetIndex && claudeWingetIndex < claudeNpmIndex, true);

const codexApp = resolveSelection(new Set(["codex-app"]), "win");
const codexAppScript = buildWindowsScript(codexApp, settings);

assert.equal(codexApp.has("node"), false);
assert.match(codexAppScript, /(^|\r\n)Install-CodexApp(\r\n|$)/);
assert.match(codexAppScript, /9PLM9XGG6VKS/);
assert.match(codexAppScript, /--source msstore/);

const extension = resolveSelection(new Set(["claude-extension"]), "win");
const extensionScript = buildWindowsScript(extension, settings);

assert.equal(extension.has("vscode"), true);
assert.match(extensionScript, /Install-VSCode/);
assert.match(extensionScript, /Install-CodeExtension -ExtensionId 'anthropic\.claude-code'/);

const setup = resolveSelection(new Set(["pnpm", "github-auth", "wsl2"]), "win");
const setupScript = buildWindowsScript(setup, settings);

assert.equal(setup.has("node"), true);
assert.equal(setup.has("gh"), true);
assert.match(setupScript, /Install-Pnpm/);
assert.match(setupScript, /Check-GitHubAuth/);
assert.match(setupScript, /Install-WSL2/);
assert.match(setupScript, /wsl --install --no-launch/);

const dockerScript = buildWindowsScript(new Set(["docker"]), settings);
assert.match(dockerScript, /Docker\.DockerDesktop/);
const dockerDetector = dockerScript.slice(
  dockerScript.indexOf("function Test-DockerDesktop"),
  dockerScript.indexOf("function Install-DockerDesktop")
);
assert.doesNotMatch(dockerDetector, /Has-Command 'docker'/);
assert.doesNotMatch(dockerDetector, /resources\\\\bin\\\\docker\.exe/);

const pythonScript = buildWindowsScript(resolveSelection(new Set(["python"]), "win"), settings);
const commandDetector = pythonScript.slice(
  pythonScript.indexOf("function Has-Command"),
  pythonScript.indexOf("function Refresh-Path")
);
const wingetInstaller = pythonScript.slice(
  pythonScript.indexOf("function Install-Winget"),
  pythonScript.indexOf("function Install-NpmGlobal")
);
const pythonBodyStart = pythonScript.lastIndexOf("$pythonOk = $false");
const pythonBody = pythonScript.slice(
  pythonBodyStart,
  pythonScript.indexOf('\r\n\r\nWrite-Host ""', pythonBodyStart)
);
assert.match(commandDetector, /Get-Command \$Name -All/);
assert.doesNotMatch(commandDetector, /WindowsApps/);
assert.match(commandDetector, /Test-Path \$command\.Source -PathType Leaf/);
assert.match(commandDetector, /--version/);
assert.match(pythonBody, /-DeferFailure/);
assert.match(pythonBody, /if \(-not \$pythonOk\) \{ Fail 'Python' \}/);

const claudeTelemetry = resolveSelection(new Set(["claude-code-telemetry"]), "win");
const claudeTelemetryScript = buildWindowsScript(claudeTelemetry, {
  ...settings,
  otelEndpoint: "http://collector.local:4317",
  claudeLogUserPrompts: true,
  claudeLogToolDetails: true
});

assert.equal(claudeTelemetry.has("claude-code"), true);
assert.match(claudeTelemetryScript, /Set-ClaudeCodeTelemetry 'http:\/\/collector\.local:4317' 'grpc' '' '' 'dev' '' '60000' '5000' 'otlp' 'otlp' 'none' '1' '0' '1'/);
assert.match(claudeTelemetryScript, /CLAUDE_CODE_ENABLE_TELEMETRY = '1'/);
assert.match(claudeTelemetryScript, /OTEL_LOG_USER_PROMPTS = \$LogPrompts/);

const codexTelemetry = resolveSelection(new Set(["codex-telemetry"]), "win");
const codexTelemetryScript = buildWindowsScript(codexTelemetry, {
  ...settings,
  codexLogUserPrompt: true,
  codexMetricsExporter: "otlp"
});

assert.equal(codexTelemetry.has("codex"), true);
assert.match(codexTelemetryScript, /Set-CodexTelemetry/);
assert.match(codexTelemetryScript, /\[otel\]/);
assert.match(codexTelemetryScript, /metrics_exporter = \$metricsExporterToml/);
assert.match(codexTelemetryScript, /Set-CodexTelemetry 'http:\/\/localhost:4317' 'grpc' '' '' 'dev' '' '60000' '5000' 'otlp' 'otlp' 'none' '0' '0' '0' '0' 'off' '' 'otlp' 'none' 'otlp' '1'/);
assert.match(codexTelemetryScript, /\[IO\.File\]::ReadAllText\(\$config/);
assert.doesNotMatch(codexTelemetryScript, /\$content = Get-Content -Path \$config -Raw/);
assert.match(codexTelemetryScript, /catch \{ Fail "Codex telemetry/);

const pwsh = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "$null"], { encoding: "utf8" });
if (!pwsh.error && pwsh.status === 0) {
  const pythonCheck = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "-"], {
    input: [
      commandDetector,
      "function Get-Command { param($Name, [switch]$All, $ErrorAction); return $script:Commands }",
      "$script:Commands = @([pscustomobject]@{ Source = 'C:\\Users\\test\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe' })",
      "if (Has-Command 'python') { exit 1 }",
      "$script:Commands = @([pscustomobject]@{ Source = 'C:\\Users\\test\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe' }, [pscustomobject]@{ Source = [Environment]::ProcessPath })",
      "if (-not (Has-Command 'python')) { exit 2 }",
      "$script:Commands = @([pscustomobject]@{ Source = 'Z:\\missing\\python.exe' })",
      "if (Has-Command 'python') { exit 3 }"
    ].join("\n"),
    encoding: "utf8"
  });
  assert.equal(pythonCheck.status, 0, pythonCheck.stderr || pythonCheck.stdout);

  const pythonFallbackCheck = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "-"], {
    input: [
      "$script:Failed = @()",
      "$script:Attempts = 0",
      "$script:PythonInstalled = $false",
      "$LogFile = [IO.Path]::GetTempFileName()",
      "function Step([string]$Text) {}",
      "function Ok([string]$Text) {}",
      "function Fail([string]$Text) { $script:Failed += $Text }",
      "function Refresh-Path {}",
      "function Has-Command([string]$Name) { if ($Name -eq 'winget') { return $true }; if ($Name -eq 'python') { return $script:PythonInstalled }; return $false }",
      "function winget { $script:Attempts += 1; if ($script:Attempts -eq 2) { $script:PythonInstalled = $true } }",
      wingetInstaller,
      pythonBody,
      "Remove-Item $LogFile -Force",
      "if (-not $pythonOk) { exit 1 }",
      "if ($script:Failed.Count -ne 0) { exit 2 }",
      "if ($script:Attempts -ne 2) { exit 3 }"
    ].join("\n"),
    encoding: "utf8"
  });
  assert.equal(pythonFallbackCheck.status, 0, pythonFallbackCheck.stderr || pythonFallbackCheck.stdout);

  const helpers = codexTelemetryScript.slice(
    codexTelemetryScript.indexOf("function ConvertTo-TomlString"),
    codexTelemetryScript.indexOf("function Check-GitHubAuth")
  );
  const call = codexTelemetryScript.split(/\r?\n/).find((line) => line.startsWith("Set-CodexTelemetry "));
  const harness = [
    "$script:Failed = @()",
    "function Step([string]$Text) {}",
    "function Ok([string]$Text) { Write-Output \"OK: $Text\" }",
    "function Warn([string]$Text) { Write-Output \"WARN: $Text\" }",
    "function Fail([string]$Text) { Write-Output \"FAIL: $Text\"; $script:Failed += $Text }",
    helpers,
    call,
    "if ($script:Failed.Count -gt 0) { exit 1 }"
  ].join("\n");
  const home = mkdtempSync(join(tmpdir(), "dev-setup-builder-"));
  try {
    mkdirSync(join(home, ".codex"));
    writeFileSync(join(home, ".codex", "config.toml"), "");
    const success = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "-"], {
      input: harness,
      env: { ...process.env, USERPROFILE: home },
      encoding: "utf8"
    });
    assert.equal(success.status, 0, success.stderr || success.stdout);
    assert.match(success.stdout, /OK: Codex telemetry configured/);
    assert.match(readFileSync(join(home, ".codex", "config.toml"), "utf8"), /\[otel\]/);

    rmSync(join(home, ".codex", "config.toml"));
    mkdirSync(join(home, ".codex", "config.toml"));
    const failure = spawnSync("pwsh", ["-NoProfile", "-NonInteractive", "-Command", "-"], {
      input: harness,
      env: { ...process.env, USERPROFILE: home },
      encoding: "utf8"
    });
    assert.equal(failure.status, 1, failure.stderr || failure.stdout);
    assert.match(failure.stdout, /FAIL: Codex telemetry/);
    assert.doesNotMatch(failure.stdout, /OK: Codex telemetry configured/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
}

// --- Regression coverage for the script-defect fixes ---

// Failure tracking must be $script:-scoped everywhere, or a FAIL is lost and the run reports exit 0.
assert.match(codexScript, /\$script:Failed = @\(\)/);
assert.match(codexScript, /if \(\$script:Failed\.Count -gt 0\)/);
assert.doesNotMatch(codexScript, /\n\$Failed = @\(\)/);

// Codex CLI env var is set in the parent scope, not interpolated away inside the child -Command.
assert.match(codexScript, /\$env:CODEX_NON_INTERACTIVE = '1'/);
assert.doesNotMatch(codexScript, /-Command "\$env:CODEX_NON_INTERACTIVE=1;/);

// Refresh-Path preserves process-only tools before merging persisted PATH entries.
assert.match(codexScript, /@\(\$env:Path, \$machine, \$user\) -split ';'/);
assert.match(codexScript, /HashSet\[string\].*StringComparer\]::OrdinalIgnoreCase/);
assert.match(codexScript, /Where-Object \{ \$_ -and \$seen\.Add\(\$_\) \}/);
assert.doesNotMatch(codexScript, /\$env:Path = "\$machine;\$user"/);

// Polyglot marker is split in the header and matched with IndexOf so a setting value cannot hijack extraction.
assert.match(codexScript, /\$m='#__PS_SCRIPT'\+'_BELOW__'/);
assert.match(codexScript, /\$raw\.IndexOf\(\$m\)/);
assert.doesNotMatch(codexScript, /\.LastIndexOf\(\$m\)/);

// A hostile setting containing the literal marker must not become the first match.
const marker = "#__PS_SCRIPT_BELOW__";
const hostileScript = buildWindowsScript(resolveSelection(new Set(["git-config"]), "win"), {
  gitName: `x${marker}Stop-Computer`,
  gitEmail: "a@b.c"
});
const firstMarker = hostileScript.indexOf(marker);
assert.equal(hostileScript.slice(0, firstMarker).includes(marker), false);
assert.match(hostileScript.slice(firstMarker), /^#__PS_SCRIPT_BELOW__\r?\n/);

// Git identity writes each field only when that specific field is missing.
const gitWinScript = buildWindowsScript(resolveSelection(new Set(["git-config"]), "win"), settings);
assert.match(gitWinScript, /if \(-not \$existingName\) \{ & git config --global user\.name/);
assert.match(gitWinScript, /if \(-not \$existingEmail\) \{ & git config --global user\.email/);

assert.equal(selfTest().ok, true);
console.log("windows tests pass");
