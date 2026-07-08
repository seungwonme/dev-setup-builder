const PACKAGES = [
  {
    id: "git",
    group: "Core",
    label: "Git",
    note: "Version control and shell integration.",
    presets: ["minimal", "agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_formula "Git" "git" "git"'],
    win: () => ["Install-Winget -Label 'Git' -PackageId 'Git.Git' -Command 'git' -ExtraArgs @('--scope','user')"]
  },
  {
    id: "node",
    group: "Core",
    label: "Node.js",
    note: "JavaScript runtime. Required for npm global CLIs.",
    presets: ["minimal", "agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_formula "Node.js" "node" "node"'],
    win: () => ["Install-Winget -Label 'Node.js LTS' -PackageId 'OpenJS.NodeJS.LTS' -Command 'node' -ExtraArgs @('--scope','user')"]
  },
  {
    id: "pnpm",
    group: "Core",
    label: "pnpm",
    note: "JavaScript package manager enabled through Corepack, with npm fallback.",
    presets: ["minimal", "agent"],
    deps: { mac: ["node"], win: ["node"] },
    mac: () => ["install_pnpm"],
    win: () => ["Install-Pnpm"]
  },
  {
    id: "python",
    group: "Core",
    label: "Python",
    note: "Latest package-manager stable Python.",
    presets: ["minimal", "agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_formula "Python" "python" "python3"'],
    win: () => [
      "$pythonOk = $false",
      "foreach ($candidate in @('Python.Python.3.14','Python.Python.3.13','Python.Python.3.12')) {",
      "  if ($pythonOk) { break }",
      "  Install-Winget -Label 'Python' -PackageId $candidate -Command 'python' -ExtraArgs @('--scope','user')",
      "  if (Has-Command 'python') { $pythonOk = $true }",
      "}"
    ]
  },
  {
    id: "uv",
    group: "Core",
    label: "uv",
    note: "Python package and project manager.",
    presets: ["minimal", "agent"],
    deps: { mac: [], win: [] },
    mac: () => ["install_uv"],
    win: () => ["Install-Uv"]
  },
  {
    id: "bun",
    group: "Core",
    label: "Bun",
    note: "Optional JavaScript runtime and package manager.",
    presets: [],
    deps: { mac: [], win: [] },
    mac: () => ["install_bun"],
    win: () => ["Install-Bun"]
  },
  {
    id: "docker",
    group: "Core",
    label: "Docker Desktop",
    note: "Container runtime. May require first launch or restart after install.",
    presets: [],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_cask "Docker Desktop" "docker" "Docker.app" "docker"'],
    win: () => ["Install-DockerDesktop"]
  },
  {
    id: "wsl2",
    group: "Core",
    label: "Windows WSL2",
    note: "Windows-only Linux subsystem. May require administrator permission and restart.",
    platforms: ["win"],
    presets: [],
    deps: { mac: [], win: [] },
    win: () => ["Install-WSL2"]
  },
  {
    id: "vscode",
    group: "Editor",
    label: "VS Code",
    note: "Editor and code command.",
    presets: ["agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_cask "VS Code" "visual-studio-code" "Visual Studio Code.app" "code"'],
    win: () => ["Install-VSCode"]
  },
  {
    id: "claude-desktop",
    group: "AI tools",
    label: "Claude Desktop",
    note: "Desktop app.",
    presets: ["agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_cask "Claude Desktop" "claude" "Claude.app" ""'],
    win: () => ["Install-ClaudeDesktop"]
  },
  {
    id: "claude-code",
    group: "AI tools",
    label: "Claude Code CLI",
    note: "Native installer first, npm fallback when available.",
    presets: ["agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ["install_claude_code"],
    win: () => ["Install-ClaudeCode"]
  },
  {
    id: "claude-extension",
    group: "AI tools",
    label: "Claude Code VS Code extension",
    note: "Installs anthropic.claude-code.",
    presets: ["agent"],
    deps: { mac: ["vscode"], win: ["vscode"] },
    mac: () => ['install_vscode_extension "anthropic.claude-code" "Claude Code VS Code extension"'],
    win: () => ["Install-CodeExtension -ExtensionId 'anthropic.claude-code' -Label 'Claude Code VS Code extension'"]
  },
  {
    id: "codex",
    group: "AI tools",
    label: "Codex CLI",
    note: "Installs @openai/codex with npm.",
    presets: [],
    deps: { mac: ["node"], win: ["node"] },
    mac: () => ['npm_global "Codex CLI" "@openai/codex" "codex"'],
    win: () => ["Install-NpmGlobal -Label 'Codex CLI' -Package '@openai/codex' -Command 'codex'"]
  },
  {
    id: "vercel",
    group: "Web deploy",
    label: "Vercel CLI",
    note: "Installs vercel with npm.",
    presets: [],
    deps: { mac: ["node"], win: ["node"] },
    mac: () => ['npm_global "Vercel CLI" "vercel" "vercel"'],
    win: () => ["Install-NpmGlobal -Label 'Vercel CLI' -Package 'vercel' -Command 'vercel'"]
  },
  {
    id: "gh",
    group: "Source control",
    label: "GitHub CLI",
    note: "gh command.",
    presets: ["agent"],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_formula "GitHub CLI" "gh" "gh"'],
    win: () => ["Install-Winget -Label 'GitHub CLI' -PackageId 'GitHub.cli' -Command 'gh'"]
  },
  {
    id: "github-auth",
    group: "Source control",
    label: "GitHub CLI auth",
    note: "Checks gh login and prints the login command when needed.",
    presets: ["agent"],
    deps: { mac: ["gh"], win: ["gh"] },
    mac: () => ["check_github_auth"],
    win: () => ["Check-GitHubAuth"]
  },
  {
    id: "glab",
    group: "Source control",
    label: "GitLab CLI",
    note: "glab command.",
    presets: [],
    deps: { mac: ["homebrew"], win: [] },
    mac: () => ['brew_formula "GitLab CLI" "glab" "glab"'],
    win: () => ["Install-Winget -Label 'GitLab CLI' -PackageId 'glab.glab' -Command 'glab'"]
  },
  {
    id: "git-config",
    group: "Source control",
    label: "Git identity defaults",
    note: "Writes name and email only when both are missing.",
    presets: [],
    deps: { mac: ["git"], win: ["git"] },
    mac: (settings) => [
      `configure_git ${sh(settings.gitName)} ${sh(settings.gitEmail)}`
    ],
    win: (settings) => [
      `Set-GitDefaults -Name ${ps(settings.gitName)} -Email ${ps(settings.gitEmail)}`
    ]
  }
];

const SYSTEM_LABELS = {
  homebrew: "Homebrew"
};

const state = {
  os: "mac",
  selected: new Set(PACKAGES.filter((item) => item.presets.includes("agent")).map((item) => item.id))
};

const packageById = new Map(PACKAGES.map((item) => [item.id, item]));

function sh(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function ps(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function fileName(os) {
  return os === "mac" ? "setup-mac.command" : "setup-windows.bat";
}

function supportsOs(item, os) {
  return !item.platforms || item.platforms.includes(os);
}

function getSettings() {
  return {
    gitName: document.getElementById("gitName").value || "Claude Code",
    gitEmail: document.getElementById("gitEmail").value || "noreply@anthropic.com"
  };
}

function resolveSelection(ids, os) {
  const resolved = new Set([...ids].filter((id) => {
    const item = packageById.get(id);
    return !item || supportsOs(item, os);
  }));
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...resolved]) {
      const item = packageById.get(id);
      if (!item) {
        continue;
      }
      for (const dep of item.deps[os] || []) {
        if (!resolved.has(dep)) {
          resolved.add(dep);
          changed = true;
        }
      }
    }
  }
  return resolved;
}

function visibleResolved(resolved) {
  return PACKAGES.filter((item) => resolved.has(item.id)).map((item) => item.id);
}

function autoAdded(original, resolved) {
  return [...resolved].filter((id) => !original.has(id)).map((id) => {
    const item = packageById.get(id);
    return item ? item.label : SYSTEM_LABELS[id] || id;
  });
}

function buildMacScript(resolved, settings) {
  const body = [];
  if (resolved.has("homebrew")) {
    body.push("install_homebrew");
  }
  for (const id of visibleResolved(resolved)) {
    const item = packageById.get(id);
    if (item.mac) {
      body.push(...item.mac(settings));
    }
  }
  return [
    "#!/bin/bash",
    "# Generated by Dev Setup Builder.",
    "# Run with: bash setup-mac.command",
    "# For Finder double-click: chmod +x setup-mac.command",
    "# If macOS blocks it: right-click the file, choose Open, then Open again.",
    "# If quarantine still blocks it: xattr -d com.apple.quarantine setup-mac.command",
    "set -u",
    "set -o pipefail",
    "",
    'LOG="${TMPDIR:-/tmp}/dev-setup-builder-$(date +%Y%m%d-%H%M%S).log"',
    ': > "$LOG"',
    "FAILED_ITEMS=()",
    "",
    'has() { command -v "$1" >/dev/null 2>&1; }',
    'info() { printf "\\n[%s]\\n" "$1"; }',
    'ok() { printf "  OK: %s\\n" "$1"; }',
    'warn() { printf "  WARN: %s\\n" "$1"; }',
    'fail() { printf "  FAIL: %s\\n" "$1"; FAILED_ITEMS+=("$1"); }',
    "",
    "path_prepend() {",
    '  [ -d "$1" ] || return 0',
    '  case ":${PATH:-}:" in *":$1:"*) ;; *) export PATH="$1:${PATH:-}" ;; esac',
    "}",
    "",
    "refresh_path() {",
    "  if has brew; then",
    '    eval "$(brew shellenv)"',
    "  elif [ -x /opt/homebrew/bin/brew ]; then",
    '    eval "$(/opt/homebrew/bin/brew shellenv)"',
    "  elif [ -x /usr/local/bin/brew ]; then",
    '    eval "$(/usr/local/bin/brew shellenv)"',
    "  fi",
    '  path_prepend "$HOME/.bun/bin"',
    '  path_prepend "$HOME/.local/bin"',
    '  path_prepend "/Applications/Visual Studio Code.app/Contents/Resources/app/bin"',
    '  path_prepend "$HOME/Applications/Visual Studio Code.app/Contents/Resources/app/bin"',
    "  if has npm; then",
    '    prefix="$(npm prefix -g 2>/dev/null || true)"',
    '    [ -n "$prefix" ] && path_prepend "$prefix/bin"',
    "  fi",
    "}",
    "",
    "append_once() {",
    '  file="$1"; marker="$2"; shift 2',
    '  mkdir -p "$(dirname "$file")"; touch "$file"',
    '  grep -Fq "$marker" "$file" 2>/dev/null && return 0',
    '  { printf "\\n%s\\n" "$marker"; for line in "$@"; do printf "%s\\n" "$line"; done; } >> "$file"',
    "}",
    "",
    "install_homebrew() {",
    '  info "Homebrew"',
    "  if has brew; then ok \"Homebrew installed\"; refresh_path; return 0; fi",
    `  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" >> "$LOG" 2>&1 || { fail "Homebrew"; return 1; }`,
    "  refresh_path",
    '  if has brew; then ok "Homebrew installed"; else fail "Homebrew"; fi',
    "}",
    "",
    "brew_formula() {",
    '  label="$1"; formula="$2"; command_name="$3"',
    '  info "$label"',
    '  if has "$command_name"; then ok "$label installed"; return 0; fi',
    '  if ! has brew; then fail "$label (Homebrew missing)"; return 1; fi',
    '  brew install "$formula" >> "$LOG" 2>&1',
    "  refresh_path",
    '  if has "$command_name"; then ok "$label installed"; else fail "$label"; fi',
    "}",
    "",
    "app_exists() {",
    '  [ -n "$1" ] && { [ -d "/Applications/$1" ] || [ -d "$HOME/Applications/$1" ]; }',
    "}",
    "",
    "brew_cask() {",
    '  label="$1"; cask="$2"; app_name="$3"; command_name="$4"',
    '  info "$label"',
    '  [ -n "$command_name" ] && has "$command_name" && { ok "$label installed"; return 0; }',
    '  app_exists "$app_name" && { ok "$label installed"; return 0; }',
    '  if ! has brew; then fail "$label (Homebrew missing)"; return 1; fi',
    '  brew install --cask "$cask" >> "$LOG" 2>&1',
    "  refresh_path",
    '  if { [ -n "$command_name" ] && has "$command_name"; } || app_exists "$app_name"; then ok "$label installed"; else fail "$label"; fi',
    "}",
    "",
    "npm_global() {",
    '  label="$1"; package_name="$2"; command_name="$3"',
    '  info "$label"',
    '  if has "$command_name"; then ok "$label installed"; return 0; fi',
    '  if ! has npm; then fail "$label (npm missing)"; return 1; fi',
    '  npm install -g "$package_name" >> "$LOG" 2>&1',
    "  refresh_path",
    '  if has "$command_name"; then ok "$label installed"; else fail "$label"; fi',
    "}",
    "",
    "install_pnpm() {",
    '  info "pnpm"',
    '  if has pnpm; then ok "pnpm installed"; return 0; fi',
    '  if has corepack; then corepack enable >> "$LOG" 2>&1; corepack prepare pnpm@latest --activate >> "$LOG" 2>&1; refresh_path; fi',
    '  if ! has pnpm && has npm; then npm install -g pnpm >> "$LOG" 2>&1; refresh_path; fi',
    '  if has pnpm; then ok "pnpm installed"; else fail "pnpm"; fi',
    "}",
    "",
    "install_bun() {",
    '  info "Bun"',
    '  if has bun || [ -x "$HOME/.bun/bin/bun" ]; then path_prepend "$HOME/.bun/bin"; ok "Bun installed"; return 0; fi',
    '  curl -fsSL https://bun.sh/install | bash >> "$LOG" 2>&1',
    '  path_prepend "$HOME/.bun/bin"',
    '  append_once "$HOME/.zprofile" "# Dev Setup Builder - Bun PATH" \'export BUN_INSTALL="$HOME/.bun"\' \'export PATH="$BUN_INSTALL/bin:$PATH"\'',
    '  if has bun || [ -x "$HOME/.bun/bin/bun" ]; then ok "Bun installed"; else fail "Bun"; fi',
    "}",
    "",
    "install_uv() {",
    '  info "uv"',
    '  if has uv || [ -x "$HOME/.local/bin/uv" ]; then path_prepend "$HOME/.local/bin"; ok "uv installed"; return 0; fi',
    '  curl -LsSf https://astral.sh/uv/install.sh | sh >> "$LOG" 2>&1',
    '  path_prepend "$HOME/.local/bin"',
    '  append_once "$HOME/.zprofile" "# Dev Setup Builder - uv PATH" \'export PATH="$HOME/.local/bin:$PATH"\'',
    '  if has uv || [ -x "$HOME/.local/bin/uv" ]; then ok "uv installed"; else fail "uv"; fi',
    "}",
    "",
    "install_claude_code() {",
    '  info "Claude Code CLI"',
    '  if has claude; then ok "Claude Code CLI installed"; return 0; fi',
    '  if has brew; then brew install --cask claude-code >> "$LOG" 2>&1; refresh_path; fi',
    '  if has claude; then ok "Claude Code CLI installed"; return 0; fi',
    '  if has npm; then npm_global "Claude Code CLI" "@anthropic-ai/claude-code" "claude"; else fail "Claude Code CLI"; fi',
    "}",
    "",
    "check_github_auth() {",
    '  info "GitHub CLI auth"',
    '  if ! has gh; then fail "GitHub CLI auth (gh missing)"; return 1; fi',
    '  if gh auth status >> "$LOG" 2>&1; then ok "GitHub CLI authenticated"; else warn "GitHub CLI not authenticated. Run: gh auth login -w"; fi',
    "}",
    "",
    "install_vscode_extension() {",
    '  extension_id="$1"; label="$2"',
    '  info "$label"',
    '  if ! has code; then fail "$label (code command missing)"; return 1; fi',
    '  if code --list-extensions 2>/dev/null | grep -qi "^${extension_id}$"; then ok "$label installed"; return 0; fi',
    '  code --install-extension "$extension_id" --force >> "$LOG" 2>&1',
    '  if code --list-extensions 2>/dev/null | grep -qi "^${extension_id}$"; then ok "$label installed"; else fail "$label"; fi',
    "}",
    "",
    "configure_git() {",
    '  name="$1"; email="$2"',
    '  info "Git identity defaults"',
    '  if ! has git; then fail "Git identity defaults (git missing)"; return 1; fi',
    '  existing_name="$(git config --global user.name 2>/dev/null || true)"',
    '  existing_email="$(git config --global user.email 2>/dev/null || true)"',
    '  if [ -n "$existing_name" ] && [ -n "$existing_email" ]; then ok "Git identity already set"; return 0; fi',
    '  git config --global user.name "$name" >> "$LOG" 2>&1',
    '  git config --global user.email "$email" >> "$LOG" 2>&1',
    '  ok "Git identity defaults set"',
    "}",
    "",
    "refresh_path",
    "",
    ...body,
    "",
    'printf "\\nLog: %s\\n" "$LOG"',
    'if [ "${#FAILED_ITEMS[@]}" -gt 0 ]; then',
    '  printf "Failed items:\\n"',
    '  printf "  - %s\\n" "${FAILED_ITEMS[@]}"',
    "  exit 1",
    "fi",
    'printf "Done. Open a new terminal before using newly installed commands.\\n"'
  ].join("\n");
}

function buildWindowsScript(resolved, settings) {
  const body = [];
  for (const id of visibleResolved(resolved)) {
    const item = packageById.get(id);
    if (item.win) {
      body.push(...item.win(settings));
    }
  }
  return [
    "@echo off",
    "rem Generated by Dev Setup Builder.",
    "rem If Windows blocks it: right-click file > Properties > Unblock.",
    "rem For installer permission failures: right-click > Run as administrator.",
    "rem For SmartScreen: More info > Run anyway.",
    "setlocal",
    "set \"BAT_FILE=%~f0\"",
    "powershell -NoProfile -ExecutionPolicy Bypass -Command \"$raw=[IO.File]::ReadAllText($env:BAT_FILE,[Text.UTF8Encoding]::new($false)); $m='#__PS_SCRIPT_BELOW__'; $i=$raw.LastIndexOf($m); if($i -lt 0){ Write-Host 'ERROR: PS marker not found'; exit 1 }; $ps=$raw.Substring($i+$m.Length); $sb=[scriptblock]::Create($ps); & $sb; exit $LASTEXITCODE\"",
    "set \"EC=%ERRORLEVEL%\"",
    "pause",
    "exit /b %EC%",
    "",
    "#__PS_SCRIPT_BELOW__",
    "$ErrorActionPreference = 'Continue'",
    "$ProgressPreference = 'SilentlyContinue'",
    "try { chcp 65001 > $null } catch {}",
    "try { [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false); $OutputEncoding = [Text.UTF8Encoding]::new($false) } catch {}",
    "$LogFile = Join-Path $env:TEMP (\"dev-setup-builder-{0}.log\" -f (Get-Date -Format 'yyyyMMdd-HHmmss'))",
    "[IO.File]::WriteAllText($LogFile, \"=== $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===`r`n\", [Text.UTF8Encoding]::new($false))",
    "$Failed = @()",
    "",
    "function Ok([string]$Text) { Write-Host \"  OK: $Text\" }",
    "function Warn([string]$Text) { Write-Host \"  WARN: $Text\" }",
    "function Fail([string]$Text) { Write-Host \"  FAIL: $Text\"; $script:Failed += $Text }",
    "function Step([string]$Text) { Write-Host \"\"; Write-Host \"[$Text]\" }",
    "function Has-Command([string]$Name) { return [bool](Get-Command $Name -ErrorAction SilentlyContinue) }",
    "",
    "function Refresh-Path {",
    "  $machine = [Environment]::GetEnvironmentVariable('Path', 'Machine')",
    "  $user = [Environment]::GetEnvironmentVariable('Path', 'User')",
    "  $env:Path = \"$machine;$user\"",
    "  foreach ($p in @(",
    "    'C:\\Program Files\\Git\\cmd',",
    "    'C:\\Program Files\\Git\\bin',",
    "    'C:\\Program Files\\nodejs',",
    "    'C:\\Program Files\\Docker\\Docker\\resources\\bin',",
    "    (Join-Path $env:APPDATA 'npm'),",
    "    (Join-Path $env:USERPROFILE '.bun\\bin'),",
    "    (Join-Path $env:USERPROFILE '.local\\bin'),",
    "    (Join-Path $env:LOCALAPPDATA 'Microsoft\\WinGet\\Links'),",
    "    (Join-Path $env:LOCALAPPDATA 'Programs\\Microsoft VS Code\\bin')",
    "  )) {",
    "    if ($p -and (Test-Path $p) -and ($env:Path -notlike \"*$p*\")) { $env:Path = \"$p;$env:Path\" }",
    "  }",
    "}",
    "",
    "function Install-Winget {",
    "  param([string]$Label, [string]$PackageId, [string]$Command, [string[]]$ExtraArgs = @())",
    "  Step $Label",
    "  if ($Command -and (Has-Command $Command)) { Ok \"$Label installed\"; return }",
    "  if (-not (Has-Command 'winget')) { Fail \"$Label (winget missing)\"; return }",
    "  $args = @('install','--id',$PackageId,'--exact','--source','winget','--accept-source-agreements','--accept-package-agreements','--silent','--disable-interactivity') + $ExtraArgs",
    "  & winget @args *>> $LogFile",
    "  $exitCode = $LASTEXITCODE",
    "  Refresh-Path",
    "  if ($Command) {",
    "    if (Has-Command $Command) { Ok \"$Label installed\" } else { Fail $Label }",
    "  } elseif ($exitCode -eq 0) {",
    "    Ok \"$Label installer completed\"",
    "  } else {",
    "    Fail $Label",
    "  }",
    "}",
    "",
    "function Install-NpmGlobal {",
    "  param([string]$Label, [string]$Package, [string]$Command)",
    "  Step $Label",
    "  if (Has-Command $Command) { Ok \"$Label installed\"; return }",
    "  if (-not (Has-Command 'npm')) { Fail \"$Label (npm missing)\"; return }",
    "  & npm install -g $Package *>> $LogFile",
    "  Refresh-Path",
    "  if (Has-Command $Command) { Ok \"$Label installed\" } else { Fail $Label }",
    "}",
    "",
    "function Install-Pnpm {",
    "  Step 'pnpm'",
    "  if (Has-Command 'pnpm') { Ok 'pnpm installed'; return }",
    "  if (Has-Command 'corepack') { & corepack enable *>> $LogFile; & corepack prepare pnpm@latest --activate *>> $LogFile; Refresh-Path }",
    "  if ((-not (Has-Command 'pnpm')) -and (Has-Command 'npm')) { & npm install -g pnpm *>> $LogFile; Refresh-Path }",
    "  if (Has-Command 'pnpm') { Ok 'pnpm installed' } else { Fail 'pnpm' }",
    "}",
    "",
    "function Test-Admin {",
    "  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()",
    "  $principal = [Security.Principal.WindowsPrincipal]::new($identity)",
    "  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)",
    "}",
    "",
    "function Install-WSL2 {",
    "  Step 'Windows WSL2'",
    "  if (Has-Command 'wsl') { & wsl --status *>> $LogFile; if ($LASTEXITCODE -eq 0) { Ok 'WSL2 available'; return } }",
    "  if (-not (Test-Admin)) { Fail 'WSL2 (run as administrator)'; return }",
    "  & wsl --install --no-launch *>> $LogFile",
    "  $exitCode = $LASTEXITCODE",
    "  if ($exitCode -eq 0) { Ok 'WSL2 install started; restart may be required' } else { Fail 'WSL2' }",
    "}",
    "",
    "function Install-Bun {",
    "  Step 'Bun'",
    "  $bunPath = Join-Path $env:USERPROFILE '.bun\\bin\\bun.exe'",
    "  if ((Has-Command 'bun') -or (Test-Path $bunPath)) { Ok 'Bun installed'; return }",
    "  $installer = Join-Path $env:TEMP 'bun-install.ps1'",
    "  try { Invoke-RestMethod https://bun.sh/install.ps1 -UseBasicParsing -OutFile $installer; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer *>> $LogFile } catch { $_ | Out-String | Add-Content -Path $LogFile }",
    "  Refresh-Path",
    "  if ((Has-Command 'bun') -or (Test-Path $bunPath)) { Ok 'Bun installed' } else { Fail 'Bun' }",
    "}",
    "",
    "function Install-Uv {",
    "  Step 'uv'",
    "  $uvPath = Join-Path $env:USERPROFILE '.local\\bin\\uv.exe'",
    "  if ((Has-Command 'uv') -or (Test-Path $uvPath)) { Ok 'uv installed'; return }",
    "  $installer = Join-Path $env:TEMP 'uv-install.ps1'",
    "  try { Invoke-RestMethod https://astral.sh/uv/install.ps1 -UseBasicParsing -OutFile $installer; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $installer *>> $LogFile } catch { $_ | Out-String | Add-Content -Path $LogFile }",
    "  Refresh-Path",
    "  if ((Has-Command 'uv') -or (Test-Path $uvPath)) { Ok 'uv installed' } else { Fail 'uv' }",
    "}",
    "",
    "function Find-Code {",
    "  $cmd = Get-Command code -ErrorAction SilentlyContinue",
    "  if ($cmd) { return $cmd.Source }",
    "  foreach ($p in @(",
    "    (Join-Path $env:LOCALAPPDATA 'Programs\\Microsoft VS Code\\bin\\code.cmd'),",
    "    (Join-Path $env:ProgramFiles 'Microsoft VS Code\\bin\\code.cmd')",
    "  )) { if ($p -and (Test-Path $p)) { return $p } }",
    "  return $null",
    "}",
    "",
    "$script:vscodeCmd = $null",
    "function Install-VSCode {",
    "  Step 'VS Code'",
    "  $script:vscodeCmd = Find-Code",
    "  if ($script:vscodeCmd) { Ok 'VS Code installed'; return }",
    "  Install-Winget -Label 'VS Code' -PackageId 'Microsoft.VisualStudioCode' -Command 'code' -ExtraArgs @('--scope','user')",
    "  $script:vscodeCmd = Find-Code",
    "  if (-not $script:vscodeCmd) { Fail 'VS Code command' }",
    "}",
    "",
    "function Test-ClaudeDesktop {",
    "  foreach ($p in @(",
    "    (Join-Path $env:LOCALAPPDATA 'AnthropicClaude\\claude.exe'),",
    "    (Join-Path $env:LOCALAPPDATA 'Programs\\claude-desktop\\Claude.exe'),",
    "    (Join-Path $env:ProgramFiles 'Claude\\Claude.exe')",
    "  )) { if ($p -and (Test-Path $p)) { return $true } }",
    "  try { if (Get-AppxPackage -Name 'Claude' -ErrorAction SilentlyContinue) { return $true } } catch {}",
    "  return $false",
    "}",
    "",
    "function Test-DockerDesktop {",
    "  if (Has-Command 'docker') { return $true }",
    "  foreach ($p in @(",
    "    (Join-Path $env:ProgramFiles 'Docker\\Docker\\Docker Desktop.exe'),",
    "    (Join-Path $env:ProgramFiles 'Docker\\Docker\\resources\\bin\\docker.exe')",
    "  )) { if ($p -and (Test-Path $p)) { return $true } }",
    "  return $false",
    "}",
    "",
    "function Install-DockerDesktop {",
    "  Step 'Docker Desktop'",
    "  if (Test-DockerDesktop) { Ok 'Docker Desktop installed'; return }",
    "  if (-not (Has-Command 'winget')) { Fail 'Docker Desktop (winget missing)'; return }",
    "  & winget install --id Docker.DockerDesktop --exact --source winget --accept-source-agreements --accept-package-agreements --silent --disable-interactivity *>> $LogFile",
    "  $exitCode = $LASTEXITCODE",
    "  Refresh-Path",
    "  if (Test-DockerDesktop) { Ok 'Docker Desktop installed'; return }",
    "  if ($exitCode -eq 0) { Ok 'Docker Desktop installer completed; restart or first launch may be required' } else { Fail 'Docker Desktop' }",
    "}",
    "",
    "function Install-ClaudeDesktop {",
    "  Step 'Claude Desktop'",
    "  if (Test-ClaudeDesktop) { Ok 'Claude Desktop installed'; return }",
    "  Install-Winget -Label 'Claude Desktop' -PackageId 'Anthropic.Claude' -Command '' -ExtraArgs @('--scope','user')",
    "  if (-not (Test-ClaudeDesktop)) { Warn 'Claude Desktop may require a new terminal or manual install' }",
    "}",
    "",
    "function Install-ClaudeCode {",
    "  Step 'Claude Code CLI'",
    "  if (Has-Command 'claude') { Ok 'Claude Code CLI installed'; return }",
    "  if (Has-Command 'winget') { & winget install --id Anthropic.ClaudeCode --exact --source winget --accept-source-agreements --accept-package-agreements --silent --disable-interactivity *>> $LogFile; Refresh-Path }",
    "  if (Has-Command 'claude') { Ok 'Claude Code CLI installed'; return }",
    "  if (Has-Command 'npm') { Install-NpmGlobal -Label 'Claude Code CLI' -Package '@anthropic-ai/claude-code' -Command 'claude' } else { Fail 'Claude Code CLI' }",
    "}",
    "",
    "function Check-GitHubAuth {",
    "  Step 'GitHub CLI auth'",
    "  if (-not (Has-Command 'gh')) { Fail 'GitHub CLI auth (gh missing)'; return }",
    "  & gh auth status *>> $LogFile",
    "  if ($LASTEXITCODE -eq 0) { Ok 'GitHub CLI authenticated' } else { Warn 'GitHub CLI not authenticated. Run: gh auth login -w' }",
    "}",
    "",
    "function Install-CodeExtension {",
    "  param([string]$ExtensionId, [string]$Label)",
    "  Step $Label",
    "  if (-not $script:vscodeCmd) { $script:vscodeCmd = Find-Code }",
    "  if (-not $script:vscodeCmd) { Fail \"$Label (VS Code missing)\"; return }",
    "  $extensions = & $script:vscodeCmd --list-extensions 2>$null",
    "  if ($extensions -match [regex]::Escape($ExtensionId)) { Ok \"$Label installed\"; return }",
    "  & $script:vscodeCmd --install-extension $ExtensionId --force *>> $LogFile",
    "  $extensions = & $script:vscodeCmd --list-extensions 2>$null",
    "  if ($extensions -match [regex]::Escape($ExtensionId)) { Ok \"$Label installed\" } else { Fail $Label }",
    "}",
    "",
    "function Set-GitDefaults {",
    "  param([string]$Name, [string]$Email)",
    "  Step 'Git identity defaults'",
    "  if (-not (Has-Command 'git')) { Fail 'Git identity defaults (git missing)'; return }",
    "  $existingName = & git config --global user.name 2>$null",
    "  $existingEmail = & git config --global user.email 2>$null",
    "  if ($existingName -and $existingEmail) { Ok 'Git identity already set'; return }",
    "  & git config --global user.name $Name *>> $LogFile",
    "  & git config --global user.email $Email *>> $LogFile",
    "  Ok 'Git identity defaults set'",
    "}",
    "",
    "Refresh-Path",
    "",
    ...body,
    "",
    "Write-Host \"\"",
    "Write-Host \"Log: $LogFile\"",
    "if ($Failed.Count -gt 0) {",
    "  Write-Host 'Failed items:'",
    "  foreach ($item in $Failed) { Write-Host \"  - $item\" }",
    "  exit 1",
    "}",
    "Write-Host 'Done. Open a new terminal before using newly installed commands.'",
    "exit 0"
  ].join("\r\n");
}

function buildScript() {
  const resolved = resolveSelection(state.selected, state.os);
  const settings = getSettings();
  return state.os === "mac" ? buildMacScript(resolved, settings) : buildWindowsScript(resolved, settings);
}

function renderPackages() {
  const root = document.getElementById("packageList");
  const packages = PACKAGES.filter((item) => supportsOs(item, state.os));
  const groups = [...new Set(packages.map((item) => item.group))];
  root.innerHTML = groups.map((group) => {
    const items = packages.filter((item) => item.group === group).map((item) => `
      <label class="package">
        <input type="checkbox" data-package="${item.id}" ${state.selected.has(item.id) ? "checked" : ""}>
        <span>
          <strong>${item.label}</strong>
          <span>${item.note}</span>
        </span>
      </label>
    `).join("");
    return `<div class="group"><h3>${group}</h3>${items}</div>`;
  }).join("");

  root.querySelectorAll("[data-package]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const id = event.currentTarget.dataset.package;
      if (event.currentTarget.checked) {
        state.selected.add(id);
      } else {
        state.selected.delete(id);
      }
      update();
    });
  });
}

function update() {
  const resolved = resolveSelection(state.selected, state.os);
  const script = buildScript();
  const added = autoAdded(state.selected, resolved);
  const file = fileName(state.os);
  const preview = document.getElementById("scriptPreview");
  preview.value = script;
  document.getElementById("previewTitle").textContent = file;
  document.getElementById("metaLine").innerHTML = [
    `<span class="pill">${visibleResolved(resolved).length} tools</span>`,
    `<span class="pill">${script.split(/\r?\n/).length} lines</span>`
  ].join("");
  document.getElementById("dependencyText").textContent = added.length ? `Auto-added: ${added.join(", ")}` : "";
  document.getElementById("statusText").innerHTML = visibleResolved(resolved).length ? "Ready" : "<span class='warning'>No tools selected</span>";
  updatePermissionHelp();
  renderPackages();
}

function updatePermissionHelp() {
  const items = state.os === "mac" ? [
    "Run with bash setup-mac.command if the download is not executable.",
    "For Finder double-click, run chmod +x setup-mac.command first.",
    "If macOS blocks it, right-click the file, choose Open, then Open again.",
    "If quarantine still blocks it, run xattr -d com.apple.quarantine setup-mac.command."
  ] : [
    "If Windows blocks the file, right-click it, open Properties, then check Unblock.",
    "If installers fail, right-click setup-windows.bat and choose Run as administrator.",
    "If SmartScreen appears, choose More info, then Run anyway.",
    "PowerShell policy is bypassed only for this script run."
  ];
  document.getElementById("permissionHelp").innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function setPreset(name) {
  if (name === "clear") {
    state.selected = new Set();
  } else {
    state.selected = new Set(PACKAGES.filter((item) => item.presets.includes(name)).map((item) => item.id));
  }
  update();
}

function downloadScript() {
  const script = buildScript();
  const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName(state.os);
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById("statusText").textContent = `Downloaded ${a.download}`;
}

async function copyScript() {
  const text = buildScript();
  await navigator.clipboard.writeText(text);
  document.getElementById("statusText").textContent = "Copied script";
}

function selfTest() {
  const settings = { gitName: "A", gitEmail: "a@example.com" };
  const selected = new Set(["codex", "claude-extension"]);
  const mac = resolveSelection(selected, "mac");
  const win = resolveSelection(selected, "win");
  const macScript = buildMacScript(mac, settings);
  const winScript = buildWindowsScript(win, settings);
  const setupSelected = new Set(["pnpm", "github-auth", "wsl2"]);
  const macSetup = resolveSelection(setupSelected, "mac");
  const winSetup = resolveSelection(setupSelected, "win");
  const macSetupScript = buildMacScript(macSetup, settings);
  const winSetupScript = buildWindowsScript(winSetup, settings);
  const codexOnlyScript = buildMacScript(resolveSelection(new Set(["codex"]), "mac"), settings);
  const nodeIndex = codexOnlyScript.indexOf('brew_formula "Node.js"');
  const codexIndex = codexOnlyScript.indexOf('npm_global "Codex CLI"');
  const checks = [
    mac.has("node"),
    mac.has("vscode"),
    mac.has("homebrew"),
    win.has("node"),
    win.has("vscode"),
    macSetup.has("node"),
    macSetup.has("gh"),
    macSetup.has("homebrew"),
    !macSetup.has("wsl2"),
    winSetup.has("node"),
    winSetup.has("gh"),
    winSetup.has("wsl2"),
    macScript.includes("@openai/codex"),
    macScript.includes("anthropic.claude-code"),
    winScript.includes("@openai/codex"),
    winScript.includes("anthropic.claude-code"),
    macSetupScript.includes("install_pnpm"),
    macSetupScript.includes("check_github_auth"),
    !macSetupScript.includes("WSL2"),
    winSetupScript.includes("Install-Pnpm"),
    winSetupScript.includes("Check-GitHubAuth"),
    winSetupScript.includes("Install-WSL2"),
    nodeIndex >= 0 && nodeIndex < codexIndex,
    buildMacScript(new Set(["homebrew", "docker"]), settings).includes('brew_cask "Docker Desktop" "docker"'),
    buildWindowsScript(new Set(["docker"]), settings).includes("Docker.DockerDesktop")
  ];
  return { ok: checks.every(Boolean), checks };
}

function init() {
  document.querySelectorAll("input[name='os']").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.os = event.currentTarget.value;
      update();
    });
  });
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => setPreset(button.dataset.preset));
  });
  document.getElementById("gitName").addEventListener("input", update);
  document.getElementById("gitEmail").addEventListener("input", update);
  document.getElementById("downloadScript").addEventListener("click", downloadScript);
  document.getElementById("copyScript").addEventListener("click", () => {
    copyScript().catch(() => {
      document.getElementById("statusText").textContent = "Copy failed";
    });
  });

  if (new URLSearchParams(location.search).has("selftest")) {
    const result = selfTest();
    document.body.dataset.selftest = result.ok ? "pass" : "fail";
    if (!result.ok) {
      console.error("Self-test failed", result);
    }
  }
  update();
}

window.DevSetupBuilder = {
  buildMacScript,
  buildWindowsScript,
  resolveSelection,
  selfTest
};

document.addEventListener("DOMContentLoaded", init);
