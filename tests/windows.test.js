const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadBuilder() {
  const context = {
    console,
    window: {},
    document: { addEventListener() {} },
    URLSearchParams,
    location: { search: "" }
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8"),
    context,
    { filename: "js/app.js" }
  );
  return context.window.DevSetupBuilder;
}

function main() {
  const builder = loadBuilder();
  const settings = { gitName: "A", gitEmail: "a@example.com" };

  const codex = builder.resolveSelection(new Set(["codex"]), "win");
  const codexScript = builder.buildWindowsScript(codex, settings);
  const nodeIndex = codexScript.indexOf("Install-Winget -Label 'Node.js LTS'");
  const codexIndex = codexScript.indexOf("Install-NpmGlobal -Label 'Codex CLI'");

  assert.equal(codex.has("node"), true);
  assert.equal(nodeIndex >= 0 && nodeIndex < codexIndex, true);

  const extension = builder.resolveSelection(new Set(["claude-extension"]), "win");
  const extensionScript = builder.buildWindowsScript(extension, settings);

  assert.equal(extension.has("vscode"), true);
  assert.match(extensionScript, /Install-VSCode/);
  assert.match(extensionScript, /Install-CodeExtension -ExtensionId 'anthropic\.claude-code'/);

  const setup = builder.resolveSelection(new Set(["pnpm", "github-auth", "wsl2"]), "win");
  const setupScript = builder.buildWindowsScript(setup, settings);

  assert.equal(setup.has("node"), true);
  assert.equal(setup.has("gh"), true);
  assert.match(setupScript, /Install-Pnpm/);
  assert.match(setupScript, /Check-GitHubAuth/);
  assert.match(setupScript, /Install-WSL2/);
  assert.match(setupScript, /wsl --install --no-launch/);

  const dockerScript = builder.buildWindowsScript(new Set(["docker"]), settings);
  assert.match(dockerScript, /Docker\.DockerDesktop/);

  assert.equal(builder.selfTest().ok, true);
}

main();
console.log("windows tests pass");
