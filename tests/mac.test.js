const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadContext() {
  let packageHtml = "";
  const packageList = {
    set innerHTML(value) {
      packageHtml = value;
    },
    get innerHTML() {
      return packageHtml;
    },
    querySelectorAll() {
      return [];
    }
  };
  const context = {
    console,
    window: {},
    document: {
      addEventListener() {},
      getElementById(id) {
        if (id === "packageList") {
          return packageList;
        }
        throw new Error(`Unexpected element: ${id}`);
      }
    },
    URLSearchParams,
    location: { search: "" },
    packageHtml: () => packageHtml
  };
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(__dirname, "..", "js", "app.js"), "utf8"),
    context,
    { filename: "js/app.js" }
  );
  return context;
}

function main() {
  const context = loadContext();
  const builder = context.window.DevSetupBuilder;
  const settings = { gitName: "A", gitEmail: "a@example.com" };

  const codex = builder.resolveSelection(new Set(["codex"]), "mac");
  const codexScript = builder.buildMacScript(codex, settings);
  const nodeIndex = codexScript.indexOf('brew_formula "Node.js"');
  const codexIndex = codexScript.indexOf('npm_global "Codex CLI"');

  assert.equal(codex.has("node"), true);
  assert.equal(codex.has("homebrew"), true);
  assert.equal(nodeIndex >= 0 && nodeIndex < codexIndex, true);

  const setup = builder.resolveSelection(new Set(["pnpm", "github-auth", "wsl2"]), "mac");
  const setupScript = builder.buildMacScript(setup, settings);

  assert.equal(setup.has("node"), true);
  assert.equal(setup.has("gh"), true);
  assert.equal(setup.has("wsl2"), false);
  assert.match(setupScript, /install_pnpm/);
  assert.match(setupScript, /check_github_auth/);
  assert.doesNotMatch(setupScript, /WSL2/);

  context.renderPackages();
  assert.doesNotMatch(context.packageHtml(), /Windows WSL2/);

  const dockerScript = builder.buildMacScript(new Set(["homebrew", "docker"]), settings);
  assert.match(dockerScript, /brew_cask "Docker Desktop" "docker"/);

  assert.equal(builder.selfTest().ok, true);
}

main();
console.log("mac tests pass");
