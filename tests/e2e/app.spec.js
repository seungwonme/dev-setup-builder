import { expect, test } from "@playwright/test";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const screenshotDir = join("test-results", "screenshots");

test.beforeAll(() => {
  rmSync(screenshotDir, { recursive: true, force: true });
  mkdirSync(screenshotDir, { recursive: true });
});

test("exposes Korean, read-only preview, and announced status", async ({ page }) => {
  await page.goto("./");

  await expect.soft(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect.soft(page.getByRole("link", { name: "미리보기로 건너뛰기" })).toHaveAttribute("href", "#script-preview");
  await expect.soft(page.locator("#script-preview")).toHaveAttribute("aria-label", "생성된 설치 스크립트 미리보기");
  await expect.soft(page.getByRole("textbox", { name: "생성된 설치 스크립트" })).toHaveAttribute("readonly", "");
  await expect.soft(page.locator(".status")).toHaveAttribute("role", "status");
  await expect.soft(page.locator(".status")).toHaveAttribute("aria-live", "polite");
});

test("builds scripts and captures primary states", async ({ page }) => {
  await page.goto("./");

  const toolList = page.getByLabel("설치할 도구");

  await expect(page.getByRole("heading", { name: "개발 환경 설치 도우미" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "macOS" })).toHaveAttribute("aria-checked", "true");
  await expect(toolList.getByRole("checkbox", { name: /Windows WSL2/ })).toHaveCount(0);
  await expect(toolList.getByRole("checkbox")).toHaveCount(18);
  await expect(toolList.getByRole("checkbox", { name: /Bun/ })).toBeChecked();
  await expect(toolList.getByRole("checkbox", { name: /Codex App/ })).toBeChecked();
  await expect(toolList.getByRole("checkbox", { name: /Git 사용자 정보 기본값/ })).toBeChecked();
  await expect(page.getByRole("button", { name: /고급 설정/ })).toHaveAttribute("aria-expanded", "false");
  const pageOrigin = new URL(page.url()).origin;
  await page.context().grantPermissions(["clipboard-write"], { origin: pageOrigin });
  const macTerminalButton = page.getByRole("button", { name: "macOS 터미널 설치 명령어 복사" });
  await expect(macTerminalButton).toContainText("curl -fsSL");
  await expect(macTerminalButton).toContainText(`${pageOrigin}/dev-setup-builder/run-mac.sh`);
  await expect.poll(async () => macTerminalButton.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await expect(page.getByRole("textbox", { name: "수집 서버 주소" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "생성된 설치 스크립트" })).toHaveValue(/#!\/bin\/bash/);
  await expect(page.getByRole("textbox", { name: "생성된 설치 스크립트" })).toHaveValue(/Codex App/);
  await page.screenshot({ path: join(screenshotDir, "mac-home.png"), fullPage: true });

  await page.getByRole("button", { name: /고급 설정/ }).click();
  await expect(toolList.getByRole("checkbox", { name: /Claude Code 관측 로그/ })).not.toBeChecked();
  await expect(toolList.getByRole("checkbox", { name: /Codex 관측 로그/ })).not.toBeChecked();
  await page.getByRole("button", { name: "전체 선택" }).click();
  await expect(toolList.getByRole("checkbox", { name: /Claude Code 관측 로그/ })).not.toBeChecked();
  await expect(toolList.getByRole("checkbox", { name: /Codex 관측 로그/ })).not.toBeChecked();
  await expect(toolList.getByRole("checkbox", { name: /Git 사용자 정보 기본값/ })).toBeChecked();
  await toolList.getByRole("checkbox", { name: /Claude Code 관측 로그/ }).click();
  await toolList.getByRole("checkbox", { name: /Codex 관측 로그/ }).click();
  await page.getByText("수집 서버 연결").click();
  await expect(page.getByRole("textbox", { name: "수집 서버 주소" })).toHaveValue("http://localhost:4317");
  await page.getByText("Claude Code 세부 설정").click();
  await page.getByText("Codex 세부 설정").click();
  const promptBodyToggles = page.getByRole("switch", { name: "프롬프트 본문 수집" });
  await expect(promptBodyToggles).toHaveCount(2);
  await expect(promptBodyToggles.first()).not.toBeChecked();
  await expect(promptBodyToggles.last()).not.toBeChecked();

  await page.getByRole("button", { name: /기본 도구/ }).click();
  await expect(page.getByRole("button", { name: /기본 도구/ })).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#group-core")).toHaveAttribute("data-collapsed", "true");
  await expect(toolList.getByRole("checkbox", { name: /Bun/ })).toHaveCount(0);
  await page.waitForTimeout(320);
  await page.screenshot({ path: join(screenshotDir, "category-collapsed.png"), fullPage: true });

  await page.getByRole("button", { name: /기본 도구/ }).click();
  await expect(page.getByRole("button", { name: /기본 도구/ })).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#group-core")).toHaveAttribute("data-collapsed", "false");
  await expect(toolList.getByRole("checkbox", { name: /Bun/ })).toBeChecked();

  await page.getByRole("button", { name: "터미널에서 바로 실행 명령어 복사" }).click();
  await expect(page.getByRole("button", { name: /터미널에서 바로 실행 명령어 복사/ })).toContainText("복사됨");
  await expect(page.getByText("명령어 복사 완료")).toHaveCount(0);

  await page.getByRole("button", { name: "macOS 터미널 설치 명령어 복사" }).click();
  await expect(page.getByRole("button", { name: "macOS 터미널 설치 명령어 복사" })).toContainText("복사됨");

  await page.getByRole("button", { name: "링크 복사" }).click();
  await expect(page.getByRole("button", { name: "링크 복사됨" })).toBeVisible();
  await expect(page.getByText("링크 복사 완료")).toBeVisible();

  await page.getByRole("button", { name: "복사", exact: true }).click();
  await expect(page.getByRole("button", { name: "복사됨", exact: true })).toBeVisible();
  await expect(page.getByText("복사 완료")).toBeVisible();
  await page.screenshot({ path: join(screenshotDir, "copy-state.png"), fullPage: true });

  await page.getByRole("radio", { name: "Windows" }).click();
  await expect(toolList.getByRole("checkbox", { name: /Windows WSL2/ })).toBeVisible();
  const windowsTerminalButton = page.getByRole("button", { name: "Windows 터미널 설치 명령어 복사" });
  await expect(windowsTerminalButton).toContainText("powershell");
  await expect(windowsTerminalButton).toContainText(`${pageOrigin}/dev-setup-builder/run-windows.ps1`);
  await expect.poll(async () => windowsTerminalButton.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  await expect(page.getByRole("textbox", { name: "생성된 설치 스크립트" })).toHaveValue(/Install-WSL2/);
  await page.screenshot({ path: join(screenshotDir, "windows-home.png"), fullPage: true });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "다운로드" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("setup-windows.bat");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "개발 환경 설치 도우미" })).toBeVisible();
  await expect(page.locator(".site-footer")).toHaveCSS("position", "static");
  await page.screenshot({ path: join(screenshotDir, "mobile-mac.png"), fullPage: true });
});

test("shares configured settings and keeps Advanced collapsed", async ({ page }) => {
  const shared = {
    gitName: "Aiden Student",
    gitEmail: "aiden@example.com",
    otelEndpoint: "https://collector.example.com",
    otelEnvironment: "customer-prod",
    otelHeaderName: "Authorization",
    otelHeaderValue: "secret-token",
    otelResourceAttributes: "team=secret",
    claudeLogUserPrompts: "1",
    claudeLogAssistantResponses: "1",
    claudeLogToolDetails: "1",
    claudeLogToolContent: "1",
    claudeRawApiBodiesMode: "inline",
    claudeRawApiBodiesDir: "/private/bodies",
    codexLogUserPrompt: "1"
  };
  const params = new URLSearchParams({
    os: "mac",
    tools: "git,git-config,claude-code-telemetry,codex-telemetry",
    ...shared
  });

  await page.goto(`./?${params}`);

  await expect(page.getByRole("button", { name: /고급 설정/ })).toHaveAttribute("aria-expanded", "false");
  await page.getByText("Git 기본값 수정").click();
  await expect(page.getByRole("textbox", { name: "이름", exact: true })).toHaveValue("Aiden Student");
  await expect(page.getByRole("textbox", { name: "이메일", exact: true })).toHaveValue("aiden@example.com");

  await page.getByRole("button", { name: /고급 설정/ }).click();
  await page.getByText("수집 서버 연결").click();
  await expect(page.getByRole("textbox", { name: "수집 서버 주소" })).toHaveValue("https://collector.example.com");
  await expect(page.getByRole("textbox", { name: "리소스 속성" })).toHaveValue("team=secret");
  await expect(page.getByRole("textbox", { name: "헤더 값" })).toHaveValue("secret-token");

  await page.getByText("Claude Code 세부 설정").click();
  await page.getByText("Codex 세부 설정").click();
  const promptBodyToggles = page.getByRole("switch", { name: "프롬프트 본문 수집" });
  await expect(promptBodyToggles).toHaveCount(2);
  await expect(promptBodyToggles.first()).toBeChecked();
  await expect(promptBodyToggles.last()).toBeChecked();

  await expect.poll(() => {
    const current = new URL(page.url()).searchParams;
    return Object.fromEntries(Object.keys(shared).map((key) => [key, current.get(key)]));
  }).toEqual(shared);
});

test("blocks empty output and keeps beginner Git defaults", async ({ page }) => {
  await page.goto("./");

  const toolList = page.getByLabel("설치할 도구");
  const copyButton = page.getByRole("button", { name: "복사", exact: true });
  const downloadButton = page.getByRole("button", { name: "다운로드", exact: true });
  const terminalButton = page.getByRole("button", { name: "macOS 터미널 설치 명령어 복사" });
  const scriptPreview = page.getByRole("textbox", { name: "생성된 설치 스크립트" });

  await page.getByRole("button", { name: "전체 해제" }).click();
  await expect(copyButton).toBeDisabled();
  await expect(downloadButton).toBeDisabled();
  await expect(terminalButton).toBeDisabled();
  await expect(page.getByText("도구를 하나 이상 선택하세요.")).toBeVisible();

  await toolList.getByRole("checkbox", { name: /Git 사용자 정보 기본값/ }).click();
  await expect(copyButton).toBeEnabled();
  await expect(downloadButton).toBeEnabled();
  await expect(terminalButton).toBeEnabled();
  await expect(page.getByText("Git 정보가 없을 때 Claude Code / noreply@anthropic.com을 사용합니다.")).toBeVisible();
  await expect(scriptPreview).toHaveValue(/configure_git 'Claude Code' 'noreply@anthropic.com'/);
});

test("enables WSL2 by default when switching from macOS to Windows", async ({ page }) => {
  await page.goto("./?os=mac&tools=git,node,pnpm,python,uv,bun,docker,vscode,claude-desktop,claude-code,claude-extension,codex-app,codex,vercel,gh,github-auth,glab,git-config");

  const toolList = page.getByLabel("설치할 도구");
  await page.getByRole("radio", { name: "Windows" }).click();

  await expect(toolList.getByRole("checkbox", { name: /Windows WSL2/ })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "생성된 설치 스크립트" })).toHaveValue(/Install-WSL2/);
});
