import assert from "node:assert/strict";
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

// --- Regression coverage for the script-defect fixes ---

// Failure tracking must be $script:-scoped everywhere, or a FAIL is lost and the run reports exit 0.
assert.match(codexScript, /\$script:Failed = @\(\)/);
assert.match(codexScript, /if \(\$script:Failed\.Count -gt 0\)/);
assert.doesNotMatch(codexScript, /\n\$Failed = @\(\)/);

// Codex CLI env var is set in the parent scope, not interpolated away inside the child -Command.
assert.match(codexScript, /\$env:CODEX_NON_INTERACTIVE = '1'/);
assert.doesNotMatch(codexScript, /-Command "\$env:CODEX_NON_INTERACTIVE=1;/);

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
