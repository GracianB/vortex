#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const HOST = "127.0.0.1";
const PORT = 4173;
const externalUrl = process.env.VORTEX_E2E_URL;
const baseUrl = externalUrl || `http://${HOST}:${PORT}`;
const artifactsDir = "artifacts/e2e";
mkdirSync(artifactsDir, { recursive: true });

let server = null;
let serverLog = "";

function stopServer() {
  if (!server?.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    server.kill("SIGTERM");
  }
}

async function waitForServer(url, timeoutMs = 45_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "not started";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
      lastError = `HTTP ${res.status}`;
    } catch (err) {
      lastError = String(err?.message || err);
    }
    await new Promise((resolve) => setTimeout(resolve, 350));
  }
  throw new Error(
    `Vórtice production preview did not become ready: ${lastError}\n${serverLog.slice(-6000)}`,
  );
}

function captureServerOutput(stream) {
  stream?.on("data", (chunk) => {
    serverLog += chunk.toString();
    if (serverLog.length > 20_000) serverLog = serverLog.slice(-20_000);
  });
}

function watchErrors(page) {
  const errors = { consoleErrors: [], pageErrors: [] };
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) =>
    errors.pageErrors.push(String(err?.message || err)),
  );
  return errors;
}

async function assertCleanPage(page, errors) {
  await page.waitForFunction(() => window.__vortex?.gl === true, null, {
    timeout: 15_000,
  });
  await page.locator('[data-testid="vortex-root"]').waitFor();
  await page.locator('canvas[data-engine="webgl"]').waitFor();

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  assert.equal(overflow, false, "page must not overflow horizontally");
  assert.deepEqual(
    errors.pageErrors,
    [],
    `page errors: ${errors.pageErrors.join("\n")}`,
  );
  assert.deepEqual(
    errors.consoleErrors,
    [],
    `console errors: ${errors.consoleErrors.join("\n")}`,
  );
}

async function waitForIntro(page) {
  await page
    .locator(".vortex-intro")
    .waitFor({ state: "detached", timeout: 5_000 });
}

async function runDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseUrl,
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto(
    `${baseUrl}/?mode=orbit&palette=solar&bg=abyss&count=9200&force=1.35&trail=0.91`,
    { waitUntil: "domcontentloaded" },
  );
  await assertCleanPage(page, errors);
  await waitForIntro(page);

  assert.equal(
    await page.locator('[data-testid="instrument-panel"]').count(),
    0,
    "V6 should open canvas-first, without the settings panel",
  );
  await page.getByRole("navigation", { name: "Movimientos de Vórtice" }).waitFor();

  assert.deepEqual(
    await page.evaluate(() => ({
      mode: window.__vortex?.mode(),
      palette: window.__vortex?.palette(),
      bg: window.__vortex?.bg(),
      count: window.__vortex?.count(),
      force: window.__vortex?.force(),
      trail: window.__vortex?.trail(),
    })),
    {
      mode: "orbit",
      palette: "solar",
      bg: "abyss",
      count: 9200,
      force: 1.35,
      trail: 0.91,
    },
  );

  await page.keyboard.press("Digit4");
  await page.waitForFunction(() => window.__vortex?.mode() === "wave");
  await page.locator('[data-testid="mode-flow"]').click();
  await page.waitForFunction(() => window.__vortex?.mode() === "flow");

  await page.locator('[data-testid="instrument-toggle"]').click();
  await page.locator('[data-testid="instrument-panel"]').waitFor();
  await page.locator('[data-testid="scene-solar-v6"]').click();
  await page.waitForFunction(
    () =>
      window.__vortex?.mode() === "orbit" &&
      window.__vortex?.palette() === "solar",
  );

  await page.getByRole("button", { name: "Cerrar instrumento" }).click();
  await page.locator('[data-testid="instrument-panel"]').waitFor({
    state: "detached",
  });

  await page.locator('[data-testid="mode-flow"]').click();
  await page.waitForFunction(() => window.__vortex?.mode() === "flow");

  await page.keyboard.press("KeyH");
  await page.locator('[data-testid="chrome-toggle"]').waitFor();
  assert.equal(await page.locator('[data-testid="btn-share"]').count(), 0);
  await page.keyboard.press("KeyH");
  await page.locator('[data-testid="btn-share"]').waitFor();

  await page.locator('[data-testid="btn-share"]').click();
  await page.waitForTimeout(150);
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  const sharedUrl = new URL(shared);
  assert.equal(sharedUrl.searchParams.get("mode"), "flow");
  assert.equal(sharedUrl.searchParams.get("palette"), "solar");
  assert.equal(sharedUrl.searchParams.get("count"), "9800");
  assert.equal(sharedUrl.searchParams.has("embed"), false);
  await page.getByRole("status").waitFor({ state: "detached", timeout: 2_500 });

  await page.screenshot({
    path: `${artifactsDir}/v6-desktop-canvas.png`,
    fullPage: false,
  });

  await page.locator('[data-testid="instrument-toggle"]').click();
  await page.screenshot({
    path: `${artifactsDir}/v6-desktop-instrument.png`,
    fullPage: false,
  });

  await context.close();
}

