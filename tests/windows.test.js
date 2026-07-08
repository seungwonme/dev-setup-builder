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

assert.equal(selfTest().ok, true);
console.log("windows tests pass");
