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

function makeBlankPdf() {
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>\nendobj\n",
    "4 0 obj\n<< /Length 0 >>\nstream\n\nendstream\nendobj\n"
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += object;
  }
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += "xref\n0 5\n";
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= 4; i += 1) {
    pdf += String(offsets[i]).padStart(10, "0") + " 00000 n \n";
  }
  pdf += "trailer\n<< /Size 5 /Root 1 0 R >>\n";
  pdf += "startxref\n" + xrefOffset + "\n%%EOF\n";
  return Buffer.from(pdf, "ascii");
}

function escapePdfText(text) {
  return String(text).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
}

function makeLongTextPdf(pageCount = 55, markerPage = 42) {
  const objects = [];
  const kids = [];
  const firstPageObject = 4;
  for (let page = 1; page <= pageCount; page += 1) {
    const pageObject = firstPageObject + (page - 1) * 2;
    const contentObject = pageObject + 1;
    kids.push(pageObject + " 0 R");
    const marker = page === markerPage ? " SPECIAL_EVIDENCE_MARKER achievement remediation" : "";
    const line = `Page ${page} annual report learning outcomes${marker}`;
    const stream = `BT /F1 12 Tf 72 720 Td (${escapePdfText(line)}) Tj ET`;
    objects[pageObject] = `${pageObject} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObject} 0 R >>\nendobj\n`;
    objects[contentObject] = `${contentObject} 0 obj\n<< /Length ${Buffer.byteLength(stream,"ascii")} >>\nstream\n${stream}\nendstream\nendobj\n`;
  }
  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${pageCount} >>\nendobj\n`;
  objects[3] = "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";

  const maxObject = firstPageObject + pageCount * 2 - 1;
  let pdf = "%PDF-1.4\n";
  const offsets = new Array(maxObject + 1).fill(0);
  for (let id = 1; id <= maxObject; id += 1) {
    if (!objects[id]) continue;
    offsets[id] = Buffer.byteLength(pdf,"ascii");
    pdf += objects[id];
  }
  const xrefOffset = Buffer.byteLength(pdf,"ascii");
  pdf += `xref\n0 ${maxObject + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let id = 1; id <= maxObject; id += 1) {
    pdf += String(offsets[id]).padStart(10,"0") + " 00000 n \n";
  }
  pdf += `trailer\n<< /Size ${maxObject + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf,"ascii");
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

  await withPage("OCR is opt-in and Tesseract stays lazy-loaded", { width: 1280, height: 900 }, async page => {
    const before = await page.evaluate(() => [...document.scripts].some(s => s.src.includes("tesseract.js@7.0.0")));
    if (before) throw new Error("Tesseract must not load before the user starts OCR");

    await page.locator("#openDocumentReaderBtn").click();
    await page.locator("#documentReaderModal").waitFor({ state:"visible" });
    await page.getByRole("heading", { name:/OCR PDF สแกน/ }).waitFor({ state:"visible" });

    const modalText = await page.locator("#documentReaderModal").innerText();
    if (!modalText.includes("OCR แบบ opt-in")) throw new Error("OCR opt-in guidance missing");
    if (!modalText.includes("language model")) throw new Error("OCR CDN/privacy disclosure missing");

    const afterOpen = await page.evaluate(() => [...document.scripts].some(s => s.src.includes("tesseract.js@7.0.0")));
    if (afterOpen) throw new Error("Opening Document Reader must not load Tesseract automatically");

    await page.locator("#closeDocumentReaderBtn").click();
  });

  await withPage("scanned PDF is detected but OCR does not auto-run", { width: 1280, height: 900 }, async page => {
    await page.locator("#openDocumentReaderBtn").click();
    await page.locator("#sourceDocumentsInput").setInputFiles({
      name:"scanned-fixture.pdf",
      mimeType:"application/pdf",
      buffer:makeBlankPdf()
    });
    await page.locator("#extractDocumentsBtn").click();

    const panel = page.locator(".document-ocr-panel").first();
    await panel.waitFor({ state:"visible", timeout:15000 });
    const panelText = await panel.innerText();
    if (!panelText.includes("มีแนวโน้มเป็น PDF สแกน")) throw new Error("blank PDF was not identified as OCR candidate");
    if (!panelText.includes("แนะนำ 1 หน้า")) throw new Error("OCR page suggestion missing");
    await panel.locator("[data-start-ocr]").waitFor({ state:"visible" });

    const loaded = await page.evaluate(() => [...document.scripts].some(s => s.src.includes("tesseract.js@7.0.0")));
    if (loaded) throw new Error("Tesseract must not load merely because a scanned PDF was detected");
  });

  await withPage("tablet responsive", { width: 820, height: 1180 }, async page => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error("tablet horizontal overflow: " + overflow);
    await page.locator(".step-nav").waitFor({ state: "visible" });
    await clickStep(page, 2);
    await page.getByRole("heading", { name: "TARGET & ACTUAL" }).waitFor({ state: "visible" });
  });

  await withPage("mobile responsive and AI modal fits viewport", { width: 390, height: 844 }, async page => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) throw new Error("mobile horizontal overflow: " + overflow);

    await page.locator("#openAiJsonBtn").click();
    await page.locator("#aiJsonModal").waitFor({ state: "visible" });
    const modalOverflow = await page.locator("#aiJsonModal .modal-card").evaluate(el => el.scrollWidth - el.clientWidth);
    if (modalOverflow > 2) throw new Error("AI modal horizontal overflow: " + modalOverflow);
    await page.locator("#closeAiJsonBtn").click();

    await clickStep(page, 6);
    await page.getByRole("heading", { name: "ตรวจความพร้อม" }).waitFor({ state: "visible" });
    await page.locator("#projectDashboardGrid").waitFor({ state: "visible" });
  });

  await withPage("long PDF chunking full-text search and relevant page action", { width: 1280, height: 900 }, async page => {
    await page.locator("#openDocumentReaderBtn").click();
    await page.locator("#sourceDocumentsInput").setInputFiles({
      name:"long-report-55-pages.pdf",
      mimeType:"application/pdf",
      buffer:makeLongTextPdf(55,42)
    });
    await page.locator("#extractDocumentsBtn").click();
    await page.locator(".document-item").first().waitFor({ state:"visible", timeout:20000 });

    const chunkStats = await page.locator("#documentChunkStats").innerText();
    if (!chunkStats.includes("55 หน้า")) throw new Error("long document page stats missing: " + chunkStats);
    if (!chunkStats.includes("chunks")) throw new Error("chunk stats missing");

    await page.locator("#documentSearchInput").fill("SPECIAL_EVIDENCE_MARKER");
    await page.locator("#documentSearchBtn").click();

    const result = page.locator(".document-search-result").first();
    await result.waitFor({ state:"visible", timeout:10000 });
    const resultText = await result.innerText();
    if (!resultText.includes("หน้า 42")) throw new Error("relevant page 42 was not ranked first: " + resultText);

    await result.locator("[data-use-search-page]").click();
    const pagesValue = await page.locator(".document-pages").first().inputValue();
    if (pagesValue !== "42") throw new Error("search page action expected pageSpec 42, got " + pagesValue);

    const tesseractLoaded = await page.evaluate(() => [...document.scripts].some(s => s.src.includes("tesseract.js@7.0.0")));
    if (tesseractLoaded) throw new Error("long-document search must not trigger OCR engine");

    // Phase 4.2: save the relevant page into Evidence Review.
    await result.locator("[data-save-search-review]").click();
    const review = page.locator(".evidence-review-card").first();
    await review.waitFor({ state:"visible" });
    const reviewText = await review.innerText();
    if (!reviewText.includes("long-report-55-pages.pdf") || !reviewText.includes("หน้า 42")) {
      throw new Error("Evidence Review did not preserve source file/page: " + reviewText);
    }

    await review.locator("[data-review-classification]").selectOption("actual");
    await review.locator("[data-review-status]").selectOption("checked");
    await review.locator("[data-review-indicator]").selectOption({index:1});
    await review.locator("[data-review-note]").fill("ตรวจ period / population กับต้นฉบับแล้ว");

    const stats = await page.locator("#evidenceReviewStats").innerText();
    if (!stats.includes("ตรวจแล้ว 1")) throw new Error("Evidence Review checked count did not update: " + stats);

    // Handoff must populate Source but remain UNVERIFIED.
    await review.locator("[data-review-promote]").click();
    await page.locator("#documentReaderModal").waitFor({ state:"hidden" });
    const firstIndicator = page.locator(".indicator-card").first();
    const sourceFile = await firstIndicator.locator('[data-field="sourceFile"]').inputValue();
    const sourcePage = await firstIndicator.locator('[data-field="sourcePage"]').inputValue();
    const verification = await firstIndicator.locator('[data-field="verification"]').inputValue();
    if (sourceFile !== "long-report-55-pages.pdf") throw new Error("Evidence Trace sourceFile handoff failed: " + sourceFile);
    if (sourcePage !== "หน้า 42") throw new Error("Evidence Trace sourcePage handoff failed: " + sourcePage);
    if (verification !== "unverified") throw new Error("Evidence Review handoff must remain UNVERIFIED");

    await page.reload({waitUntil:"domcontentloaded"});
    await page.locator("#openDocumentReaderBtn").click();
    await page.locator(".evidence-review-card").first().waitFor({state:"visible"});
    const persistedReview = await page.locator(".evidence-review-card").first().innerText();
    if (!persistedReview.includes("long-report-55-pages.pdf")) throw new Error("Evidence Review note did not persist across reload");
    if (!persistedReview.includes("Source ยังไม่โหลดใน session")) throw new Error("review should disclose missing raw source after reload");
  });

  await withPage("Step 2 multiline fields and Step 3 TARGET helper", { width: 1280, height: 900 }, async page => {
    await clickStep(page, 1);

    const modelEditor = page.locator('[data-smart-field="managementModel"] .rich-editor');
    await modelEditor.fill("READ Model\nReview Data → Act → Discuss");
    const modelValue = await page.locator('textarea[name="managementModel"]').inputValue();
    if (!modelValue.includes("\n")) throw new Error("managementModel did not preserve multiline content");

    await page.locator('.quick-pick[data-fill-target="baselineSource"][data-fill-value*="SAR"]').click();
    await page.locator('.quick-pick[data-fill-target="baselineSource"][data-fill-value*="ผลสัมฤทธิ์"]').click();
    const baselineValue = await page.locator('textarea[name="baselineSource"]').inputValue();
    if (!baselineValue.includes("\n")) throw new Error("baselineSource did not append multiple lines");

    await clickStep(page, 2);
    const firstCard = page.locator(".indicator-card").first();
    const target = firstCard.locator('[data-field="target"]');
    await target.fill("70");
    await firstCard.locator('[data-target-prefix="≥"]').click();
    await firstCard.locator('[data-target-suffix="%"]').click();
    const targetValue = await target.inputValue();
    if (targetValue !== "≥70%") throw new Error("TARGET helper expected ≥70%, got " + targetValue);
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
    await page.locator("#aiJsonStatus").filter({hasText:"โหลด Owner Test Data แล้ว"}).waitFor({ state:"visible", timeout:10000 });
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiImportReview").waitFor({ state: "visible" });
    await page.locator("#importAiJsonBtn").click();
    await page.locator("#aiJsonModal").waitFor({ state: "hidden" });

    // Load a real local fixture through Document Reader first.
    await page.locator("#openDocumentReaderBtn").click();
    await page.locator("#documentReaderModal").waitFor({ state: "visible" });
    await page.locator("#sourceDocumentsInput").setInputFiles(path.join(__dirname, "fixtures", "source-sample.txt"));
    await page.locator("#extractDocumentsBtn").click();
    await page.locator(".document-item").first().waitFor({ state: "visible", timeout: 10000 });
    await page.locator("#closeDocumentReaderBtn").click();
    await page.locator("#documentReaderModal").waitFor({ state: "hidden" });

    // Assign the already-read document from STEP 3 without typing the filename.
    await clickStep(page, 2);
    const firstCard = page.locator(".indicator-card").first();
    await firstCard.locator(".indicator-trace summary").click();
    await firstCard.locator("[data-pick-source-file]").waitFor({ state: "visible" });
    await firstCard.locator("[data-source-doc-select]").selectOption("source-sample.txt");

    const sourceFile = await page.locator(".indicator-card").first().locator('[data-field="sourceFile"]').inputValue();
    if (sourceFile !== "source-sample.txt") throw new Error("source file was not assigned to indicator");
    const verification = await page.locator(".indicator-card").first().locator('[data-field="verification"]').inputValue();
    if (verification !== "unverified") throw new Error("choosing source must not auto-verify evidence");
  });

  await withPage("Step 6 visual preview and naming plan", { width: 1280, height: 900 }, async page => {
    await clickStep(page, 5);

    await page.locator("#visualNamingPlanInput").setInputFiles(path.join(__dirname, "fixtures", "visual-plan.json"));
    await page.locator("#visualNamingPlanStatus").filter({hasText:"E2E Visual Plan"}).waitFor({ state:"visible", timeout:10000 });

    await page.locator("#evidenceFiles").setInputFiles(path.join(__dirname, "fixtures", "visual-sample.svg"));
    const card = page.locator(".visual-file-card").first();
    await card.waitFor({ state:"visible", timeout:10000 });

    await card.locator(".visual-preview img").waitFor({ state:"visible" });
    const canonical = await card.locator("[data-visual-canonical]").inputValue();
    if (canonical !== "10_test_visual.svg") throw new Error("unexpected canonical visual name: " + canonical);

    const evidenceType = await card.locator("[data-visual-evidence]").inputValue();
    if (evidenceType !== "ภาพกิจกรรมจริง") throw new Error("visual evidence type did not follow naming plan");

    const summary = await page.locator("#visualFileSummary").innerText();
    if (!summary.includes("1")) throw new Error("visual summary did not update");
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
  console.log("\nPhase 4.2 browser acceptance: PASS");
}

acceptance().catch(err => {
  console.error(err);
  process.exit(1);
});
