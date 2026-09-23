const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE_URL = process.env.PA_TOOLKIT_BASE_URL || "http://127.0.0.1:4173";
const ARTIFACT_DIR = path.join(__dirname, "artifacts");
fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

let failures = 0;

async function withPage(name, viewport, testFn) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", msg => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!/Failed to load resource|fonts\.googleapis|fonts\.gstatic/i.test(text)) {
        consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", err => pageErrors.push(String(err)));

  try {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.locator(".brand strong").filter({hasText:"PA NotebookLM Toolkit"}).waitFor({ state:"visible", timeout:10000 });
    await testFn(page);
    if (consoleErrors.length) throw new Error("console errors: " + consoleErrors.join(" | "));
    if (pageErrors.length) throw new Error("page errors: " + pageErrors.join(" | "));
    console.log("PASS:", name);
  } catch (err) {
    failures += 1;
    const safeName = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, safeName + ".png"), fullPage: true }).catch(() => {});
    fs.writeFileSync(path.join(ARTIFACT_DIR, safeName + ".txt"), String(err && err.stack || err));
    console.error("FAIL:", name, "\n", err);
  } finally {
    await browser.close();
  }
}

async function clickStep(page, zeroBasedIndex) {
  await page.locator(`.step-link[data-goto="${zeroBasedIndex}"]`).click();
}

async function acceptance() {
  await withPage("desktop smoke and responsive width", { width: 1440, height: 1000 }, async page => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error("desktop horizontal overflow: " + overflow);
    await page.locator("#openAiJsonBtn").waitFor({ state: "visible" });
    await page.locator("#openDocumentReaderBtn").waitFor({ state: "visible" });
  });

  await withPage("tablet responsive", { width: 820, height: 1180 }, async page => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error("tablet horizontal overflow: " + overflow);
    await page.locator(".step-nav").waitFor({ state: "visible" });
    await clickStep(page, 2);
    await page.getByRole("heading", { name: "TARGET & ACTUAL" }).waitFor({ state: "visible" });
  });

  await withPage("mobile responsive", { width: 390, height: 844 }, async page => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error("mobile horizontal overflow: " + overflow);
    await clickStep(page, 6);
    await page.getByRole("heading", { name: "ตรวจความพร้อม" }).waitFor({ state: "visible" });
    await page.locator("#projectDashboardGrid").waitFor({ state: "visible" });
  });

  await withPage("owner data import requires review and remains draft", { width: 1280, height: 900 }, async page => {
    await page.locator("#openAiJsonBtn").click();
    await page.locator("#loadOwnerTestDataBtn").click();
    await page.locator("#aiJsonStatus").filter({hasText:"โหลด Owner Test Data แล้ว"}).waitFor({ state:"visible", timeout:10000 });

    // First click must auto-validate and stop at Pre-Import Review.
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiImportReview").waitFor({ state: "visible", timeout: 10000 });
    const presenterBefore = await page.locator('[name="presenterName"]').inputValue();
    if (presenterBefore) throw new Error("first Import click should not import before review");

    // Second click applies reviewed values.
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiJsonModal").waitFor({ state: "hidden" });
    const presenterAfter = await page.locator('[name="presenterName"]').inputValue();
    if (!presenterAfter.includes("นพรุจ")) throw new Error("owner fixture was not imported");

    await clickStep(page, 6);
    const state = await page.locator("#readinessState").innerText();
    if (!state.includes("DRAFT")) throw new Error("owner fixture must remain DRAFT");
    const verified = await page.locator("#integritySummary .integrity-card").first().innerText();
    if (!verified.includes("0/3")) throw new Error("owner fixture must have 0/3 verified ACTUAL");
  });

  await withPage("invalid JSON Import is not silent", { width: 1280, height: 900 }, async page => {
    await page.locator("#openAiJsonBtn").click();
    await page.locator("#aiJsonInput").fill("{ invalid json");
    await page.locator("#importAiJsonBtn").click();
    const status = await page.locator("#aiJsonStatus").innerText();
    if (!/ไม่ถูกต้อง|ผิด/i.test(status)) throw new Error("invalid JSON error status not shown");
    await page.locator(".toast.error").waitFor({ state: "visible", timeout: 5000 });
  });

  await withPage("Source Picker TXT workflow", { width: 1280, height: 900 }, async page => {
    await page.locator("#openAiJsonBtn").click();
    await page.locator("#loadOwnerTestDataBtn").click();
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiImportReview").waitFor({ state: "visible" });
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiJsonModal").waitFor({ state: "hidden" });

    await clickStep(page, 2);
    const firstCard = page.locator(".indicator-card").first();
    const sourceButton = firstCard.locator("[data-pick-source-file]");

    const chooserPromise = page.waitForEvent("filechooser");
    await sourceButton.click();
    const chooser = await chooserPromise;
    await chooser.setFiles(path.join(__dirname, "fixtures", "source-sample.txt"));

    await page.locator("#extractDocumentsBtn").click();
    await page.locator(".document-item").first().waitFor({ state: "visible", timeout: 10000 });
    await page.locator(".use-as-source-btn").first().click();

    const sourceFile = await firstCard.locator('[data-field="sourceFile"]').inputValue();
    if (sourceFile !== "source-sample.txt") throw new Error("source file was not assigned to indicator");
    const verification = await firstCard.locator('[data-field="verification"]').inputValue();
    if (verification !== "unverified") throw new Error("choosing source must not auto-verify evidence");
  });

  await withPage("localStorage persists project form", { width: 1280, height: 900 }, async page => {
    const field = page.locator('[name="presenterName"]');
    await field.fill("ผู้ทดสอบ Persistence");
    await field.dispatchEvent("input");
    await page.waitForTimeout(150);
    await page.reload({ waitUntil: "domcontentloaded" });
    const value = await page.locator('[name="presenterName"]').inputValue();
    if (value !== "ผู้ทดสอบ Persistence") throw new Error("localStorage persistence failed");
  });

  if (failures) {
    console.error("\nAcceptance failures:", failures);
    process.exit(1);
  }
  console.log("\nPhase 3.5 browser acceptance: PASS");
}

acceptance().catch(err => {
  console.error(err);
  process.exit(1);
});