async function runMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await assertCleanPage(page, errors);
  await waitForIntro(page);

  assert.equal(
    await page.locator('[data-testid="instrument-panel"]').count(),
    0,
    "mobile must also start canvas-first",
  );

  await page.locator('[data-testid="instrument-toggle"]').click();
  await page.locator('[data-testid="instrument-panel"]').waitFor();
  await page.locator('[data-testid="btn-clear"]').waitFor();
  await page.locator('[data-testid="scene-aurora-v6"]').click();
  await page.waitForFunction(
    () =>
      window.__vortex?.mode() === "flow" &&
      window.__vortex?.palette() === "aurora",
  );
  await page.waitForTimeout(1_650);

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  );
  assert.equal(overflow, false, "mobile instrument must not create overflow");

  await page.screenshot({
    path: `${artifactsDir}/v6-mobile-instrument.png`,
    fullPage: false,
  });

  await page.getByRole("button", { name: "Cerrar instrumento" }).click();
  await page.screenshot({
    path: `${artifactsDir}/v6-mobile-canvas.png`,
    fullPage: false,
  });

  await context.close();
}

async function runNarrowMobile(browser) {
  const context = await browser.newContext({
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await assertCleanPage(page, errors);
  await waitForIntro(page);

  const clipped = await page.evaluate(() => {
    const interactive = [...document.querySelectorAll("button, a, input")];
    return interactive.some((node) => {
      const rect = node.getBoundingClientRect();
      return rect.right > window.innerWidth + 1 || rect.left < -1;
    });
  });
  assert.equal(clipped, false, "interactive chrome must stay inside 320px");

  await page.locator('[data-testid="instrument-toggle"]').click();
  await page.locator('[data-testid="instrument-panel"]').waitFor();

  const panelFits = await page
    .locator('[data-testid="instrument-panel"]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= -1 && rect.right <= window.innerWidth + 1;
    });
  assert.equal(panelFits, true, "320px instrument must remain within viewport");

  await page.screenshot({
    path: `${artifactsDir}/v6-mobile-320.png`,
    fullPage: false,
  });
  await context.close();
}

async function runEmbed(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto(
    `${baseUrl}/?embed=1&mode=wave&palette=ember&bg=custom&color=220b08&count=6400`,
    { waitUntil: "domcontentloaded" },
  );
  await assertCleanPage(page, errors);

  assert.equal(await page.locator('[data-ui="chrome"]').count(), 0);
  assert.equal(await page.locator(".vortex-intro").count(), 0);
  assert.deepEqual(
    await page.evaluate(() => ({
      mode: window.__vortex?.mode(),
      palette: window.__vortex?.palette(),
      bg: window.__vortex?.bg(),
      count: window.__vortex?.count(),
    })),
    { mode: "wave", palette: "ember", bg: "custom", count: 6400 },
  );
  await context.close();
}

async function runReducedMotion(browser) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = watchErrors(page);

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await assertCleanPage(page, errors);
  await page.waitForTimeout(700);
  assert.equal(
    await page.locator(".vortex-intro").count(),
    0,
    "reduced-motion intro should clear quickly",
  );
  await context.close();
}

async function main() {
  if (!externalUrl) {
    server = spawn(
      process.execPath,
      [
        "node_modules/vite/bin/vite.js",
        "preview",
        "--host",
        HOST,
        "--port",
        String(PORT),
        "--strictPort",
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: "development" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    captureServerOutput(server.stdout);
    captureServerOutput(server.stderr);
    await waitForServer(baseUrl);
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  } catch (err) {
    throw new Error(
      `Chromium is unavailable. Run "npx playwright install chromium". Original error: ${String(
        err?.message || err,
      )}`,
    );
  }

  try {
    await runDesktop(browser);
    await runMobile(browser);
    await runNarrowMobile(browser);
    await runEmbed(browser);
    await runReducedMotion(browser);
    console.log("VÓRTICE V6 BROWSER E2E PASS");
  } finally {
    await browser.close();
  }
}

try {
  await main();
} catch (err) {
  console.error("VÓRTICE V6 BROWSER E2E FAIL");
  console.error(err);
  if (serverLog) console.error(serverLog.slice(-6000));
  process.exitCode = 1;
} finally {
  stopServer();
}
