// Drives the real app with playwright-core (system Chromium) to capture screenshots
// of the Home card, the runner mid-conditioning timer, and the meditation block.
// Run with: node e2e/shots.mjs
import { chromium } from "playwright-core";

const EXEC = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const BASE = process.env.BASE_URL || "http://localhost:3737";
const OUT =
  "/tmp/claude-0/-home-user-crossfit-programming/5db30644-ee3b-5e04-b9e5-c65707861275/scratchpad/shots";

const errors = [];

const browser = await chromium.launch({ executablePath: EXEC, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 430, height: 932 } });
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(String(e)));

// (a) Home card
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="start"]');
await page.screenshot({ path: `${OUT}/01-home.png` });
console.log("home title:", await page.locator("h2").first().textContent());
console.log("engine note:", await page.locator('[data-testid="engine-note"]').textContent());

// START → runner
await page.click('[data-testid="start"]');
await page.waitForURL("**/runner");
await page.waitForSelector("h1");
console.log("runner first block:", await page.locator("h1").first().textContent());

// Walk to the conditioning block. Click "Next" until a timer appears (or cap).
let foundTimer = false;
for (let i = 0; i < 8; i++) {
  if (await page.locator('[data-testid="timer-clock"]').count()) {
    foundTimer = true;
    break;
  }
  const next = page.locator('button:has-text("Next")').first();
  if (await next.count()) {
    await next.click();
    await page.waitForTimeout(200);
  } else {
    break;
  }
}

if (foundTimer) {
  // (b) Runner mid-conditioning: press Go, let the clock run a couple seconds.
  await page.locator('button:has-text("Go")').first().click();
  await page.waitForTimeout(5500);
  await page.screenshot({ path: `${OUT}/02-conditioning.png` });
  console.log("timer phase:", await page.locator('[data-testid="timer-phase"]').textContent());
  console.log("timer clock:", await page.locator('[data-testid="timer-clock"]').textContent());
  // Stop to advance.
  await page.locator('button:has-text("Stop")').first().click();
  await page.waitForTimeout(300);
} else {
  console.log("WARN: did not reach a conditioning timer");
}

// Walk on to the meditation block.
let foundMed = false;
for (let i = 0; i < 8; i++) {
  if (await page.locator('[data-testid="breathing-orb"]').count()) {
    foundMed = true;
    break;
  }
  const next = page.locator('button:has-text("Next")').first();
  if (await next.count()) {
    await next.click();
    await page.waitForTimeout(200);
  } else {
    break;
  }
}

if (foundMed) {
  await page.locator('button:has-text("Begin")').first().click();
  await page.waitForTimeout(1200);
  // (c) Meditation block
  await page.screenshot({ path: `${OUT}/03-meditation.png` });
  console.log(
    "breathing orb present:",
    await page.locator('[data-testid="breathing-orb"]').count(),
  );
} else {
  console.log("WARN: did not reach the meditation block");
}

console.log("CONSOLE ERRORS:", errors.length ? JSON.stringify(errors) : "none");
await browser.close();
if (errors.length) process.exit(2);
