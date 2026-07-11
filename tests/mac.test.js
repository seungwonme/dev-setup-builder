import assert from "node:assert/strict";
import {
  PACKAGES,
  buildMacScript,
  resolveSelection,
  selfTest,
  supportsOs
} from "../src/builder.js";

const settings = { gitName: "A", gitEmail: "a@example.com" };

const codex = resolveSelection(new Set(["codex"]), "mac");
const codexScript = buildMacScript(codex, settings);
const nodeIndex = codexScript.indexOf('brew_formula "Node.js"');
const codexCallIndex = codexScript.lastIndexOf("install_codex_cli");
const codexNativeIndex = codexScript.indexOf("https://chatgpt.com/codex/install.sh");
const codexBrewIndex = codexScript.indexOf("brew install --cask codex");
const codexNpmIndex = codexScript.indexOf('npm_global "Codex CLI"');

assert.equal(codex.has("node"), true);
assert.equal(codex.has("homebrew"), true);
assert.equal(nodeIndex >= 0 && nodeIndex < codexCallIndex, true);
assert.equal(codexNativeIndex >= 0 && codexNativeIndex < codexBrewIndex && codexBrewIndex < codexNpmIndex, true);

const claudeCode = resolveSelection(new Set(["claude-code"]), "mac");
const claudeCodeScript = buildMacScript(claudeCode, settings);
const claudeNativeIndex = claudeCodeScript.indexOf("https://claude.ai/install.sh");
const claudeBrewIndex = claudeCodeScript.indexOf("brew install --cask claude-code");
const claudeNpmIndex = claudeCodeScript.indexOf('npm_global "Claude Code CLI"');

assert.equal(claudeCode.has("node"), true);
assert.equal(claudeCode.has("homebrew"), true);
assert.equal(claudeNativeIndex >= 0 && claudeNativeIndex < claudeBrewIndex && claudeBrewIndex < claudeNpmIndex, true);

const codexApp = resolveSelection(new Set(["codex-app"]), "mac");
const codexAppScript = buildMacScript(codexApp, settings);

assert.equal(codexApp.has("homebrew"), false);
assert.match(codexAppScript, /\ninstall_codex_app\n/);
assert.match(codexAppScript, /https:\/\/persistent\.oaistatic\.com\/codex-app-prod\/Codex\.dmg/);
assert.match(codexAppScript, /https:\/\/persistent\.oaistatic\.com\/codex-app-prod\/Codex-latest-x64\.dmg/);

const setup = resolveSelection(new Set(["pnpm", "github-auth", "wsl2"]), "mac");
const setupScript = buildMacScript(setup, settings);

assert.equal(setup.has("node"), true);
assert.equal(setup.has("gh"), true);
assert.equal(setup.has("wsl2"), false);
assert.match(setupScript, /install_pnpm/);
assert.match(setupScript, /check_github_auth/);
assert.doesNotMatch(setupScript, /WSL2/);

const macPackages = PACKAGES.filter((item) => supportsOs(item, "mac"));
assert.equal(macPackages.some((item) => item.id === "wsl2"), false);

const dockerScript = buildMacScript(new Set(["homebrew", "docker"]), settings);
assert.match(dockerScript, /brew_cask "Docker Desktop" "docker" "Docker\.app" ""/);
assert.match(dockerScript, /brew list --cask "\$1"/);

const claudeTelemetry = resolveSelection(new Set(["claude-code-telemetry"]), "mac");
const claudeTelemetryScript = buildMacScript(claudeTelemetry, {
  ...settings,
  otelEndpoint: "http://collector.local:4317",
  claudeLogUserPrompts: true,
  claudeLogToolDetails: true
});

assert.equal(claudeTelemetry.has("claude-code"), true);
assert.match(claudeTelemetryScript, /CLAUDE_CODE_ENABLE_TELEMETRY=1/);
assert.match(claudeTelemetryScript, /claude-code-telemetry\.sh/);
assert.match(claudeTelemetryScript, /\$HOME\/\.zshrc/);
assert.match(claudeTelemetryScript, /OTEL_EXPORTER_OTLP_ENDPOINT=%s/);
assert.match(claudeTelemetryScript, /configure_claude_code_telemetry 'http:\/\/collector\.local:4317' 'grpc' '' '' 'dev' '' '60000' '5000' 'otlp' 'otlp' 'none' '1' '0' '1'/);

const codexTelemetry = resolveSelection(new Set(["codex-telemetry"]), "mac");
const codexTelemetryScript = buildMacScript(codexTelemetry, {
  ...settings,
  codexLogUserPrompt: true,
  codexMetricsExporter: "otlp"
});

assert.equal(codexTelemetry.has("codex"), true);
assert.match(codexTelemetryScript, /config="\$HOME\/\.codex\/config\.toml"/);
assert.match(codexTelemetryScript, /Dev Setup Builder - Codex telemetry start/);
assert.match(codexTelemetryScript, /\[otel\]/);
assert.match(codexTelemetryScript, /metrics_exporter = %s/);
assert.match(codexTelemetryScript, /configure_codex_telemetry 'http:\/\/localhost:4317' 'grpc' '' '' 'dev' '' '60000' '5000' 'otlp' 'otlp' 'none' '0' '0' '0' '0' 'off' '' 'otlp' 'none' 'otlp' '1'/);

// --- Regression coverage for the script-defect fixes ---

// Codex telemetry must REPLACE config.toml (>), not append (>>), or re-runs stack [otel] tables.
assert.match(codexTelemetryScript, /\}\s*>\s*"\$config"/);
assert.doesNotMatch(codexTelemetryScript, /\}\s*>>\s*"\$config"/);

// Homebrew installer runs non-interactively (no silent RETURN hang).
const brewScript = buildMacScript(new Set(["homebrew"]), settings);
assert.match(brewScript, /NONINTERACTIVE=1 \/bin\/bash -c/);

// Python must not trust the /usr/bin/python3 CommandLineTools stub.
const pythonScript = buildMacScript(resolveSelection(new Set(["python"]), "mac"), settings);
assert.match(pythonScript, /install_python\(\) \{/);
assert.match(pythonScript, /\/opt\/homebrew\/bin\/python3/);
assert.doesNotMatch(pythonScript, /brew_formula "Python"/);

// Telemetry file may hold the OTLP header secret -> owner-only.
assert.match(claudeTelemetryScript, /chmod 600 "\$telemetry_file"/);

// Git identity writes each field only when that specific field is missing.
const gitScript = buildMacScript(resolveSelection(new Set(["git-config"]), "mac"), settings);
assert.match(gitScript, /\[ -z "\$existing_name" \] && git config --global user\.name/);
assert.match(gitScript, /\[ -z "\$existing_email" \] && git config --global user\.email/);

// CR/LF is stripped from telemetry values (TOML/script-line breakout guard).
const crlfScript = buildMacScript(resolveSelection(new Set(["claude-code-telemetry"]), "mac"), {
  ...settings,
  otelEndpoint: "http://x\nEVIL"
});
assert.doesNotMatch(crlfScript, /http:\/\/x\nEVIL/);
assert.match(crlfScript, /http:\/\/xEVIL/);

assert.equal(selfTest().ok, true);
console.log("mac tests pass");
