(() => {
  "use strict";

  const R = window.PAToolkitReliability;
  const M = window.PAToolkitMigrations;
  const DA = window.PAToolkitDocumentAudit;
  const VE = window.PAToolkitVisualEvidence;
  const OCR = window.PAToolkitOCR;
  const DI = window.PAToolkitDocumentIntelligence;
  const ER = window.PAToolkitEvidenceReview;
  if (!R || !M || !DA || !VE || !OCR || !DI || !ER) throw new Error("Toolkit core modules failed to load");

  const STORAGE_KEY = "pa-notebooklm-toolkit-v1";
  const EVIDENCE_OPTIONS = [
    "ภาพผู้รับการประเมิน",
    "ภาพสถานศึกษา/หน่วยงาน",
    "Model / Framework",
    "ภาพกิจกรรมจริง",
    "ห้องเรียน / งานปฏิบัติจริง",
    "PLC / Reflection",
    "การนิเทศ / สังเกต",
    "การซ่อมเสริม / ช่วยเหลือ",
    "Screenshot ระบบ",
    "กราฟผล ACTUAL",
    "Student / Service Journey",
    "รางวัล / การยอมรับ",
    "การขยายผล"
  ];

  const AI_SCHEMA_VERSION = M.INTAKE_SCHEMA;

  const ACTUAL_MODES = [
    ["pending", "ยังไม่มี / PENDING"],
    ["fraction", "จำนวน / ทั้งหมด"],
    ["percent", "ร้อยละ (%)"],
    ["score", "คะแนน / ค่า"],
    ["text", "ข้อความผลจริง"]
  ];

  const SMART_LIST_FIELDS = new Set(["baselineSource","contextNotes","processNotes","systems"]);

  const DOCUMENT_ROLES = [
    ["pa_agreement", "PA Agreement / ข้อตกลง"],
    ["performance_report", "Performance Report / รายงานผล"],
    ["sar_context", "SAR / CONTEXT"],
    ["assessment_result", "Assessment Result / ผลประเมิน"],
    ["policy", "Policy / นโยบาย"],
    ["award", "Award / Recognition"],
    ["evidence", "Evidence / หลักฐานประกอบ"],
    ["other", "Other / อื่น ๆ"]
  ];

  const REVIEW_FIELD_LABELS = {
    presenterName:"ชื่อ-นามสกุล",
    position:"ตำแหน่ง",
    academicRank:"วิทยฐานะ",
    organization:"สถานศึกษา/หน่วยงาน",
    affiliation:"สังกัด",
    paCycle:"รอบ PA",
    evaluationPeriod:"ช่วงผลการปฏิบัติงาน",
    duration:"เวลานำเสนอ",
    challengeTitle:"ประเด็นท้าทาย",
    managementModel:"Model / แนวทาง",
    baselineSource:"แหล่งข้อมูลตั้งต้น",
    developmentNeed:"ปัญหา/ความต้องการจำเป็น",
    contextNotes:"ข้อมูลบริบท",
    processNotes:"กระบวนการ",
    learnerOutcome:"ผลต่อผู้เรียน",
    staffOutcome:"ผลต่อครู/บุคลากร",
    workOutcome:"ผลต่อห้องเรียน/งาน",
    organizationOutcome:"ผลต่อสถานศึกษา",
    journeyBefore:"Journey ก่อนพัฒนา",
    journeyAction:"Journey การดำเนินการ",
    journeyAfter:"Journey หลังพัฒนา",
    journeyEvidence:"หลักฐาน Journey",
    systems:"ระบบ/นวัตกรรม",
    participationStaff:"การมีส่วนร่วมครู",
    participationLearners:"การมีส่วนร่วมผู้เรียน",
    participationParents:"ผู้ปกครอง/ชุมชน",
    participationNetwork:"เครือข่าย",
    recognition:"รางวัล/การยอมรับ",
    recognitionEvidence:"หลักฐานรางวัล",
    expansionLevel:"ระดับการขยายผล",
    expansionEvidence:"หลักฐานการขยายผล",
    policyNotes:"Policy Alignment"
  };

  const FIELD_EXAMPLES = {
    presenterName: "นายสมชาย ใจดี",
    position: "ผู้อำนวยการสถานศึกษา",
    academicRank: "ชำนาญการพิเศษ",
    organization: "โรงเรียนตัวอย่างพัฒนา",
    affiliation: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษา ... เขต ...",
    paCycle: "1 ต.ค. 2569 – 30 ก.ย. 2570",
    evaluationPeriod: "1 เม.ย. 2570 – 30 ก.ย. 2570",
    challengeTitle: "การพัฒนาทักษะการอ่านเพื่อความเข้าใจของผู้เรียนด้วย READ Model",
    managementModel: "READ Model / PDCA / PLC / แนวทางที่สถานศึกษาพัฒนาขึ้น",
    baselineSource: "SAR 2569, ผลสัมฤทธิ์, แบบประเมินก่อนเรียน, ข้อมูล PLC",
    developmentNeed: "ผู้เรียนบางส่วนยังไม่ผ่านเกณฑ์การอ่านจับใจความ และครูยังใช้ข้อมูลรายบุคคลเพื่อปรับการสอนไม่ต่อเนื่อง",
    contextNotes: "ผลประเมินก่อนพัฒนา 62% ผ่านเกณฑ์\nพบจุดอ่อนด้านการสรุปใจความและการอธิบายเหตุผล",
    processNotes: "วิเคราะห์ข้อมูลรายบุคคล\nกำหนดเป้าหมาย\nออกแบบกิจกรรม\nPLC สะท้อนผล\nปรับแผนและประเมินซ้ำ",
    learnerOutcome: "ผู้เรียนอธิบายใจความสำคัญและใช้หลักฐานจากบทอ่านได้ชัดขึ้น",
    staffOutcome: "ครูใช้ข้อมูลผู้เรียนวางแผนซ่อมเสริมและสะท้อนผลใน PLC ได้เป็นระบบขึ้น",
    workOutcome: "เกิดวงจรติดตามผลก่อน–หลังในห้องเรียน",
    organizationOutcome: "สถานศึกษามีข้อมูลภาพรวมเพื่อกำกับติดตามและวางแผนรอบต่อไป",
    journeyBefore: "นักเรียน A ได้ 8/20 และยังสรุปใจความสำคัญไม่ได้",
    journeyAction: "ใช้บทอ่านสั้น + graphic organizer + feedback รายกลุ่ม",
    journeyAfter: "นักเรียน A ได้ 14/20 และอธิบายใจความพร้อมเหตุผลได้",
    journeyEvidence: "แบบประเมินก่อน–หลังและชิ้นงานที่ปกปิดชื่อ",
    systems: "Reading Tracker — ติดตามข้อมูลรายบุคคล\nPLC Reflection — ใช้หลักฐานเพื่อปรับการสอน",
    participationStaff: "ครูร่วมวิเคราะห์ข้อมูล ออกแบบกิจกรรม และสะท้อนผลทุก 2 สัปดาห์",
    participationLearners: "นักเรียนทำภาระงานและสะท้อนผลการเรียนรู้",
    participationParents: "ผู้ปกครองช่วยติดตามการอ่านที่บ้านตามแบบบันทึก",
    participationNetwork: "นำเสนอแนวทางในเครือข่ายโรงเรียน / PENDING หากยังไม่มีหลักฐาน",
    recognition: "รางวัล/การยอมรับที่เกี่ยวข้องโดยตรงกับงานรอบนี้ หรือเว้นว่างถ้าไม่ใช้",
    recognitionEvidence: "เกียรติบัตร/ประกาศ/หนังสือรับรอง ลงวันที่ ...",
    expansionLevel: "ภายในสถานศึกษา / เครือข่าย / เขตพื้นที่ ตามหลักฐานจริง",
    expansionEvidence: "บันทึกประชุม หนังสือเชิญ ภาพกิจกรรม หรือรายงานที่ยืนยันการขยายผล",
    policyNotes: "ชื่อ/เลขที่นโยบายจากเอกสารทางการ; ถ้ายังไม่ตรวจให้ใช้ PENDING"
  };

  const form = document.getElementById("wizardForm");
  const panels = [...document.querySelectorAll(".step-panel")];
  const stepLinks = [...document.querySelectorAll(".step-link")];
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const progressBar = document.getElementById("progressBar");
  const stepLabel = document.getElementById("stepLabel");
  const saveState = document.getElementById("saveState");
  const indicatorCards = document.getElementById("indicatorCards");
  const evidenceChecks = document.getElementById("evidenceChecks");
  const evidenceFiles = document.getElementById("evidenceFiles");
  const selectedFileList = document.getElementById("selectedFileList");
  const visualFileSummary = document.getElementById("visualFileSummary");
  const visualNamingPlanStatus = document.getElementById("visualNamingPlanStatus");
  const visualNamingPlanInput = document.getElementById("visualNamingPlanInput");
  const documentReaderModal = document.getElementById("documentReaderModal");
  const sourceDocumentsInput = document.getElementById("sourceDocumentsInput");
  const documentReaderStatus = document.getElementById("documentReaderStatus");
  const documentList = document.getElementById("documentList");
  const documentStats = document.getElementById("documentStats");
  const documentChunkStats = document.getElementById("documentChunkStats");
  const documentSearchInput = document.getElementById("documentSearchInput");
  const documentSearchScope = document.getElementById("documentSearchScope");
  const documentSearchStatus = document.getElementById("documentSearchStatus");
  const documentSearchResults = document.getElementById("documentSearchResults");
  const documentSearchSuggestions = document.getElementById("documentSearchSuggestions");
  const evidenceReviewStats = document.getElementById("evidenceReviewStats");
  const evidenceReviewList = document.getElementById("evidenceReviewList");
  const documentTextPreview = document.getElementById("documentTextPreview");
  const aiJsonModal = document.getElementById("aiJsonModal");
  const aiPromptPreview = document.getElementById("aiPromptPreview");
  const aiJsonInput = document.getElementById("aiJsonInput");
  const aiJsonStatus = document.getElementById("aiJsonStatus");
  const importAiJsonBtn = document.getElementById("importAiJsonBtn");
  const toastStack = document.getElementById("toastStack");
  const readinessIndicatorList = document.getElementById("readinessIndicatorList");
  const projectDashboardGrid = document.getElementById("projectDashboardGrid");
  const sourceAuditSummary = document.getElementById("sourceAuditSummary");
  const sourceAuditList = document.getElementById("sourceAuditList");
  const documentAuditMini = document.getElementById("documentAuditMini");
  const aiImportReview = document.getElementById("aiImportReview");
  const aiImportReviewRows = document.getElementById("aiImportReviewRows");
  const aiConflictBadge = document.getElementById("aiConflictBadge");
  let validatedAiJson = null;
  let importReviewDecisions = {};
  let lastConflictCount = 0;

  let currentStep = 0;
  let indicators = [];
  let selectedFileNames = [];
  let visualNamingPlan = VE.defaultPlan();
  let visualAssets = [];
  const visualAssetFiles = new Map();
  const visualPreviewUrls = new Map();
  let generatedCache = [];
  let activePreviewIndex = 0;
  let pendingSourceFiles = [];
  let extractedDocuments = [];
  let documentChunks = [];
  let documentSearchPageResults = [];
  let evidenceReviewNotes = [];
  const documentFiles = new Map();
  let activeOcrJob = null;
  let externalSourceText = "";
  let sourcePickerIndicatorId = "";

  const defaultIndicators = () => [1,2,3].map(() => R.normalizeIndicator({
    id: cryptoId(),
    verification: "unverified"
  }));

  function cryptoId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function lines(value) {
    return String(value || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  }

  function value(name) {
    const el = form.elements[name];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    return String(el.value || "").trim();
  }

  function safe(value, fallback = "PENDING") {
    const v = String(value || "").trim();
    return v || fallback;
  }

  function esc(text) {
    return String(text ?? "")
      .replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function slugName(name) {
    const base = String(name || "pa-project").trim().replace(/\s+/g,"-");
    return base.replace(/[^\p{L}\p{N}\-_]+/gu,"").toLowerCase() || "pa-project";
  }

  function notify(message, type = "info", duration = 5200) {
    if (!toastStack) return;
    const icons = {success:"✓", error:"!", warn:"!", info:"i"};
    const toast = document.createElement("div");
    toast.className = "toast " + (icons[type] ? type : "info");
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || "i"}</div>
      <div class="toast-message">${esc(message)}</div>
      <button type="button" class="toast-close" aria-label="ปิดการแจ้งเตือน">×</button>`;
    toast.querySelector(".toast-close").addEventListener("click", () => toast.remove());
    toastStack.appendChild(toast);
    if (duration > 0) window.setTimeout(() => toast.remove(), duration);
  }

  function smartEditorWords(text) {
    const value = String(text || "").trim();
    if (!value) return 0;
    try {
      if (Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("th", {granularity:"word"});
        return [...segmenter.segment(value)].filter(x => x.isWordLike).length;
      }
    } catch {}
    return value.split(/\s+/).filter(Boolean).length;
  }

  function syncRichEditor(shell) {
    const name = shell.dataset.smartField;
    const field = form.elements[name];
    const editor = shell.querySelector(".rich-editor");
    if (!field || !editor) return;
    const text = editor.innerText.replace(/\u00a0/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    field.value = text;
    const counter = shell.querySelector(".rich-editor-counter");
    if (counter) counter.textContent = `${smartEditorWords(text)} คำ · ${text.length} ตัวอักษร`;
    field.dispatchEvent(new Event("input", {bubbles:true}));
  }

  function renderSmartList(shell, sourceLines) {
    const name = shell.dataset.smartField;
    const field = form.elements[name];
    let items = Array.isArray(sourceLines) ? sourceLines : lines(field?.value);
    if (!items.length) items = [""];
    const itemsWrap = shell.querySelector(".smart-list-items");
    itemsWrap.innerHTML = items.map((text,index) => `
      <div class="smart-list-row">
        <span class="smart-list-num">${index + 1}</span>
        <div class="smart-list-input" contenteditable="true" role="textbox" data-list-index="${index}" data-placeholder="พิมพ์รายการที่ ${index + 1}">${esc(text)}</div>
        <button type="button" class="smart-list-remove" title="ลบรายการ">ลบ</button>
      </div>`).join("");
    const count = shell.querySelector(".smart-list-count");
    if (count) count.textContent = `${items.filter(Boolean).length} รายการ`;
  }

  function syncSmartList(shell) {
    const name = shell.dataset.smartField;
    const field = form.elements[name];
    if (!field) return;
    const values = [...shell.querySelectorAll(".smart-list-input")]
      .map(el => el.innerText.replace(/\u00a0/g," ").trim())
      .filter(Boolean);
    field.value = values.join("\n");
    const count = shell.querySelector(".smart-list-count");
    if (count) count.textContent = `${values.length} รายการ`;
    field.dispatchEvent(new Event("input", {bubbles:true}));
  }

  function initSmartEditors() {
    [...form.querySelectorAll("textarea[name]")].forEach(field => {
      const name = field.name;
      if (field.dataset.smartInitialized === "1") return;
      field.dataset.smartInitialized = "1";
      field.classList.add("smart-hidden-field");

      if (SMART_LIST_FIELDS.has(name)) {
        const shell = document.createElement("div");
        shell.className = "smart-list-shell";
        shell.dataset.smartField = name;
        shell.innerHTML = `
          <div class="smart-list-items"></div>
          <div class="smart-list-toolbar">
            <button type="button" class="smart-list-add">+ เพิ่มรายการ</button>
            <span class="smart-list-count">0 รายการ</span>
          </div>`;
        field.insertAdjacentElement("afterend", shell);
        renderSmartList(shell, lines(field.value));

        shell.addEventListener("input", e => {
          if (e.target.closest(".smart-list-input")) syncSmartList(shell);
        });
        shell.addEventListener("keydown", e => {
          const input = e.target.closest(".smart-list-input");
          if (!input || e.key !== "Enter" || e.shiftKey) return;
          e.preventDefault();
          syncSmartList(shell);
          const values = lines(field.value);
          const index = Number(input.dataset.listIndex);
          values.splice(index + 1, 0, "");
          renderSmartList(shell, values);
          const next = shell.querySelector(`[data-list-index="${index + 1}"]`);
          next?.focus();
        });
        shell.addEventListener("click", e => {
          if (e.target.closest(".smart-list-add")) {
            const values = [...shell.querySelectorAll(".smart-list-input")].map(el => el.innerText.trim());
            values.push("");
            renderSmartList(shell, values);
            shell.querySelector(".smart-list-input:last-of-type")?.focus();
            return;
          }
          const remove = e.target.closest(".smart-list-remove");
          if (remove) {
            const row = remove.closest(".smart-list-row");
            row?.remove();
            const values = [...shell.querySelectorAll(".smart-list-input")].map(el => el.innerText.trim());
            renderSmartList(shell, values.length ? values : [""]);
            syncSmartList(shell);
          }
        });
      } else {
        const shell = document.createElement("div");
        shell.className = "rich-editor-shell";
        shell.dataset.smartField = name;
        const placeholder = field.getAttribute("placeholder") || "พิมพ์ข้อมูลที่นี่";
        shell.innerHTML = `
          <div class="rich-editor" contenteditable="true" role="textbox" aria-multiline="true" data-placeholder="${esc(placeholder)}"></div>
          <div class="rich-editor-footer">
            <span>Enter เพื่อขึ้นบรรทัดใหม่</span>
            <span class="rich-editor-counter">0 คำ · 0 ตัวอักษร</span>
          </div>`;
        field.insertAdjacentElement("afterend", shell);
        const editor = shell.querySelector(".rich-editor");
        editor.innerText = field.value || "";
        const counter = shell.querySelector(".rich-editor-counter");
        counter.textContent = `${smartEditorWords(field.value)} คำ · ${String(field.value||"").length} ตัวอักษร`;
        editor.addEventListener("input", () => syncRichEditor(shell));
      }
    });
  }

  function syncSmartEditorsFromFields() {
    document.querySelectorAll("[data-smart-field]").forEach(shell => {
      const name = shell.dataset.smartField;
      const field = form.elements[name];
      if (!field) return;
      if (shell.classList.contains("smart-list-shell")) {
        renderSmartList(shell, lines(field.value));
      } else {
        const editor = shell.querySelector(".rich-editor");
        if (editor && editor.innerText !== field.value) editor.innerText = field.value || "";
        const counter = shell.querySelector(".rich-editor-counter");
        if (counter) counter.textContent = `${smartEditorWords(field.value)} คำ · ${String(field.value||"").length} ตัวอักษร`;
      }
    });
  }

  let storageWarningShown = false;

  function setRuntimeHealth(message, state = "ok") {
    const el = document.getElementById("runtimeHealth");
    if (!el) return;
    el.textContent = message;
    el.dataset.state = state;
  }

  window.addEventListener("error", event => {
    setRuntimeHealth("พบข้อผิดพลาดในหน้าเว็บ · ลองรีเฟรชหรือ Export Project ก่อนดำเนินการต่อ", "error");
    notify("พบข้อผิดพลาดในหน้าเว็บ ระบบเก็บรายละเอียดไว้ใน Browser console กรุณา Export Project ก่อนรีเฟรชหากยังทำได้", "error", 9000);
  });

  window.addEventListener("unhandledrejection", () => {
    setRuntimeHealth("พบข้อผิดพลาดจากงานเบื้องหลัง · กรุณาตรวจข้อมูลก่อนทำต่อ", "error");
    notify("งานเบื้องหลังบางส่วนทำงานไม่สำเร็จ กรุณาตรวจข้อมูลและลองอีกครั้ง", "error", 8500);
  });

  function injectFieldExamples() {
    Object.entries(FIELD_EXAMPLES).forEach(([name, example]) => {
      const el = form.elements[name];
      if (!el || el instanceof RadioNodeList) return;
      const label = el.closest("label");
      if (!label || label.querySelector(".field-example")) return;
      const hint = document.createElement("small");
      hint.className = "field-example";
      hint.textContent = example;
      label.appendChild(hint);
    });
  }

  function formatBytes(bytes) {
    const n = Number(bytes || 0);
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  function loadScriptOnce(src, globalName) {
    if (globalName && window[globalName]) return Promise.resolve(window[globalName]);
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => s.src === src);
      if (existing) {
        existing.addEventListener("load", () => resolve(globalName ? window[globalName] : true), {once:true});
        existing.addEventListener("error", () => reject(new Error("โหลด library ไม่สำเร็จ")), {once:true});
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => resolve(globalName ? window[globalName] : true);
      script.onerror = () => reject(new Error("โหลด library ไม่สำเร็จ: " + src));
      document.head.appendChild(script);
    });
  }

  async function ensurePdfJs() {
    const lib = await loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
      "pdfjsLib"
    );
    lib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
    return lib;
  }

  async function ensureMammoth() {
    return loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js",
      "mammoth"
    );
  }

  async function ensureTesseract() {
    return loadScriptOnce(
      "https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.min.js",
      "Tesseract"
    );
  }

  async function extractPdfText(file) {
    const pdfjs = await ensurePdfJs();
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({data: bytes}).promise;
    const pageTexts = [];

    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const nativeText = content.items
        .map(item => item.str || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      pageTexts.push({
        page:pageNo,
        text:nativeText,
        nativeText,
        ocrText:"",
        extractionMode:"native",
        ocrConfidence:null
      });
    }

    const assessment = OCR.scanAssessment(pageTexts);
    const text = OCR.rebuildPdfText(pageTexts);
    const warning = assessment.hasAnyCandidate
      ? `พบ ${assessment.candidateCount}/${assessment.totalPages} หน้าที่ข้อความน้อย${assessment.likelyScanned ? " — เอกสารมีแนวโน้มเป็น PDF สแกน" : ""} · สามารถเลือก OCR ได้`
      : "";

    return {
      text,
      pages:pdf.numPages,
      pageTexts,
      warning,
      ocrSuggestedPages:assessment.candidatePages,
      ocrPageSpec:OCR.compressPages(assessment.candidatePages.slice(0,12)),
      ocrLanguage:"tha+eng",
      ocrState:"idle",
      ocrProgress:0,
      ocrStatus:"",
      ocrCompletedPages:[],
      ocrAverageConfidence:null
    };
  }

  async function extractDocxText(file) {
    const mammothLib = await ensureMammoth();
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammothLib.extractRawText({arrayBuffer});
    const text = String(result.value || "").trim();
    const warning = text ? "" : "ไม่พบข้อความใน DOCX";
    return {text, pages:null, warning};
  }

  async function extractOneDocument(file) {
    const lower = file.name.toLowerCase();
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("ไฟล์ใหญ่กว่า 25 MB");
    }
    if (lower.endsWith(".pdf") || file.type === "application/pdf") {
      return extractPdfText(file);
    }
    if (lower.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return extractDocxText(file);
    }
    if (lower.endsWith(".txt") || lower.endsWith(".md") || file.type.startsWith("text/")) {
      const text = (await file.text()).trim();
      return {text, pages:null, warning:text ? "" : "ไฟล์ไม่มีข้อความ"};
    }
    throw new Error("ยังไม่รองรับไฟล์ชนิดนี้");
  }

  function ocrStatusText(message) {
    const status = String(message?.status || "");
    const labels = {
      loading_tesseract_core:"กำลังโหลด OCR core",
      initializing_tesseract:"กำลังเริ่ม OCR",
      loading_language_traineddata:"กำลังโหลด language model",
      initializing_api:"กำลังเตรียมภาษา",
      recognizing_text:"กำลังอ่านข้อความ"
    };
    return labels[status] || status.replaceAll("_"," ") || "กำลังทำ OCR";
  }

  function updateOcrJobUi(docId, message = {}) {
    const doc = extractedDocuments.find(item => item.id === docId);
    if (!doc) return;
    const job = activeOcrJob && activeOcrJob.docId === docId ? activeOcrJob : null;
    const pageProgress = job?.totalPages
      ? ((Math.max(0,(job.currentIndex || 1) - 1) + (Number(message.progress) || 0)) / job.totalPages)
      : (Number(message.progress) || 0);
    doc.ocrProgress = Math.max(0,Math.min(1,pageProgress));
    doc.ocrStatus = job?.currentPage
      ? `หน้า ${job.currentPage}/${doc.pages} · ${ocrStatusText(message)}`
      : ocrStatusText(message);

    const card = documentList.querySelector(`[data-doc-id="${CSS.escape(docId)}"]`);
    if (!card) return;
    const bar = card.querySelector("[data-ocr-progress-bar]");
    const label = card.querySelector("[data-ocr-status]");
    if (bar) bar.style.width = (doc.ocrProgress * 100).toFixed(0) + "%";
    if (label) label.textContent = doc.ocrStatus;
  }

  async function renderPdfPageForOcr(pdf, pageNo) {
    const page = await pdf.getPage(pageNo);
    const base = page.getViewport({scale:1});
    const maxBase = Math.max(base.width,base.height) || 1;
    const scale = Math.max(1.5,Math.min(2.4,2600 / maxBase));
    const viewport = page.getViewport({scale});
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d",{alpha:false});
    context.fillStyle = "#ffffff";
    context.fillRect(0,0,canvas.width,canvas.height);
    await page.render({canvasContext:context,viewport}).promise;
    return canvas;
  }

  async function cancelOcrJob(docId) {
    if (!activeOcrJob || activeOcrJob.docId !== docId) return;
    activeOcrJob.cancelled = true;
    const doc = extractedDocuments.find(item => item.id === docId);
    if (doc) {
      doc.ocrState = "cancelling";
      doc.ocrStatus = "กำลังยกเลิก OCR...";
      renderExtractedDocuments();
    }
    try {
      if (activeOcrJob.worker) await activeOcrJob.worker.terminate();
    } catch {}
    if (doc) {
      doc.ocrState = "cancelled";
      doc.ocrStatus = "ยกเลิก OCR แล้ว";
      renderExtractedDocuments();
    }
  }

  async function runOcrForDocument(docId) {
    if (activeOcrJob) {
      notify("มี OCR กำลังทำงานอยู่ กรุณารอหรือยกเลิกงานเดิมก่อน", "warn", 6000);
      return;
    }

    const doc = extractedDocuments.find(item => item.id === docId);
    const file = documentFiles.get(docId);
    if (!doc || !file || !doc.pages || !Array.isArray(doc.pageTexts)) {
      notify("ไม่พบไฟล์ PDF จริงใน session นี้ กรุณาเลือกเอกสารใหม่ก่อนทำ OCR", "warn", 7000);
      return;
    }

    const card = documentList.querySelector(`[data-doc-id="${CSS.escape(docId)}"]`);
    const pagesInput = card?.querySelector("[data-ocr-pages]");
    const languageSelect = card?.querySelector("[data-ocr-language]");
    const pageSpec = String(pagesInput?.value || doc.ocrPageSpec || "").trim();
    if (!pageSpec) {
      notify("กรุณาระบุหน้าที่ต้องการ OCR เช่น 1-3,5 ระบบจะไม่ OCR ทั้งเอกสารโดยอัตโนมัติ", "warn", 6500);
      pagesInput?.focus();
      return;
    }
    const parsed = R.parsePageSpec(pageSpec,doc.pages);

    if (parsed.error) {
      notify("ช่วงหน้า OCR ไม่ถูกต้อง: " + parsed.error, "error", 6500);
      pagesInput?.focus();
      return;
    }

    const pages = parsed.pages;
    if (!pages.length) {
      notify("กรุณาระบุหน้าที่ต้องการ OCR เช่น 1-3,5", "warn", 5500);
      pagesInput?.focus();
      return;
    }
    if (pages.length > 12) {
      notify("เพื่อป้องกัน Browser ใช้หน่วยความจำสูง OCR ได้ครั้งละไม่เกิน 12 หน้า กรุณาแบ่งเป็นช่วง เช่น 1-12 แล้วทำรอบถัดไป", "warn", 8000);
      return;
    }

    doc.ocrPageSpec = pageSpec;
    doc.ocrLanguage = languageSelect?.value || doc.ocrLanguage || "tha+eng";

    const job = {
      docId,
      worker:null,
      cancelled:false,
      currentPage:null,
      currentIndex:0,
      totalPages:pages.length
    };
    activeOcrJob = job;
    doc.ocrState = "loading";
    doc.ocrProgress = 0;
    doc.ocrStatus = "กำลังโหลด OCR engine / language model...";
    renderExtractedDocuments();

    try {
      const [pdfjs,TesseractLib] = await Promise.all([ensurePdfJs(),ensureTesseract()]);
      if (job.cancelled) return;

      const bytes = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({data:bytes}).promise;
      const languages = OCR.normalizeLanguages(doc.ocrLanguage);

      const worker = await TesseractLib.createWorker(languages,1,{
        workerPath:"https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js",
        logger:message => updateOcrJobUi(docId,message)
      });
      job.worker = worker;

      const results = [];
      for (let index = 0; index < pages.length; index += 1) {
        if (job.cancelled) break;
        const pageNo = pages[index];
        job.currentPage = pageNo;
        job.currentIndex = index + 1;
        doc.ocrStatus = `กำลังเตรียมหน้า ${pageNo}/${doc.pages}`;
        renderExtractedDocuments();

        const canvas = await renderPdfPageForOcr(pdf,pageNo);
        if (job.cancelled) break;

        const result = await worker.recognize(canvas,{rotateAuto:true});
        if (job.cancelled) break;
        results.push({
          page:pageNo,
          text:String(result?.data?.text || "").trim(),
          confidence:Number(result?.data?.confidence)
        });
        doc.ocrProgress = (index + 1) / pages.length;
        doc.ocrStatus = `OCR หน้า ${pageNo} เสร็จแล้ว (${index + 1}/${pages.length})`;
        renderExtractedDocuments();
      }

      if (job.cancelled) {
        doc.ocrState = "cancelled";
        doc.ocrStatus = "ยกเลิก OCR แล้ว";
        notify("ยกเลิก OCR แล้ว", "info", 4000);
        return;
      }

      doc.pageTexts = OCR.mergeOcrResults(doc.pageTexts,results);
      doc.text = OCR.rebuildPdfText(doc.pageTexts);
      doc.ocrCompletedPages = [...new Set([...(doc.ocrCompletedPages || []),...results.map(item => item.page)])].sort((a,b)=>a-b);
      doc.ocrAverageConfidence = OCR.averageConfidence(doc.pageTexts);
      const assessment = OCR.scanAssessment(doc.pageTexts.map(item => ({
        ...item,
        nativeText:item.extractionMode === "ocr" ? item.ocrText : item.nativeText
      })));
      doc.ocrSuggestedPages = assessment.candidatePages;
      doc.ocrState = "complete";
      doc.ocrProgress = 1;
      doc.ocrStatus = `OCR เสร็จ ${results.length} หน้า · โปรดตรวจทานข้อความก่อนใช้`;
      doc.warning = doc.ocrSuggestedPages.length
        ? `OCR แล้ว ${results.length} หน้า · ยังมีหน้าที่ข้อความน้อย: ${OCR.compressPages(doc.ocrSuggestedPages.slice(0,12))}`
        : `OCR แล้ว ${results.length} หน้า · ข้อความ OCR ต้องตรวจทานกับต้นฉบับ`;
      rebuildDocumentIntelligenceIndex({rerunSearch:true});

      notify(`OCR ${doc.name} เสร็จ ${results.length} หน้า${doc.ocrAverageConfidence != null ? " · confidence เฉลี่ย " + doc.ocrAverageConfidence.toFixed(0) + "%" : ""}`, "success", 7500);
    } catch (err) {
      if (!job.cancelled) {
        doc.ocrState = "error";
        doc.ocrStatus = "OCR ไม่สำเร็จ: " + (err?.message || "ไม่ทราบสาเหตุ");
        notify(doc.ocrStatus, "error", 9000);
      }
    } finally {
      try {
        if (job.worker && !job.cancelled) await job.worker.terminate();
      } catch {}
      if (activeOcrJob === job) activeOcrJob = null;
      renderExtractedDocuments();
      syncIndicatorsFromDom();
      renderIndicators();
    }
  }

  function selectedExtractedDocuments() {
    return extractedDocuments.filter(doc => doc.include && doc.status === "ready" && doc.text);
  }

  function documentRoleLabel(role) {
    return DOCUMENT_ROLES.find(item => item[0] === role)?.[1] || "Other / อื่น ๆ";
  }

  function inferDocumentRole(filename) {
    const name = String(filename || "").toLowerCase();
    if (/sar|รายงานการประเมินตนเอง/.test(name)) return "sar_context";
    if (/ข้อตกลง|agreement|\bpa\b/.test(name)) return "pa_agreement";
    if (/รายงานผล|performance|ปฏิบัติงาน/.test(name)) return "performance_report";
    if (/\bnt\b|\brt\b|assessment|ผลสอบ|ผลประเมิน/.test(name)) return "assessment_result";
    if (/policy|นโยบาย/.test(name)) return "policy";
    if (/award|รางวัล|เกียรติบัตร|ประกาศ/.test(name)) return "award";
    return "other";
  }

  function documentTextForSelection(doc) {
    if (!doc.pages || !Array.isArray(doc.pageTexts)) {
      doc.pageError = "";
      return doc.text;
    }
    const parsed = R.parsePageSpec(doc.pageSpec || "", doc.pages);
    doc.pageError = parsed.error;
    if (parsed.error) return doc.text;
    const wanted = new Set(parsed.pages);
    return doc.pageTexts
      .filter(item => wanted.has(item.page))
      .map(item => {
        const tag = item.extractionMode === "ocr"
          ? " [OCR — ตรวจทานก่อนใช้]"
          : item.extractionMode === "ocr_empty"
            ? " [OCR ไม่พบข้อความ]"
            : "";
        return `--- หน้า ${item.page}${tag} ---\n${item.text || ""}`;
      })
      .join("\n\n");
  }

  function buildCombinedDocumentText() {
    const docs = selectedExtractedDocuments();
    if (!docs.length) return "";
    return docs.map((doc, index) => {
      const selection = documentTextForSelection(doc);
      const pageNote = doc.pages && doc.pageSpec ? ` | PAGES: ${doc.pageSpec}` : "";
      const ocrNote = doc.ocrCompletedPages?.length
        ? ` | OCR PAGES: ${OCR.compressPages(doc.ocrCompletedPages)} (USER REVIEW REQUIRED)`
        : "";
      return `===== SOURCE ${index + 1}: ${doc.name} | ROLE: ${documentRoleLabel(doc.role)}${pageNote}${ocrNote} =====\n${selection}`;
    }).join("\n\n");
  }

  function chunkCountForDocument(docId) {
    return documentChunks.filter(chunk => chunk.docId === docId).length;
  }

  function renderDocumentChunkStats() {
    if (!documentChunkStats) return;
    const readyDocs = extractedDocuments.filter(doc => doc.status === "ready");
    const totalPages = readyDocs.reduce((sum,doc) => sum + (doc.pages || 0),0);
    const longDocs = readyDocs.filter(doc => (doc.pages || 0) >= 30 || String(doc.text || "").length >= 40000).length;
    documentChunkStats.innerHTML = readyDocs.length
      ? [
          `<span class="document-stat">${documentChunks.length.toLocaleString()} chunks</span>`,
          totalPages ? `<span class="document-stat">${totalPages.toLocaleString()} หน้า</span>` : "",
          longDocs ? `<span class="document-stat">เอกสารยาว ${longDocs} ไฟล์</span>` : ""
        ].join("")
      : "";
  }

  function renderDocumentSearchSuggestions() {
    if (!documentSearchSuggestions) return;
    const suggestions = DI.contextQueries({
      challengeTitle:value("challengeTitle"),
      developmentNeed:value("developmentNeed")
    },indicators);
    documentSearchSuggestions.innerHTML = suggestions.length
      ? suggestions.map(item =>
          `<button type="button" class="document-search-chip" data-document-search-query="${esc(item.query)}"><span>${esc(item.label)}</span>${esc(item.query)}</button>`
        ).join("")
      : '<span class="document-search-empty">กรอกประเด็นท้าทาย/ตัวชี้วัดใน STEP 2–3 เพื่อให้ระบบสร้างคำค้นแนะนำ</span>';
  }

  function rebuildDocumentIntelligenceIndex(options = {}) {
    documentChunks = DI.buildChunks(extractedDocuments,{
      maxChars:1400,
      overlapChars:180
    });
    renderDocumentChunkStats();
    renderDocumentSearchSuggestions();

    const currentQuery = String(documentSearchInput?.value || "").trim();
    if (options.rerunSearch !== false && currentQuery) {
      runDocumentSearch(currentQuery);
    } else if (!currentQuery) {
      documentSearchPageResults = [];
      if (documentSearchStatus) {
        documentSearchStatus.className = "json-status neutral";
        documentSearchStatus.textContent = extractedDocuments.some(doc => doc.status === "ready")
          ? `สร้างดัชนีแล้ว ${documentChunks.length.toLocaleString()} chunks · พิมพ์คำค้นหรือเลือกคำค้นจาก Project`
          : "อ่านเอกสารก่อน แล้วพิมพ์คำค้นหรือเลือกคำค้นจาก Project";
      }
      if (documentSearchResults) {
        documentSearchResults.innerHTML = '<div class="empty-state">ผลค้นหาจะเรียงตามความเกี่ยวข้องระดับ chunk/page และยังต้องเปิดต้นฉบับตรวจเอง</div>';
      }
    }
  }

  function allowedSearchDocumentIds() {
    if (documentSearchScope?.value === "all") return null;
    return extractedDocuments
      .filter(doc => doc.status === "ready" && doc.include)
      .map(doc => doc.id);
  }

  function searchResultByKey(key) {
    return documentSearchPageResults.find(item => item.key === key) || null;
  }

  function evidenceReviewNoteById(id) {
    return evidenceReviewNotes.find(item => item.id === id) || null;
  }

  function evidenceReviewClassificationOptions(current) {
    const options = [
      ["unclassified","ยังไม่จัดประเภท"],
      ["fact","FACT"],
      ["target","TARGET"],
      ["actual","ACTUAL"],
      ["context","CONTEXT"],
      ["pending","PENDING"]
    ];
    return options.map(([value,label]) =>
      `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`
    ).join("");
  }

  function evidenceReviewStatusOptions(current) {
    const options = [
      ["candidate","รอตรวจ"],
      ["checked","ตรวจต้นฉบับแล้ว"],
      ["rejected","ไม่ใช้"]
    ];
    return options.map(([value,label]) =>
      `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`
    ).join("");
  }

  function evidenceReviewIndicatorOptions(current) {
    return ['<option value="">ยังไม่ผูกตัวชี้วัด</option>']
      .concat(indicators.map((item,index) =>
        `<option value="${esc(item.id)}" ${item.id === current ? "selected" : ""}>ตัวชี้วัด ${index + 1} · ${esc(item.title || "ยังไม่มีชื่อ")}</option>`
      )).join("");
  }

  function renderEvidenceReview() {
    if (!evidenceReviewList || !evidenceReviewStats) return;
    evidenceReviewNotes = evidenceReviewNotes.map(item => ({...ER.normalizeNote(item), id:item.id || cryptoId()}));
    const counts = ER.counts(evidenceReviewNotes);
    evidenceReviewStats.innerHTML = [
      `<span class="document-stat">ทั้งหมด ${counts.total}</span>`,
      `<span class="document-stat">รอตรวจ ${counts.candidate}</span>`,
      `<span class="document-stat">ตรวจแล้ว ${counts.checked}</span>`,
      counts.rejected ? `<span class="document-stat">ไม่ใช้ ${counts.rejected}</span>` : "",
      counts.linked ? `<span class="document-stat">ผูกตัวชี้วัด ${counts.linked}</span>` : ""
    ].join("");

    if (!evidenceReviewNotes.length) {
      evidenceReviewList.innerHTML = '<div class="empty-state">จากผลค้นหาในขั้นที่ 3 กด “เก็บเข้า Evidence Review” เพื่อสร้างรายการตรวจหลักฐาน</div>';
      return;
    }

    evidenceReviewList.innerHTML = evidenceReviewNotes.map((item,index) => {
      const indicator = indicators.find(ind => ind.id === item.linkedIndicatorId);
      const loadedDoc = DA.findDocumentBySource(extractedDocuments,item.sourceFile);
      const sourceState = loadedDoc
        ? '<span class="review-badge loaded">Source อยู่ใน session</span>'
        : '<span class="review-badge missing">Source ยังไม่โหลดใน session</span>';
      const extraction = item.extractionMode === "ocr"
        ? '<span class="review-badge ocr">OCR · ต้องตรวจต้นฉบับ</span>'
        : '<span class="review-badge">Native text</span>';
      return `
        <article class="evidence-review-card" data-review-id="${item.id}">
          <div class="evidence-review-head">
            <span class="review-index">${index + 1}</span>
            <div>
              <strong>${esc(item.sourceFile || "Unknown source")}${item.sourcePage ? " · " + esc(item.sourcePage) : ""}</strong>
              <small>คำค้น: ${esc(item.query || "—")}</small>
            </div>
            <div class="review-head-badges">${sourceState}${extraction}</div>
          </div>

          <div class="review-excerpt">${esc(item.excerpt || "ไม่มี excerpt")}</div>
          ${item.sectionHint ? `<div class="review-section-hint"><strong>Section hint:</strong> ${esc(item.sectionHint)}</div>` : ""}

          <div class="review-fields">
            <label>จัดประเภท
              <select data-review-classification>${evidenceReviewClassificationOptions(item.classification)}</select>
            </label>
            <label>สถานะ Review
              <select data-review-status>${evidenceReviewStatusOptions(item.reviewStatus)}</select>
            </label>
            <label class="wide">ผูกกับตัวชี้วัด
              <select data-review-indicator>${evidenceReviewIndicatorOptions(item.linkedIndicatorId)}</select>
            </label>
            <label class="wide">บันทึกเหตุผล / สิ่งที่ต้องตรวจ
              <input data-review-note value="${esc(item.note)}" placeholder="เช่น ตรวจว่าตัวเลขเป็นรอบปัจจุบันและเป็นนักเรียนกลุ่มเดียวกัน">
            </label>
          </div>

          <div class="review-actions">
            <button type="button" class="btn btn-ghost" data-review-open-source>เปิด Source</button>
            <button type="button" class="btn btn-secondary" data-review-copy>คัดลอก Note</button>
            <button type="button" class="btn btn-primary" data-review-promote ${indicator ? "" : "disabled"}>ส่งไป Evidence Trace</button>
            <button type="button" class="btn btn-ghost review-remove" data-review-remove>ลบ</button>
          </div>
          <div class="review-guardrail">Review “ตรวจต้นฉบับแล้ว” ยังไม่เท่ากับ Evidence Trace VERIFIED · เมื่อส่งไป STEP 3 ระบบจะตั้ง UNVERIFIED เสมอ</div>
        </article>`;
    }).join("");
  }

  function addEvidenceReviewFromSearch(result) {
    if (!result) return;
    const note = ER.createFromSearchResult(result,documentSearchInput?.value || "",cryptoId());
    if (ER.isDuplicate(evidenceReviewNotes,note)) {
      notify("รายการนี้อยู่ใน Evidence Review แล้ว", "info", 4200);
      return;
    }
    evidenceReviewNotes.push(note);
    renderEvidenceReview();
    save();
    notify(`เก็บ ${note.sourceFile}${note.sourcePage ? " " + note.sourcePage : ""} เข้า Evidence Review แล้ว`, "success", 4500);
  }

  function openEvidenceReviewSource(note) {
    if (!note) return;
    const doc = DA.findDocumentBySource(extractedDocuments,note.sourceFile);
    if (!doc) {
      notify("Source นี้ยังไม่อยู่ใน session กรุณาเลือกเอกสารต้นฉบับใหม่ก่อน", "warn", 6500);
      return;
    }
    if (note.sourcePage && doc.pages) {
      const pageSpec = DA.parseSourcePage(note.sourcePage);
      if (pageSpec) {
        const parsed = R.parsePageSpec(pageSpec,doc.pages);
        if (!parsed.error) doc.pageSpec = pageSpec;
      }
    }
    doc.include = true;
    renderExtractedDocuments();
    window.requestAnimationFrame(() => {
      const card = documentList.querySelector(`[data-doc-id="${CSS.escape(doc.id)}"]`);
      card?.classList.add("source-focus");
      card?.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(() => card?.classList.remove("source-focus"),1800);
    });
  }

  function promoteEvidenceReview(note) {
    if (!note || !note.linkedIndicatorId) {
      notify("กรุณาเลือกตัวชี้วัดก่อนส่งไป Evidence Trace", "warn", 5200);
      return;
    }
    const item = indicators.find(ind => ind.id === note.linkedIndicatorId);
    if (!item) {
      notify("ไม่พบตัวชี้วัดที่ผูกไว้", "error", 5200);
      return;
    }
    item.sourceFile = note.sourceFile;
    item.sourcePage = note.sourcePage;
    item.verification = "unverified";
    if (!R.isMeaningful(item.evidence)) {
      item.evidence = note.note || `Evidence Review — ${note.sourceFile}${note.sourcePage ? " " + note.sourcePage : ""}`;
    }
    renderIndicators();
    save();
    closeDocumentReaderModal();
    showStep(2);
    window.requestAnimationFrame(() => {
      const card = indicatorCards.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
      if (!card) return;
      const trace = card.querySelector(".indicator-trace");
      if (trace) trace.open = true;
      card.classList.add("focus-pulse");
      card.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(() => card.classList.remove("focus-pulse"),1800);
    });
    notify("ส่ง Source ไป Evidence Trace แล้ว · สถานะยังเป็น UNVERIFIED จนกว่าคุณจะตรวจต้นฉบับใน STEP 3", "success", 7600);
  }

  function renderDocumentSearchResults(query) {
    if (!documentSearchResults) return;
    if (!documentSearchPageResults.length) {
      documentSearchResults.innerHTML = `<div class="empty-state">ไม่พบคำว่า <strong>${esc(query)}</strong> ในขอบเขตที่เลือก ลองใช้คำสั้นลงหรือเปลี่ยนขอบเขตเป็นเอกสารทั้งหมด</div>`;
      return;
    }

    documentSearchResults.innerHTML = documentSearchPageResults.map((item,index) => {
      const doc = extractedDocuments.find(d => d.id === item.docId);
      const pageLabel = item.page != null ? `หน้า ${item.page}` : "ทั้งเอกสาร";
      const role = doc ? documentRoleLabel(doc.role) : "";
      const ocr = item.extractionMode === "ocr"
        ? '<span class="search-result-badge ocr">OCR · ต้องตรวจต้นฉบับ</span>'
        : "";
      const matched = item.matchedTerms?.length
        ? `<span class="search-result-terms">พบคำ: ${esc(item.matchedTerms.slice(0,5).join(" · "))}</span>`
        : "";
      const sourceAction = sourcePickerIndicatorId
        ? `<button type="button" class="btn btn-primary" data-use-search-source="${esc(item.key)}">ใช้${item.page != null ? "หน้านี้" : "เอกสารนี้"}เป็น Source</button>`
        : "";
      return `
        <article class="document-search-result" data-search-key="${esc(item.key)}">
          <div class="search-result-rank">${index + 1}</div>
          <div class="search-result-main">
            <div class="search-result-head">
              <strong>${esc(item.docName)}</strong>
              <span>${esc(pageLabel)}</span>
              ${role ? `<span class="search-result-badge">${esc(role)}</span>` : ""}
              ${ocr}
            </div>
            <p>${esc(item.excerpts?.join(" … ") || "")}</p>
            ${matched}
          </div>
          <div class="search-result-actions">
            ${item.page != null
              ? `<button type="button" class="btn btn-secondary" data-use-search-page="${esc(item.key)}">เพิ่มหน้านี้เข้า AI</button>`
              : `<button type="button" class="btn btn-secondary" data-use-search-document="${esc(item.key)}">ใช้เอกสารนี้กับ AI</button>`}
            ${sourceAction}
            <button type="button" class="btn btn-ghost" data-copy-search-result="${esc(item.key)}">คัดลอกข้อความ</button>
          </div>
        </article>`;
    }).join("");
  }

  function runDocumentSearch(queryValue) {
    const query = String(queryValue != null ? queryValue : documentSearchInput?.value || "").trim();
    if (!documentSearchStatus || !documentSearchResults) return;
    if (!query) {
      documentSearchPageResults = [];
      documentSearchStatus.className = "json-status neutral";
      documentSearchStatus.textContent = "กรอกคำค้นก่อน เช่น ผลสัมฤทธิ์ทางการเรียน หรือ ซ่อมเสริม";
      renderDocumentSearchResults(query);
      return;
    }
    if (!documentChunks.length) {
      documentSearchPageResults = [];
      documentSearchStatus.className = "json-status warn";
      documentSearchStatus.textContent = "ยังไม่มีข้อความที่ค้นหาได้ กรุณาอ่านข้อความจากเอกสารก่อน";
      renderDocumentSearchResults(query);
      return;
    }

    const chunkHits = DI.searchChunks(documentChunks,query,{
      allowedDocIds:allowedSearchDocumentIds(),
      limit:100,
      excerptChars:420
    });
    documentSearchPageResults = DI.aggregatePageResults(chunkHits,{limit:30});

    const pageHits = documentSearchPageResults.filter(item => item.page != null).length;
    documentSearchStatus.className = "json-status " + (documentSearchPageResults.length ? "ok" : "warn");
    documentSearchStatus.innerHTML = documentSearchPageResults.length
      ? `พบ <strong>${documentSearchPageResults.length}</strong> ผลที่เกี่ยวข้อง${pageHits ? " · " + pageHits + " หน้า" : ""} จาก ${chunkHits.length} chunk hits · เรียงตามความเกี่ยวข้องเชิงข้อความ ไม่ใช่การยืนยันหลักฐาน`
      : `ไม่พบ “${esc(query)}” ในขอบเขตที่เลือก`;
    renderDocumentSearchResults(query);
  }

  function addPageToDocumentSelection(doc,page) {
    if (!doc || !page) return;
    let pages = [];
    if (doc.pageSpec) {
      const parsed = R.parsePageSpec(doc.pageSpec,doc.pages);
      if (!parsed.error) pages = parsed.pages;
    }
    pages.push(Number(page));
    doc.pageSpec = OCR.compressPages(pages);
    doc.pageError = "";
    doc.include = true;
    renderExtractedDocuments();
    notify(`เพิ่ม ${doc.name} หน้า ${page} เข้า Sources สำหรับ AI แล้ว`, "success", 4800);
  }

  function useSearchResultAsSource(result) {
    if (!result || !sourcePickerIndicatorId) return;
    const item = indicators.find(indicator => indicator.id === sourcePickerIndicatorId);
    if (!item) return;
    item.sourceFile = result.docName;
    item.sourcePage = result.page != null ? "หน้า " + result.page : "";
    item.verification = "unverified";
    const doc = extractedDocuments.find(d => d.id === result.docId);
    if (doc) {
      doc.include = true;
      if (result.page != null) addPageToDocumentSelection(doc,result.page);
    }
    closeDocumentReaderModal();
    renderIndicators();
    save();
    window.requestAnimationFrame(() => {
      const card = indicatorCards.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
      if (!card) return;
      const trace = card.querySelector(".indicator-trace");
      if (trace) trace.open = true;
      card.classList.add("focus-pulse");
      card.scrollIntoView({behavior:"smooth",block:"center"});
      setTimeout(() => card.classList.remove("focus-pulse"),1800);
    });
    notify(`ใช้ ${result.docName}${result.page != null ? " หน้า " + result.page : ""} เป็น Source แล้ว · ยังเป็น UNVERIFIED จนกว่าจะตรวจต้นฉบับ`, "success", 7200);
  }

  function updateDocumentPreview() {
    const selected = selectedExtractedDocuments();
    const text = buildCombinedDocumentText();
    documentTextPreview.value = text;
    externalSourceText = text;

    const totalChars = selected.reduce((sum, doc) => sum + doc.text.length, 0);
    const totalPages = selected.reduce((sum, doc) => sum + (doc.pages || 0), 0);
    const totalOcrPages = selected.reduce((sum,doc) => sum + (doc.ocrCompletedPages?.length || 0),0);
    documentStats.innerHTML = [
      `<span class="document-stat">${selected.length} ไฟล์ที่เลือก</span>`,
      `<span class="document-stat">${totalChars.toLocaleString()} ตัวอักษร</span>`,
      totalPages ? `<span class="document-stat">${totalPages} หน้า PDF</span>` : "",
      totalOcrPages ? `<span class="document-stat">OCR ${totalOcrPages} หน้า · ต้องตรวจทาน</span>` : ""
    ].join("");

    const enabled = Boolean(text);
    document.getElementById("copyExtractedTextBtn").disabled = !enabled;
    document.getElementById("downloadExtractedTextBtn").disabled = !enabled;
    document.getElementById("copyDocumentAiPackageBtn").disabled = !enabled;
    document.getElementById("openJsonAssistantFromDocsBtn").disabled = !enabled;
  }

  function renderExtractedDocuments() {
    if (!extractedDocuments.length) {
      documentList.innerHTML = '<div class="empty-state">เมื่อเลือกและอ่านข้อความ รายการเอกสารจะปรากฏที่นี่</div>';
      updateDocumentPreview();
      renderDocumentAuditMini();
      return;
    }

    documentList.innerHTML = extractedDocuments.map(doc => {
      const chunkCount = chunkCountForDocument(doc.id);
      const meta = [
        formatBytes(doc.size),
        doc.pages ? doc.pages + " หน้า" : "",
        doc.status === "ready" ? doc.text.length.toLocaleString() + " ตัวอักษร" : "",
        chunkCount ? chunkCount.toLocaleString() + " chunks" : ""
      ].filter(Boolean).join(" · ");
      const noteClass = doc.status === "error" ? "document-error" : doc.warning ? "document-warning" : "";
      const note = doc.status === "error" ? doc.error : doc.warning;
      const roleOptions = DOCUMENT_ROLES.map(([value,label]) =>
        `<option value="${value}" ${doc.role === value ? "selected" : ""}>${esc(label)}</option>`
      ).join("");

      let ocrPanel = "";
      if (doc.pages && Array.isArray(doc.pageTexts) && doc.status === "ready") {
        const assessment = OCR.scanAssessment(doc.pageTexts.map(item => ({
          ...item,
          nativeText:item.extractionMode === "ocr" ? item.ocrText : item.nativeText
        })));
        const suggested = Array.isArray(doc.ocrSuggestedPages) && doc.ocrSuggestedPages.length
          ? doc.ocrSuggestedPages
          : assessment.candidatePages;
        const suggestedSpec = OCR.compressPages(suggested.slice(0,12));
        const pageSpec = doc.ocrPageSpec || suggestedSpec;
        const isActive = activeOcrJob?.docId === doc.id;
        const hasRawFile = documentFiles.has(doc.id);
        const confidence = doc.ocrAverageConfidence != null
          ? ` · confidence เฉลี่ย ${Number(doc.ocrAverageConfidence).toFixed(0)}%`
          : "";
        const scanBadge = assessment.hasAnyCandidate
          ? `<span class="ocr-badge warn">${assessment.likelyScanned ? "มีแนวโน้มเป็น PDF สแกน" : "มีหน้าที่ text layer น้อย"} · แนะนำ ${assessment.candidateCount} หน้า</span>`
          : '<span class="ocr-badge ok">text layer ดูเพียงพอ</span>';
        const completedBadge = doc.ocrCompletedPages?.length
          ? `<span class="ocr-badge info">OCR แล้ว: ${esc(OCR.compressPages(doc.ocrCompletedPages))}${confidence}</span>`
          : "";

        ocrPanel = `
          <details class="document-ocr-panel" ${assessment.likelyScanned || doc.ocrState === "running" || doc.ocrState === "loading" ? "open" : ""}>
            <summary>
              <span>OCR PDF สแกน — เลือกใช้เอง</span>
              <span class="ocr-summary-badges">${scanBadge}${completedBadge}</span>
            </summary>
            <div class="ocr-controls">
              <div class="ocr-guide">
                <strong>ทำงานเฉพาะหน้าที่คุณเลือก</strong>
                <span>ระบบไม่ OCR อัตโนมัติ · สูงสุด 12 หน้าต่อรอบ · ข้อความ OCR ต้องเทียบกับต้นฉบับก่อนนำไปยืนยัน ACTUAL</span>
              </div>
              <label>หน้าที่ต้องการ OCR
                <input data-ocr-pages value="${esc(pageSpec)}" placeholder="เช่น 1-3,5">
                <small>${suggestedSpec ? "หน้าที่ระบบแนะนำ: " + esc(suggestedSpec) : "ไม่มีหน้าที่ระบบแนะนำเป็นพิเศษ — ระบุหน้าเองได้"}</small>
              </label>
              <label>ภาษา OCR
                <select data-ocr-language>
                  <option value="tha+eng" ${(doc.ocrLanguage || "tha+eng") === "tha+eng" ? "selected" : ""}>ไทย + English — แนะนำ</option>
                  <option value="tha" ${doc.ocrLanguage === "tha" ? "selected" : ""}>ภาษาไทย</option>
                  <option value="eng" ${doc.ocrLanguage === "eng" ? "selected" : ""}>English</option>
                </select>
              </label>
              <div class="ocr-actions">
                ${isActive
                  ? `<button type="button" class="btn btn-danger" data-cancel-ocr="${doc.id}">ยกเลิก OCR</button>`
                  : `<button type="button" class="btn btn-ai" data-start-ocr="${doc.id}" ${hasRawFile ? "" : "disabled"}>เริ่ม OCR หน้าที่เลือก</button>`}
                ${suggestedSpec ? `<button type="button" class="btn btn-ghost" data-use-ocr-suggested="${doc.id}">ใช้หน้าที่แนะนำ</button>` : ""}
              </div>
              <div class="ocr-progress-wrap">
                <div class="ocr-progress-track"><span data-ocr-progress-bar style="width:${Math.round((doc.ocrProgress || 0) * 100)}%"></span></div>
                <span data-ocr-status>${esc(doc.ocrStatus || (hasRawFile ? "พร้อมทำ OCR เมื่อคุณกดเริ่ม" : "ไฟล์จริงไม่อยู่ใน session — เลือก PDF ใหม่ก่อน OCR"))}</span>
              </div>
              <div class="ocr-privacy">
                OCR engine และ language model จะดาวน์โหลดจาก CDN เมื่อกดเริ่มครั้งแรก แต่ PDF/ภาพหน้ากระดาษไม่ถูกอัปโหลดโดย Toolkit
              </div>
            </div>
          </details>`;
      }

      return `
        <article class="document-item" data-doc-id="${doc.id}">
          <input type="checkbox" class="document-include" ${doc.include && doc.status === "ready" ? "checked" : ""} ${doc.status !== "ready" ? "disabled" : ""} aria-label="ใช้ ${esc(doc.name)} กับ AI">
          <div class="document-main">
            <strong>${esc(doc.name)}</strong>
            <small>${esc(meta || doc.status)}</small>
            <span class="document-role-badge">${esc(documentRoleLabel(doc.role))}</span>
            ${note ? `<small class="${noteClass}">${esc(note)}</small>` : ""}
            <div class="document-controls">
              <label>บทบาทเอกสาร
                <select class="document-role">${roleOptions}</select>
              </label>
              ${doc.pages ? `<label>หน้าที่ใช้กับ AI
                <input class="document-pages" value="${esc(doc.pageSpec || "")}" placeholder="ทั้งหมด หรือ 1-3,5">
                <span class="page-error">${esc(doc.pageError || "")}</span>
              </label>` : ""}
            </div>
            ${ocrPanel}
          </div>
          <div class="document-card-actions">
            ${sourcePickerIndicatorId && doc.status === "ready"
              ? `<button type="button" class="btn btn-primary use-as-source-btn" data-use-as-source="${doc.id}">ใช้เป็น Source</button>`
              : ""}
            <button type="button" class="document-remove" aria-label="ลบเอกสาร">ลบ</button>
          </div>
        </article>`;
    }).join("");
    updateDocumentPreview();
    renderDocumentAuditMini();
  }

  async function extractPendingDocuments() {
    if (!pendingSourceFiles.length) return;
    documentReaderStatus.className = "json-status neutral";
    documentReaderStatus.textContent = "กำลังอ่านข้อความจากเอกสาร...";
    document.getElementById("extractDocumentsBtn").disabled = true;

    const docs = [];
    documentFiles.clear();
    for (let i = 0; i < pendingSourceFiles.length; i += 1) {
      const file = pendingSourceFiles[i];
      documentReaderStatus.textContent = `กำลังอ่าน ${i + 1}/${pendingSourceFiles.length}: ${file.name}`;
      const base = {
        id: cryptoId(),
        name: file.name,
        type: file.type || file.name.split(".").pop() || "",
        size: file.size,
        pages: null,
        text: "",
        status: "reading",
        warning: "",
        error: "",
        include: true,
        role: inferDocumentRole(file.name),
        pageSpec: "",
        pageError: ""
      };
      documentFiles.set(base.id,file);
      try {
        const result = await extractOneDocument(file);
        docs.push({...base, ...result, status: "ready"});
      } catch (err) {
        docs.push({...base, status: "error", include: false, error: err?.message || "อ่านไฟล์ไม่สำเร็จ"});
      }
    }

    extractedDocuments = docs;
    pendingSourceFiles = [];
    sourceDocumentsInput.value = "";
    rebuildDocumentIntelligenceIndex({rerunSearch:false});
    renderExtractedDocuments();
    syncIndicatorsFromDom();
    renderIndicators();

    document.getElementById("extractDocumentsBtn").disabled = true;
    const ready = docs.filter(x => x.status === "ready").length;
    const failed = docs.length - ready;
    documentReaderStatus.className = "json-status " + (failed ? "warn" : "ok");
    documentReaderStatus.textContent = failed
      ? `อ่านได้ ${ready} ไฟล์ · มีปัญหา ${failed} ไฟล์ กรุณาตรวจรายการด้านล่าง`
      : `อ่านสำเร็จ ${ready} ไฟล์ ข้อความยังอยู่เฉพาะใน session นี้`;
  }

  function buildExternalAiPromptWithSources() {
    const sourceText = buildCombinedDocumentText();
    return `${buildExternalAiPrompt()}

ต่อไปนี้คือข้อความที่ Toolkit ดึงจากเอกสารใน Browser
ให้ถือ SOURCE แต่ละส่วนเป็นเอกสารต้นทาง และห้ามข้ามข้อจำกัดเรื่อง TARGET/ACTUAL/CONTEXT/PENDING ข้างต้น

${sourceText}`;
  }

  function buildExternalAiPrompt() {
    return `คุณกำลังช่วยเตรียมข้อมูลสำหรับ PA NotebookLM Presentation Toolkit — Evidence & Reliability 3.1

งานของคุณ:
1) อ่านเฉพาะเอกสาร/ข้อความ/หลักฐานที่ฉันแนบในบทสนทนานี้
2) สกัดข้อมูลตาม JSON schema ด้านล่าง
3) แยก TARGET กับ ACTUAL อย่างเคร่งครัด
4) CONTEXT หรือข้อมูลคนละรอบ/คนละกลุ่ม ห้ามเขียนเป็น ACTUAL ของรอบปัจจุบัน
5) ถ้าเอกสารไม่รองรับข้อมูล ให้ใช้สตริงว่าง "" หรือ "PENDING" ห้ามคาดเดา
6) ถ้าข้อมูลขัดกัน ให้คงค่าที่ตรวจสอบไม่ได้เป็น "PENDING" และอธิบายใน importNotes
7) ห้ามสร้างชื่อรางวัล ตัวเลข ผลสอบ นโยบาย หนังสือราชการ หรือหลักฐานที่ไม่มีในเอกสาร
8) ปกปิดชื่อผู้เรียนหรือข้อมูลส่วนบุคคลที่ไม่จำเป็น
9) ACTUAL ทุกค่าที่ไม่ใช่ PENDING ต้องระบุ sourceFile, sourcePage (ถ้าทราบ), period และ population
10) Before/After หรือคำว่าเพิ่มขึ้น/ลดลง ต้องเป็น cohort/population ที่เปรียบเทียบกันได้ มิฉะนั้นให้แยกเป็น CONTEXT
11) verification ต้องเป็น "unverified" เสมอ AI ห้ามยืนยันหลักฐานแทนผู้ใช้
12) ตอบกลับเป็น JSON object เท่านั้น ห้ามมี Markdown code fence ห้ามมีคำอธิบายก่อนหรือหลัง JSON

ความหมายของบทบาทเอกสารเมื่อ SOURCE header มี ROLE:
- PA Agreement / ข้อตกลง: ใช้ยืนยัน TARGET/ข้อตกลง ไม่ถือเป็น ACTUAL
- Performance Report / รายงานผล: อาจเป็นแหล่ง ACTUAL ถ้าช่วงเวลาและประชากรตรง
- SAR / CONTEXT: ใช้เป็นบริบท เว้นแต่มีหลักฐานชัดว่าเป็น ACTUAL ของรอบเดียวกัน
- Assessment Result / ผลประเมิน: ใช้ผลประเมินตามช่วงเวลาและ population ที่ระบุ
- Policy / นโยบาย: ใช้เฉพาะ policy alignment
- Award / Recognition: ใช้เฉพาะรางวัล/การยอมรับ
- Evidence / หลักฐานประกอบ: ใช้สนับสนุนข้อความที่ตรวจสอบได้

JSON ที่ต้องตอบ:
{
  "schema_version": "${AI_SCHEMA_VERSION}",
  "presenterName": "",
  "position": "",
  "academicRank": "",
  "organization": "",
  "affiliation": "",
  "paCycle": "",
  "evaluationPeriod": "",
  "duration": "5",
  "challengeTitle": "",
  "managementModel": "",
  "baselineSource": "",
  "developmentNeed": "",
  "contextNotes": "",
  "processNotes": "",
  "indicators": [
    {
      "title": "",
      "target": "",
      "actual": "",
      "actualMode": "pending",
      "evidence": "",
      "actualNumerator": "",
      "actualDenominator": "",
      "sourceFile": "",
      "sourcePage": "",
      "period": "",
      "population": "",
      "cohortId": "",
      "verification": "unverified"
    }
  ],
  "learnerOutcome": "",
  "staffOutcome": "",
  "workOutcome": "",
  "organizationOutcome": "",
  "journeyBefore": "",
  "journeyAction": "",
  "journeyAfter": "",
  "journeyEvidence": "",
  "systems": "",
  "participationStaff": "",
  "participationLearners": "",
  "participationParents": "",
  "participationNetwork": "",
  "recognition": "",
  "recognitionEvidence": "",
  "expansionLevel": "",
  "expansionEvidence": "",
  "policyNotes": "",
  "evidenceTypes": [],
  "importNotes": ""
}

กติกาเพิ่มเติม:
- duration ใช้ได้เฉพาะ "5" หรือ "7"
- indicators เพิ่มได้ตามจำนวนตัวชี้วัดจริง
- actualNumerator/actualDenominator ใส่เฉพาะเมื่อเอกสารมีจำนวนที่ชัดเจน
- cohortId ใช้รหัสอธิบายกลุ่มเดียวกัน เช่น "P3-2570"; ถ้าไม่แน่ใจให้เว้นว่าง
- evidenceTypes เลือกได้เฉพาะค่าที่เกี่ยวข้องจากรายการนี้:
  ${EVIDENCE_OPTIONS.map(x => '"'+x+'"').join(", ")}
- contextNotes, processNotes และ systems ถ้ามีหลายรายการ ให้คั่นแต่ละรายการด้วยขึ้นบรรทัดใหม่
- actualMode เลือกได้เฉพาะ "pending", "fraction", "percent", "score", "text"
- ถ้ายังไม่มี ACTUAL ให้ actualMode = "pending" และ actual = "PENDING"
- ถ้าเป็นจำนวน/ทั้งหมด เช่น 24/30 ให้ actualMode = "fraction" และใส่ actualNumerator/actualDenominator
- ACTUAL ต้องมีหลักฐานรองรับ ถ้าพบตัวเลขแต่ยังระบุแหล่ง/ช่วงเวลา/กลุ่มไม่ได้ ให้ actual เป็น PENDING และอธิบายใน importNotes
- อย่านำข้อมูลจากความรู้ทั่วไป บุคคลอื่น หรือไฟล์ตัวอย่างมาเติม

ก่อนตอบ ให้ตรวจ JSON syntax ให้ถูกต้อง และตอบ JSON object เพียงอย่างเดียว`;
  }

  function buildAiJsonExample() {
    return JSON.stringify({
      schema_version: AI_SCHEMA_VERSION,
      presenterName: "นายตัวอย่าง การศึกษา",
      position: "ผู้อำนวยการสถานศึกษา",
      academicRank: "ชำนาญการพิเศษ",
      organization: "โรงเรียนตัวอย่างพัฒนา",
      affiliation: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษาตัวอย่าง เขต 1",
      paCycle: "1 ต.ค. 2569 – 30 ก.ย. 2570",
      evaluationPeriod: "1 เม.ย. 2570 – 30 ก.ย. 2570",
      duration: "5",
      challengeTitle: "การพัฒนาทักษะการอ่านเพื่อความเข้าใจด้วย READ Model",
      managementModel: "READ Model",
      baselineSource: "แบบประเมินก่อนพัฒนา",
      developmentNeed: "ผู้เรียนบางส่วนยังไม่ผ่านเกณฑ์การอ่านเพื่อความเข้าใจ",
      contextNotes: "ก่อนเริ่มรอบ ผู้เรียนผ่านเกณฑ์ 62%",
      processNotes: "วิเคราะห์ข้อมูลรายบุคคล\nตั้งเป้าหมาย\nจัดกิจกรรม\nPLC สะท้อนผล\nประเมินซ้ำ",
      indicators: [
        {
          title: "นักเรียนกลุ่มเป้าหมายผ่านเกณฑ์การอ่าน",
          target: "≥75%",
          actual: "24/30 = 80%",
          actualMode: "fraction",
          evidence: "แบบประเมินปลายรอบ + ตารางสรุปผล",
          actualNumerator: "24",
          actualDenominator: "30",
          sourceFile: "assessment-results.pdf",
          sourcePage: "4",
          period: "1 เม.ย. 2570 – 30 ก.ย. 2570",
          population: "นักเรียนกลุ่มเป้าหมาย 30 คน",
          cohortId: "P3-2570",
          verification: "unverified"
        },
        {
          title: "ผู้เรียนที่ไม่ผ่านได้รับการซ่อมเสริม",
          target: "100%",
          actual: "6/6 = 100%",
          actualMode: "fraction",
          evidence: "บันทึกการซ่อมเสริม",
          actualNumerator: "6",
          actualDenominator: "6",
          sourceFile: "remediation-log.pdf",
          sourcePage: "2",
          period: "1 เม.ย. 2570 – 30 ก.ย. 2570",
          population: "ผู้เรียนที่ไม่ผ่านเกณฑ์ 6 คน",
          cohortId: "P3-2570",
          verification: "unverified"
        }
      ],
      learnerOutcome: "ผู้เรียนอธิบายใจความสำคัญได้ชัดขึ้น",
      staffOutcome: "ครูใช้ข้อมูลรายบุคคลวางแผนซ่อมเสริมได้เป็นระบบ",
      workOutcome: "เกิดวงจรติดตามก่อน–หลัง",
      organizationOutcome: "มีข้อมูลภาพรวมเพื่อกำกับติดตาม",
      journeyBefore: "นักเรียน A ได้ 8/20",
      journeyAction: "ใช้ graphic organizer และ feedback รายกลุ่ม",
      journeyAfter: "นักเรียน A ได้ 14/20",
      journeyEvidence: "แบบประเมินก่อน–หลังและชิ้นงานปกปิดชื่อ",
      systems: "Reading Tracker — ติดตามข้อมูลรายบุคคล\nPLC Reflection — ปรับการสอนจากหลักฐาน",
      participationStaff: "ครูร่วม PLC ทุก 2 สัปดาห์",
      participationLearners: "ผู้เรียนทำภาระงานและสะท้อนผล",
      participationParents: "PENDING",
      participationNetwork: "PENDING",
      recognition: "",
      recognitionEvidence: "",
      expansionLevel: "ภายในสถานศึกษา/หน่วยงาน",
      expansionEvidence: "บันทึกประชุมกลุ่มงาน",
      policyNotes: "PENDING",
      evidenceTypes: [
        "ภาพกิจกรรมจริง",
        "PLC / Reflection",
        "กราฟผล ACTUAL",
        "Student / Service Journey"
      ],
      importNotes: "FICTIONAL SAMPLE — verification จงใจเป็น unverified จนกว่าผู้ใช้จะตรวจต้นฉบับ"
    }, null, 2);
  }

  function parseExternalAiJson(raw) {
    let text = String(raw || "").trim();
    if (!text) throw new Error("ยังไม่ได้วาง JSON");
    text = text.replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/,"");
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("JSON ต้องเป็น object");
    return data;
  }

  function normalizeAiJson(data) {
    const warnings = [];
    const sourceSchema = data?.schema_version || "";
    const migrated = M.migrateIntake(data);
    const allowedFields = [
      "presenterName","position","academicRank","organization","affiliation","paCycle","evaluationPeriod",
      "challengeTitle","managementModel","baselineSource","developmentNeed","contextNotes","processNotes",
      "learnerOutcome","staffOutcome","workOutcome","organizationOutcome",
      "journeyBefore","journeyAction","journeyAfter","journeyEvidence",
      "systems","participationStaff","participationLearners","participationParents","participationNetwork",
      "recognition","recognitionEvidence","expansionLevel","expansionEvidence","policyNotes"
    ];
    const out = {};

    if (sourceSchema && sourceSchema !== AI_SCHEMA_VERSION) {
      warnings.push(`schema_version ${sourceSchema} ถูก migrate เป็น ${AI_SCHEMA_VERSION}`);
    }

    allowedFields.forEach(key => {
      const v = migrated[key];
      out[key] = typeof v === "string" ? v.trim() : "";
      if (v != null && typeof v !== "string") warnings.push(`${key} ไม่ใช่ string จึงไม่ได้นำเข้า`);
    });

    out.duration = ["5","7"].includes(String(migrated.duration)) ? String(migrated.duration) : "5";
    if (migrated.duration != null && !["5","7"].includes(String(migrated.duration))) {
      warnings.push("duration ไม่ใช่ 5 หรือ 7 จึงใช้ 5 นาที");
    }

    const rawIndicators = Array.isArray(migrated.indicators) ? migrated.indicators : [];
    out.indicators = rawIndicators.map(item => {
      const normalized = R.normalizeIndicator({...item, id:item.id || cryptoId()});
      if (normalized.verification === "verified") {
        warnings.push(`AI ส่ง verification=verified สำหรับ "${normalized.title || "indicator"}"; ระบบปรับเป็น unverified เพื่อให้ผู้ใช้ตรวจเอง`);
        normalized.verification = "unverified";
      }
      return normalized;
    }).filter(x => x.title || x.target || x.actual || x.evidence);

    if (!out.indicators.length) warnings.push("ไม่พบ indicators ที่นำเข้าได้");

    const requestedEvidence = Array.isArray(migrated.evidenceTypes) ? migrated.evidenceTypes : [];
    out.evidenceTypes = requestedEvidence.filter(x => EVIDENCE_OPTIONS.includes(x));
    const dropped = requestedEvidence.filter(x => !EVIDENCE_OPTIONS.includes(x));
    if (dropped.length) warnings.push("ตัด evidenceTypes ที่ไม่รู้จัก: " + dropped.join(", "));

    out.importNotes = typeof migrated.importNotes === "string" ? migrated.importNotes.trim() : "";
    return {out, warnings};
  }

  function summarizeIndicators(list) {
    if (!Array.isArray(list) || !list.length) return "—";
    return list.map((item,i) => {
      const x = R.normalizeIndicator(item);
      return `${i+1}. ${x.title || "(ไม่มีชื่อ)"} | TARGET ${x.target || "—"} | ACTUAL ${x.actual || "—"}`;
    }).join("\n");
  }

  function renderImportReview(out, mode = "fill") {
    const current = collectState();
    const rows = [];
    const fieldKeys = Object.keys(REVIEW_FIELD_LABELS);
    const conflicts = R.detectFieldConflicts(current, out, fieldKeys);
    const conflictKeys = new Set(conflicts.map(x => x.key));

    importReviewDecisions = {};

    fieldKeys.forEach(key => {
      const incoming = String(out[key] || "").trim();
      if (!incoming) return;
      const existing = String(current[key] || "").trim();
      const conflict = conflictKeys.has(key);
      let decision = "incoming";
      if (conflict) decision = "current";
      else if (mode === "fill" && R.isMeaningful(existing)) decision = "current";
      importReviewDecisions[key] = decision;
      rows.push({
        key,
        label:REVIEW_FIELD_LABELS[key] || key,
        current:existing || "—",
        incoming,
        conflict
      });
    });

    const indicatorConflicts = R.detectIndicatorConflicts(current.indicators || [], out.indicators || []);
    const hasCurrentIndicators = (current.indicators || []).some(x =>
      R.isMeaningful(x.title) || R.isMeaningful(x.target) || R.isMeaningful(x.actual)
    );
    if (out.indicators?.length) {
      const conflict = indicatorConflicts.length > 0;
      importReviewDecisions.indicators = conflict ? "current" : (mode === "fill" && hasCurrentIndicators ? "current" : "incoming");
      rows.push({
        key:"indicators",
        label:"ตัวชี้วัด",
        current:summarizeIndicators(current.indicators),
        incoming:summarizeIndicators(out.indicators),
        conflict,
        detail:indicatorConflicts.map(x => `${x.title}: ${x.key} "${x.current}" ≠ "${x.incoming}"`).join(" · ")
      });
    }

    if (out.evidenceTypes?.length) {
      importReviewDecisions.evidenceTypes = mode === "replace" ? "incoming" : "merge";
      rows.push({
        key:"evidenceTypes",
        label:"Visual Evidence",
        current:(current.evidenceTypes || []).join(", ") || "—",
        incoming:out.evidenceTypes.join(", "),
        conflict:false,
        evidence:true
      });
    }

    lastConflictCount = conflicts.length + indicatorConflicts.length;
    aiConflictBadge.textContent = `${lastConflictCount} conflicts`;
    aiConflictBadge.classList.toggle("has-conflict", lastConflictCount > 0);

    aiImportReviewRows.innerHTML = rows.map(row => {
      const options = row.evidence
        ? `<option value="merge" ${importReviewDecisions[row.key] === "merge" ? "selected" : ""}>รวมรายการ</option>
           <option value="incoming" ${importReviewDecisions[row.key] === "incoming" ? "selected" : ""}>ใช้จาก AI</option>
           <option value="current">เก็บค่าเดิม</option>`
        : `<option value="incoming" ${importReviewDecisions[row.key] === "incoming" ? "selected" : ""}>ใช้จาก AI</option>
           <option value="current" ${importReviewDecisions[row.key] === "current" ? "selected" : ""}>เก็บค่าเดิม</option>`;
      return `
        <div class="review-row ${row.conflict ? "conflict" : ""}" data-review-key="${row.key}">
          <div class="review-label">${esc(row.label)}
            ${row.conflict ? '<span class="review-conflict-label">CONFLICT</span>' : ""}
          </div>
          <div class="review-value">${esc(row.current)}</div>
          <div class="review-value incoming">${esc(row.incoming)}${row.detail ? "\n" + esc(row.detail) : ""}</div>
          <div class="review-action"><select data-review-decision="${row.key}">${options}</select></div>
        </div>`;
    }).join("");

    aiImportReview.classList.toggle("hidden", rows.length === 0);
    return {conflicts:[...conflicts, ...indicatorConflicts], rows};
  }

  function applyAiImport(data, mode = "fill", decisions = importReviewDecisions) {
    const {out, warnings} = normalizeAiJson(data);
    const current = collectState();
    const merged = {...current};

    Object.entries(out).forEach(([key,val]) => {
      if (["indicators","evidenceTypes","importNotes"].includes(key)) return;
      const decision = decisions[key] || (mode === "replace" ? "incoming" : (R.isMeaningful(current[key]) ? "current" : "incoming"));
      if (decision === "incoming") merged[key] = val;
    });

    if (out.indicators.length && (decisions.indicators || "incoming") === "incoming") {
      merged.indicators = out.indicators;
    }

    if (out.evidenceTypes.length) {
      const decision = decisions.evidenceTypes || (mode === "replace" ? "incoming" : "merge");
      if (decision === "incoming") merged.evidenceTypes = out.evidenceTypes;
      if (decision === "merge") merged.evidenceTypes = [...new Set([...(current.evidenceTypes || []), ...out.evidenceTypes])];
    }

    merged.currentStep = 0;
    applyState(merged);
    injectFieldExamples();
    lastConflictCount = 0;
    save();
    showStep(0);
    return {warnings, importNotes: out.importNotes};
  }

  function renderEvidenceChecks(selected = []) {
    evidenceChecks.innerHTML = EVIDENCE_OPTIONS.map((label, i) => {
      const checked = selected.includes(label) ? "checked" : "";
      return `<label class="evidence-item"><input type="checkbox" name="evidenceType" value="${esc(label)}" ${checked}> <span>${esc(label)}</span></label>`;
    }).join("");
  }

  function readySourceDocuments() {
    return extractedDocuments.filter(doc => doc.status === "ready" && doc.text);
  }

  function sourceDocumentOptions(currentFile) {
    const docs = readySourceDocuments();
    const current = String(currentFile || "").trim();
    const options = ['<option value="">เลือกจาก Document Reader...</option>'];
    docs.forEach(doc => {
      options.push(`<option value="${esc(doc.name)}" ${doc.name === current ? "selected" : ""}>${esc(doc.name)} · ${esc(documentRoleLabel(doc.role))}</option>`);
    });
    if (current && !docs.some(doc => doc.name === current)) {
      options.push(`<option value="${esc(current)}" selected>${esc(current)} · ยังไม่ได้โหลดใน session</option>`);
    }
    return options.join("");
  }

  function sourcePageOptions(sourceFile, currentPage) {
    const doc = DA.findDocumentBySource(extractedDocuments, sourceFile);
    if (!doc || !doc.pages) return "";
    const current = DA.parseSourcePage(currentPage);
    const max = Math.min(doc.pages, 300);
    const options = ['<option value="">เลือกหน้าอย่างรวดเร็ว...</option>'];
    for (let page = 1; page <= max; page += 1) {
      options.push(`<option value="${page}" ${String(page) === current ? "selected" : ""}>หน้า ${page}</option>`);
    }
    return `
      <select class="source-page-select" data-source-page-select>
        ${options.join("")}
      </select>
      <small class="source-picker-help">ไฟล์นี้มี ${doc.pages} หน้า · เลือกหน้าได้ หรือพิมพ์ “ตาราง 2 / ภาคผนวก ก” เอง</small>`;
  }

  function indicatorCard(item, index) {
    item = {...R.normalizeIndicator(item), id:item.id || cryptoId()};
    const trace = R.validateIndicatorTrace(item);
    const calculated = R.formatCalculatedActual(item.actualNumerator, item.actualDenominator, 2);
    const traceClass = trace.ready ? "ok" : "warn";
    const traceText = trace.ready
      ? "ACTUAL มี trace ครบและผู้ใช้ยืนยันต้นฉบับแล้ว"
      : trace.issues.join(" · ");
    const mode = item.actualMode || "pending";
    const modeButtons = ACTUAL_MODES.map(([value,label]) =>
      `<button type="button" class="actual-mode-btn ${mode === value ? "selected" : ""}" data-actual-mode="${value}">${esc(label)}</button>`
    ).join("");

    let actualEntry = "";
    if (mode === "pending") {
      actualEntry = `
        <input type="hidden" data-field="actual" value="PENDING">
        <div class="actual-pending-note">ยังไม่มีผลจริง — ระบบจะเก็บ ACTUAL เป็น PENDING และยังไม่อนุญาตให้ผ่าน Final</div>`;
    } else if (mode === "fraction") {
      actualEntry = `
        <input type="hidden" data-field="actual" value="${esc(item.actual)}">
        <div class="actual-entry fraction">
          <label>จำนวนที่ผ่าน / ตัวตั้ง
            <input inputmode="decimal" data-field="actualNumerator" value="${esc(item.actualNumerator)}" placeholder="เช่น 24">
          </label>
          <span class="actual-unit">÷</span>
          <label>จำนวนทั้งหมด / ตัวหาร
            <input inputmode="decimal" data-field="actualDenominator" value="${esc(item.actualDenominator)}" placeholder="เช่น 30">
          </label>
          <div class="actual-result" data-calc-output>${esc(calculated || "รอคำนวณ")}</div>
        </div>`;
    } else if (mode === "percent") {
      const percentValue = String(item.actual || "").replace("%","").trim();
      actualEntry = `
        <div class="actual-entry">
          <label>ผลจริงเป็นร้อยละ (%)
            <input inputmode="decimal" data-actual-percent value="${esc(percentValue)}" placeholder="เช่น 80">
          </label>
        </div>`;
    } else if (mode === "score") {
      actualEntry = `
        <div class="actual-entry">
          <label>คะแนน / ค่า ACTUAL
            <input data-field="actual" value="${esc(item.actual)}" placeholder="เช่น 15.6/20 หรือ ค่าเฉลี่ย 4.25">
          </label>
        </div>`;
    } else {
      actualEntry = `
        <div class="actual-entry">
          <label>ข้อความผลจริง
            <input data-field="actual" value="${esc(item.actual)}" placeholder="เช่น ดำเนินการครบ 6/6 คน">
          </label>
        </div>`;
    }

    return `
      <article class="indicator-card" data-id="${item.id}">
        <div class="card-head">
          <h3>ตัวชี้วัดที่ ${index + 1}</h3>
          ${indicators.length > 1 ? '<button type="button" class="remove-indicator">ลบ</button>' : ''}
        </div>

        <div class="grid two">
          <label class="wide">เรื่อง / ตัวชี้วัด
            <input data-field="title" value="${esc(item.title)}" placeholder="เช่น ผู้เรียนผ่านค่าเป้าหมาย">
            <small class="field-example">นักเรียนกลุ่มเป้าหมายผ่านเกณฑ์การอ่าน</small>
          </label>
          <label class="wide">TARGET
            <input data-field="target" value="${esc(item.target)}" placeholder="เช่น ≥70%">
            <div class="target-helper" aria-label="ตัวช่วยใส่เครื่องหมาย TARGET">
              <span>ใส่เครื่องหมายง่าย ๆ:</span>
              <button type="button" data-target-prefix="≥" title="ไม่น้อยกว่า">≥ <small>ไม่น้อยกว่า</small></button>
              <button type="button" data-target-prefix="≤" title="ไม่เกิน">≤ <small>ไม่เกิน</small></button>
              <button type="button" data-target-prefix="=" title="เท่ากับ">= <small>เท่ากับ</small></button>
              <button type="button" data-target-suffix="%" title="ร้อยละ">% <small>ร้อยละ</small></button>
            </div>
            <small class="field-example">ตัวอย่าง: กด ≥ → พิมพ์ 70 → กด % จะได้ ≥70%</small>
          </label>

          <div class="actual-mode-wrap">
            <span class="actual-mode-label">ACTUAL — เลือกรูปแบบผลจริงก่อนกรอก</span>
            <div class="actual-mode-options">${modeButtons}</div>
          </div>

          ${actualEntry}

          <label class="wide">หลักฐาน ACTUAL
            <input data-field="evidence" value="${esc(item.evidence)}" placeholder="เช่น แบบประเมิน / log / รายงานผล">
            <small class="field-example">แบบประเมินปลายรอบ + ตารางสรุปผล / log ที่ตรวจสอบได้</small>
          </label>
        </div>

        <details class="indicator-trace" ${R.isMeaningful(item.actual) ? "open" : ""}>
          <summary>Evidence Trace — กดเพื่อระบุที่มา / หน้า / ช่วงเวลา / กลุ่มเป้าหมาย / การยืนยัน</summary>
          <div class="trace-grid">
            <div class="trace-source-picker">
              <label>ไฟล์ต้นทาง
                <input data-field="sourceFile" value="${esc(item.sourceFile)}" placeholder="เช่น results.pdf">
              </label>
              <div class="source-picker-tools">
                <select data-source-doc-select aria-label="เลือกไฟล์ต้นทางจาก Document Reader">
                  ${sourceDocumentOptions(item.sourceFile)}
                </select>
                <button type="button" class="btn btn-secondary source-pick-btn" data-pick-source-file>เลือกไฟล์ต้นทาง</button>
              </div>
              <small class="source-picker-help">เลือกไฟล์จากเครื่องผ่าน Document Reader หรือเลือกจากไฟล์ที่อ่านแล้วใน session นี้</small>
            </div>
            <label>หน้า / ตำแหน่ง
              <input data-field="sourcePage" value="${esc(item.sourcePage)}" placeholder="เช่น หน้า 4 หรือ ตาราง 2">
              ${sourcePageOptions(item.sourceFile, item.sourcePage)}
            </label>
            <label>ช่วงเวลา
              <input data-field="period" value="${esc(item.period)}" placeholder="เช่น 1 เม.ย. – 30 ก.ย. 2570">
            </label>
            <label>กลุ่มเป้าหมาย / ประชากร
              <input data-field="population" value="${esc(item.population)}" placeholder="เช่น นักเรียน ป.3 จำนวน 30 คน">
            </label>
            <label>Cohort / กลุ่มเดียวกัน
              <input data-field="cohortId" value="${esc(item.cohortId)}" placeholder="เช่น P3-2570">
            </label>
            <label>การตรวจต้นฉบับ
              <select data-field="verification">
                <option value="unverified" ${item.verification !== "verified" ? "selected" : ""}>UNVERIFIED — ยังไม่ได้ตรวจต้นฉบับ</option>
                <option value="verified" ${item.verification === "verified" ? "selected" : ""}>VERIFIED — ตรวจต้นฉบับแล้ว</option>
              </select>
            </label>
          </div>
          <div class="trace-status ${traceClass}" data-trace-status>${esc(traceText)}</div>
        </details>

        <div class="indicator-example"><strong>Evidence Trace อยู่ที่ STEP 3 นี้</strong> ใต้ตัวชี้วัดแต่ละข้อ และ STEP 7 จะมีปุ่มพากลับมาที่รายการนี้ได้โดยตรง</div>
      </article>`;
  }

  function renderIndicators() {
    indicatorCards.innerHTML = indicators.map(indicatorCard).join("");
  }

  function syncIndicatorsFromDom() {
    [...indicatorCards.querySelectorAll(".indicator-card")].forEach(card => {
      const item = indicators.find(x => x.id === card.dataset.id);
      if (!item) return;
      card.querySelectorAll("[data-field]").forEach(el => item[el.dataset.field] = el.value.trim());
    });
  }

  function collectState() {
    syncIndicatorsFromDom();
    const data = {};
    new FormData(form).forEach((v,k) => {
      if (k !== "evidenceType") data[k] = v;
    });
    data.evidenceTypes = [...document.querySelectorAll('input[name="evidenceType"]:checked')].map(x => x.value);
    data.indicators = indicators.map(item => R.normalizeIndicator(item));
    data.visualNamingPlan = VE.normalizePlan(visualNamingPlan);
    data.visualAssets = visualAssets.map(asset => ({
      id: asset.id,
      originalName: asset.originalName,
      canonicalName: asset.canonicalName,
      slotId: asset.slotId,
      evidenceType: asset.evidenceType,
      mimeType: asset.mimeType,
      size: asset.size
    }));
    data.evidenceReviewNotes = evidenceReviewNotes.map(item => ER.normalizeNote(item));
    data.selectedFileNames = selectedFileNames;
    data.currentStep = currentStep;
    data.version = 3;
    data.schema_version = M.PROJECT_SCHEMA;
    return data;
  }

  function applyState(data) {
    if (!data || typeof data !== "object") return;
    data = M.migrateProject(data);
    Object.entries(data).forEach(([k,v]) => {
      if (["evidenceTypes","indicators","visualNamingPlan","visualAssets","evidenceReviewNotes","selectedFileNames","currentStep","version","schema_version"].includes(k)) return;
      const el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) {
        const target = [...document.querySelectorAll(`[name="${CSS.escape(k)}"]`)].find(x => x.value === String(v));
        if (target) target.checked = true;
      } else {
        el.value = v ?? "";
      }
    });
    indicators = Array.isArray(data.indicators) && data.indicators.length
      ? data.indicators.map(item => ({...R.normalizeIndicator(item), id:item.id || cryptoId()}))
      : defaultIndicators();
    visualPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    visualPreviewUrls.clear();
    visualAssetFiles.clear();
    visualNamingPlan = data.visualNamingPlan ? VE.normalizePlan(data.visualNamingPlan) : VE.defaultPlan();
    visualAssets = Array.isArray(data.visualAssets)
      ? data.visualAssets.map(asset => ({
          id: asset.id || cryptoId(),
          originalName: String(asset.originalName || asset.canonicalName || ""),
          canonicalName: String(asset.canonicalName || asset.originalName || ""),
          slotId: String(asset.slotId || ""),
          evidenceType: String(asset.evidenceType || ""),
          mimeType: String(asset.mimeType || ""),
          size: Number(asset.size) || 0
        }))
      : (Array.isArray(data.selectedFileNames)
          ? data.selectedFileNames.map(name => ({
              id: cryptoId(),
              originalName: String(name),
              canonicalName: String(name),
              slotId: "",
              evidenceType: "",
              mimeType: "",
              size: 0
            }))
          : []);
    evidenceReviewNotes = Array.isArray(data.evidenceReviewNotes)
      ? data.evidenceReviewNotes.map(item => ({...ER.normalizeNote(item), id:item.id || cryptoId()}))
      : [];
    selectedFileNames = [];
    renderIndicators();
    renderEvidenceChecks(Array.isArray(data.evidenceTypes) ? data.evidenceTypes : []);
    renderFileNames();
    renderEvidenceReview();
    currentStep = Number.isInteger(data.currentStep) ? Math.max(0, Math.min(7, data.currentStep)) : 0;
    syncSmartEditorsFromFields();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
      saveState.textContent = "บันทึกแล้ว";
      setRuntimeHealth("พร้อมใช้งาน · บันทึกข้อมูลใน Browser แล้ว", "ok");
      window.setTimeout(() => saveState.textContent = "บันทึกอัตโนมัติ", 900);
    } catch (err) {
      saveState.textContent = "บันทึกอัตโนมัติไม่ได้";
      setRuntimeHealth("localStorage ใช้งานไม่ได้ · ควร Export Project เพื่อสำรองข้อมูล", "warn");
      if (!storageWarningShown) {
        storageWarningShown = true;
        notify("Browser ไม่อนุญาตให้บันทึก localStorage หรือพื้นที่ไม่พอ กรุณาใช้ “ส่งออกโปรเจกต์” เพื่อสำรองข้อมูล", "warn", 9000);
      }
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) applyState(JSON.parse(raw));
      else {
        indicators = defaultIndicators();
        renderIndicators();
        renderEvidenceChecks();
        renderFileNames();
        renderEvidenceReview();
      }
    } catch (err) {
      indicators = defaultIndicators();
      renderIndicators();
      renderEvidenceChecks();
      renderFileNames();
      renderEvidenceReview();
      setRuntimeHealth("อ่านข้อมูลเดิมจาก Browser ไม่สำเร็จ · เริ่มฟอร์มใหม่", "warn");
      window.setTimeout(() => notify("อ่านข้อมูลที่บันทึกไว้เดิมไม่สำเร็จ ระบบเริ่มฟอร์มใหม่ กรุณา Import Project JSON หากมีไฟล์สำรอง", "warn", 8500), 0);
    }
  }

  function showStep(index) {
    currentStep = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((p,i) => p.classList.toggle("active", i === currentStep));
    stepLinks.forEach((b,i) => b.classList.toggle("active", i === currentStep));
    const pct = ((currentStep + 1) / panels.length) * 100;
    progressBar.style.width = pct + "%";
    stepLabel.textContent = `ขั้นที่ ${currentStep + 1} จาก ${panels.length}`;
    prevBtn.style.visibility = currentStep === 0 ? "hidden" : "visible";
    nextBtn.textContent = currentStep === panels.length - 1 ? "ตรวจอีกครั้ง" : "ถัดไป →";
    if (currentStep === 6) renderReadiness();
    if (currentStep === 7) renderReadiness();
    save();
    window.scrollTo({top: 0, behavior: "smooth"});
  }

  function getReadiness() {
    syncIndicatorsFromDom();
    const basics = [
      ["ชื่อผู้รับการประเมิน", value("presenterName")],
      ["ตำแหน่ง", value("position")],
      ["สถานศึกษา/หน่วยงาน", value("organization")],
      ["ประเด็นท้าทาย", value("challengeTitle")],
      ["ปัญหา/ความต้องการจำเป็น", value("developmentNeed")]
    ];
    const processItems = [
      ["Model / แนวทางหลัก", value("managementModel")],
      ["กระบวนการดำเนินงาน", value("processNotes")]
    ];
    const indicatorTargets = indicators.map((x,i) => [`TARGET ตัวชี้วัด ${i+1}`, R.isMeaningful(x.title) && R.isMeaningful(x.target)]);
    const traces = indicators.map(item => R.validateIndicatorTrace(item));
    const indicatorActuals = traces.map((trace,i) => [`ACTUAL ตัวชี้วัด ${i+1}`, trace.ready]);
    const qual = [
      ["ผลเชิงคุณภาพ", R.isMeaningful(value("learnerOutcome")) || R.isMeaningful(value("staffOutcome")) || R.isMeaningful(value("workOutcome")) || R.isMeaningful(value("organizationOutcome"))],
      ["Journey ก่อน–หลัง", R.isMeaningful(value("journeyBefore")) && R.isMeaningful(value("journeyAfter")) && R.isMeaningful(value("journeyEvidence"))]
    ];
    const visuals = [...document.querySelectorAll('input[name="evidenceType"]:checked')].length;

    const draftChecks = [...basics, ...processItems, ...indicatorTargets];
    const finalChecks = [...draftChecks, ...indicatorActuals, ...qual, ["Visual Evidence", visuals >= 3]];

    const score = arr => Math.round(arr.filter(([,v]) => Boolean(v)).length / arr.length * 100);
    const missing = finalChecks.filter(([,v]) => !v).map(([label]) => label);
    const traceIssues = [];
    traces.forEach((trace,i) => {
      if (!trace.ready) trace.issues.forEach(issue => traceIssues.push(`ตัวชี้วัด ${i+1}: ${issue}`));
    });

    const actualCount = traces.filter(x => x.ready).length;
    const hasActualCount = traces.filter(x => x.hasActual).length;
    const tracePendingCount = traces.filter(x => x.hasActual && !x.ready).length;
    const pendingCount = indicators.length - actualCount;
    const finalScore = score(finalChecks);

    return {
      draft: score(draftChecks),
      final: finalScore,
      missing,
      traceIssues,
      actualCount,
      hasActualCount,
      tracePendingCount,
      conflictCount:lastConflictCount,
      pendingCount,
      finalReady: finalScore === 100 && lastConflictCount === 0
    };
  }

  function getDocumentAudit() {
    syncIndicatorsFromDom();
    return DA.audit(extractedDocuments, indicators, R.parsePageSpec);
  }

  function sourceExcerptForIndicator(item) {
    if (!item || !R.isMeaningful(item.sourceFile)) return null;
    const doc = DA.findDocumentBySource(extractedDocuments, item.sourceFile);
    if (!doc) return null;

    const pageSpec = DA.parseSourcePage(item.sourcePage);
    let text = "";
    let label = doc.name;

    if (pageSpec && doc.pages && Array.isArray(doc.pageTexts)) {
      const parsed = R.parsePageSpec(pageSpec, doc.pages);
      if (!parsed.error) {
        const wanted = new Set(parsed.pages);
        text = doc.pageTexts
          .filter(page => wanted.has(page.page))
          .map(page => `หน้า ${page.page}: ${page.text}`)
          .join("\n\n");
        label += ` · หน้า ${pageSpec}`;
      }
    }

    if (!text) text = doc.text || "";
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > 520) text = text.slice(0, 520) + "…";
    return {doc, text, label, pageSpec};
  }

  function renderProjectDashboard(r, audit) {
    const readyDocs = extractedDocuments.filter(doc => doc.status === "ready").length;
    const sourceRefCount = indicators.filter(item => R.isMeaningful(item.sourceFile)).length;
    const pendingChecks = new Set([...r.missing, ...r.traceIssues]).size;
    const cards = [
      {value:r.draft + "%", label:"ข้อมูลพร้อมสำหรับ Draft", action:"step1", tone:r.draft === 100 ? "ok" : "info"},
      {value:`${r.actualCount}/${indicators.length}`, label:"ACTUAL ที่ Verified", action:"step3", tone:r.actualCount === indicators.length ? "ok" : "warn"},
      {value:String(readyDocs), label:"เอกสารใน session", action:"reader", tone:readyDocs ? "info" : "warn"},
      {value:`${audit.sourceLinks}/${sourceRefCount}`, label:"Source links ที่จับคู่ได้", action:"step3", tone:sourceRefCount && audit.sourceLinks === sourceRefCount ? "ok" : "info"},
      {value:String(audit.issueCount), label:"Source audit issues", action:"audit", tone:audit.issueCount ? "warn" : "ok"},
      {value:String(pendingChecks), label:"รายการที่ยังต้องตรวจ", action:"missing", tone:pendingChecks ? "warn" : "ok"}
    ];
    projectDashboardGrid.innerHTML = cards.map(card => `
      <button type="button" class="dashboard-card ${card.tone}" data-dashboard-action="${card.action}">
        <strong>${esc(card.value)}</strong>
        <span>${esc(card.label)}</span>
      </button>`).join("");
  }

  function auditItem(type, title, message, actions = "") {
    return `
      <article class="audit-item ${type}">
        <span class="audit-icon">${type === "ok" ? "✓" : "!"}</span>
        <div class="audit-main">
          <strong>${esc(title)}</strong>
          <small>${esc(message)}</small>
        </div>
        <div class="audit-actions">${actions}</div>
      </article>`;
  }

  function renderSourceAudit(audit) {
    sourceAuditSummary.innerHTML = [
      `<span class="audit-chip ${audit.duplicates.length ? "warn" : "ok"}">ไฟล์ซ้ำ/ใกล้ซ้ำ: ${audit.duplicates.length}</span>`,
      `<span class="audit-chip ${audit.versionConflicts.length ? "warn" : "ok"}">เวอร์ชันชื่อใกล้กัน: ${audit.versionConflicts.length}</span>`,
      `<span class="audit-chip ${audit.roleConflicts.length ? "warn" : "ok"}">Role mismatch: ${audit.roleConflicts.length}</span>`,
      `<span class="audit-chip ${audit.sourceIssues.length ? "warn" : "ok"}">Source link issues: ${audit.sourceIssues.length}</span>`
    ].join("");

    const rows = [];

    audit.duplicates.forEach(issue => {
      const similarity = Math.round((issue.similarity || 0) * 100);
      rows.push(auditItem(
        "warn",
        issue.type === "exact_duplicate" ? "พบเอกสารซ้ำ" : "พบเอกสารใกล้ซ้ำ",
        `${issue.aName} ↔ ${issue.bName} · similarity ${similarity}%`,
        `<button type="button" class="btn btn-ghost" data-open-audit-docs="${issue.aId},${issue.bId}">เปิดใน Reader</button>`
      ));
    });

    audit.versionConflicts.forEach(issue => {
      rows.push(auditItem(
        "warn",
        "อาจเป็นคนละเวอร์ชัน",
        `${issue.aName} ↔ ${issue.bName} · ${issue.message}`,
        `<button type="button" class="btn btn-ghost" data-open-audit-docs="${issue.aId},${issue.bId}">ตรวจคู่ไฟล์</button>`
      ));
    });

    audit.roleConflicts.forEach(issue => {
      rows.push(auditItem(
        "warn",
        "บทบาทเอกสารไม่ตรงกัน",
        `${issue.aName} [${documentRoleLabel(issue.roleA)}] ↔ ${issue.bName} [${documentRoleLabel(issue.roleB)}]`,
        `<button type="button" class="btn btn-ghost" data-open-audit-docs="${issue.aId},${issue.bId}">แก้ Role</button>`
      ));
    });

    audit.sourceIssues.forEach(issue => {
      const item = indicators[issue.indicatorIndex];
      rows.push(auditItem(
        "warn",
        `Source ของตัวชี้วัด ${issue.indicatorIndex + 1}`,
        `${item?.title || "ยังไม่มีชื่อ"} · ${issue.sourceFile || ""} · ${issue.message}`,
        `<button type="button" class="btn btn-ghost" data-edit-audit-indicator="${item?.id || ""}">แก้ที่ STEP 3</button>`
      ));
    });

    if (!rows.length) {
      const message = extractedDocuments.length
        ? "ไม่พบไฟล์ซ้ำ เวอร์ชันชนกัน Role mismatch หรือ Source link issue ใน session นี้"
        : "ยังไม่มีเอกสารใน Document Reader — Source Audit จะทำงานเมื่อโหลดเอกสารใน session นี้";
      rows.push(auditItem("ok", "Source Audit", message));
    }

    sourceAuditList.innerHTML = rows.join("");
  }

  function renderDocumentAuditMini() {
    if (!documentAuditMini) return;
    const audit = getDocumentAudit();
    const ready = extractedDocuments.filter(doc => doc.status === "ready").length;
    documentAuditMini.innerHTML = [
      `<span class="audit-chip">พร้อมอ่าน ${ready} ไฟล์</span>`,
      `<span class="audit-chip ${audit.duplicates.length ? "warn" : "ok"}">ซ้ำ ${audit.duplicates.length}</span>`,
      `<span class="audit-chip ${audit.versionConflicts.length ? "warn" : "ok"}">เวอร์ชัน ${audit.versionConflicts.length}</span>`,
      `<span class="audit-chip ${audit.roleConflicts.length ? "warn" : "ok"}">Role ${audit.roleConflicts.length}</span>`
    ].join("");
  }

  function openDocumentReader() {
    documentReaderModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
    rebuildDocumentIntelligenceIndex({rerunSearch:true});
    renderExtractedDocuments();
  }

  function openIndicatorSource(id) {
    syncIndicatorsFromDom();
    const item = indicators.find(x => x.id === id);
    if (!item) return;
    const doc = DA.findDocumentBySource(extractedDocuments, item.sourceFile);

    if (!doc) {
      notify("ยังไม่พบไฟล์ " + (item.sourceFile || "ต้นทาง") + " ใน Document Reader ของ session นี้ กรุณาเลือกไฟล์ก่อน", "warn", 6500);
      openDocumentReader();
      return;
    }

    const pageSpec = DA.parseSourcePage(item.sourcePage);
    if (pageSpec && doc.pages) {
      const parsed = R.parsePageSpec(pageSpec, doc.pages);
      if (!parsed.error) doc.pageSpec = pageSpec;
    }
    doc.include = true;
    openDocumentReader();
    window.requestAnimationFrame(() => {
      const card = documentList.querySelector(`[data-doc-id="${CSS.escape(doc.id)}"]`);
      if (!card) return;
      card.classList.add("source-focus");
      card.scrollIntoView({behavior:"smooth", block:"center"});
      window.setTimeout(() => card.classList.remove("source-focus"), 1900);
    });
  }

  function assignDocumentToIndicator(docId) {
    const doc = extractedDocuments.find(item => item.id === docId);
    const item = indicators.find(indicator => indicator.id === sourcePickerIndicatorId);
    if (!doc || !item) return;

    item.sourceFile = doc.name;
    item.sourcePage = doc.pageSpec ? "หน้า " + doc.pageSpec : "";
    item.verification = "unverified";

    closeDocumentReaderModal();
    renderIndicators();
    save();

    window.requestAnimationFrame(() => {
      const card = indicatorCards.querySelector(`[data-id="${CSS.escape(item.id)}"]`);
      if (!card) return;
      const trace = card.querySelector(".indicator-trace");
      if (trace) trace.open = true;
      card.classList.add("focus-pulse");
      card.scrollIntoView({behavior:"smooth", block:"center"});
      window.setTimeout(() => card.classList.remove("focus-pulse"), 1800);
    });

    notify(`เลือก ${doc.name} เป็น Source แล้ว${doc.pages ? " · เลือกหน้าที่มีหลักฐานต่อได้ใน Evidence Trace" : ""}`, "success", 6500);
  }

  function openAuditDocuments(ids) {
    const wanted = String(ids || "").split(",").filter(Boolean);
    if (!wanted.length) return;
    wanted.forEach(id => {
      const doc = extractedDocuments.find(item => item.id === id);
      if (doc) doc.include = true;
    });
    openDocumentReader();
    window.requestAnimationFrame(() => {
      wanted.forEach(id => documentList.querySelector(`[data-doc-id="${CSS.escape(id)}"]`)?.classList.add("source-focus"));
      const first = documentList.querySelector(`[data-doc-id="${CSS.escape(wanted[0])}"]`);
      first?.scrollIntoView({behavior:"smooth", block:"center"});
      window.setTimeout(() => wanted.forEach(id => documentList.querySelector(`[data-doc-id="${CSS.escape(id)}"]`)?.classList.remove("source-focus")), 1900);
    });
  }

  function renderReadiness() {
    const r = getReadiness();
    const audit = getDocumentAudit();

    renderProjectDashboard(r, audit);
    renderSourceAudit(audit);

    document.getElementById("draftScore").textContent = r.draft + "%";
    document.getElementById("finalScore").textContent = r.final + "%";
    document.getElementById("draftBar").style.width = r.draft + "%";
    document.getElementById("finalBar").style.width = r.final + "%";

    const state = document.getElementById("readinessState");
    state.className = "readiness-state " + (r.finalReady ? "ready" : "draft");
    state.textContent = r.finalReady
      ? "READY FOR FINAL — ACTUAL ผ่าน Evidence Trace และไม่มี import conflict ค้าง"
      : "DRAFT — ยังมีข้อมูล/หลักฐานที่ต้องตรวจให้ครบก่อน Final";

    document.getElementById("statusSummary").innerHTML = [
      `<span class="tag fact">FACT: ข้อมูลพื้นฐาน</span>`,
      `<span class="tag target">TARGET: ${indicators.filter(x=>R.isMeaningful(x.target)).length}</span>`,
      `<span class="tag actual">ACTUAL VERIFIED: ${r.actualCount}</span>`,
      `<span class="tag context">CONTEXT: ${lines(value("contextNotes")).length}</span>`,
      `<span class="tag pending">PENDING: ${r.pendingCount + r.missing.length}</span>`
    ].join("");

    document.getElementById("integritySummary").innerHTML = [
      `<article class="integrity-card"><strong>${r.actualCount}/${indicators.length}</strong><span>ACTUAL trace ครบ + verified</span></article>`,
      `<article class="integrity-card"><strong>${r.tracePendingCount}</strong><span>มี ACTUAL แต่ trace ยังไม่ครบ</span></article>`,
      `<article class="integrity-card"><strong>${audit.issueCount}</strong><span>Source audit issues ใน session</span></article>`
    ].join("");

    readinessIndicatorList.innerHTML = indicators.map((item,index) => {
      const trace = R.validateIndicatorTrace(item);
      const status = trace.ready ? "พร้อม" : (trace.hasActual ? "ต้องตรวจ Trace" : "PENDING");
      const badgeClass = trace.ready ? "ok" : "warn";
      const actual = R.isMeaningful(item.actual) ? item.actual : "PENDING";
      const issues = trace.issues.length
        ? trace.issues.map(x => `<div class="readiness-issue">${esc(x)}</div>`).join("")
        : '<div class="readiness-issue" style="border-left-color:#20a47a;background:#f0fbf7;color:#087a5b">Evidence Trace ครบและยืนยันต้นฉบับแล้ว</div>';

      const sourceInfo = sourceExcerptForIndicator(item);
      let sourceBlock = "";
      if (R.isMeaningful(item.sourceFile)) {
        if (sourceInfo) {
          sourceBlock = `
            <div class="source-excerpt">
              <strong>Source preview — ${esc(sourceInfo.label)}</strong>
              ${esc(sourceInfo.text || "พบไฟล์ต้นทาง แต่ยังไม่มีข้อความ Preview")}
            </div>
            <div class="source-nav-actions">
              <button type="button" class="btn btn-ghost" data-open-indicator-source="${item.id}">เปิด Source ใน Document Reader</button>
            </div>`;
        } else {
          sourceBlock = `
            <div class="source-excerpt">
              <strong>Source ยังไม่โหลดใน session</strong>
              ${esc(item.sourceFile)} ${item.sourcePage ? "· " + esc(item.sourcePage) : ""}
            </div>
            <div class="source-nav-actions">
              <button type="button" class="btn btn-ghost" data-open-indicator-source="${item.id}">เปิด Document Reader เพื่อเลือกไฟล์</button>
            </div>`;
        }
      }

      return `
        <details class="readiness-indicator">
          <summary>
            <div class="readiness-indicator-summary">
              <span class="readiness-index">${index + 1}</span>
              <div class="readiness-title">
                <strong>${esc(item.title || "ยังไม่ได้ตั้งชื่อตัวชี้วัด")}</strong>
                <small>TARGET ${esc(item.target || "—")} · ACTUAL ${esc(actual)}</small>
              </div>
              <span class="readiness-badge ${badgeClass}">${esc(status)}</span>
            </div>
          </summary>
          <div class="readiness-indicator-body">
            <div class="readiness-detail-grid">
              <div class="readiness-detail"><span>ACTUAL TYPE</span><strong>${esc(ACTUAL_MODES.find(x=>x[0]===item.actualMode)?.[1] || item.actualMode || "—")}</strong></div>
              <div class="readiness-detail"><span>EVIDENCE</span><strong>${esc(item.evidence || "PENDING")}</strong></div>
              <div class="readiness-detail"><span>SOURCE</span><strong>${esc(item.sourceFile || "PENDING")}${item.sourcePage ? " · " + esc(item.sourcePage) : ""}</strong></div>
              <div class="readiness-detail"><span>PERIOD</span><strong>${esc(item.period || "PENDING")}</strong></div>
              <div class="readiness-detail"><span>POPULATION</span><strong>${esc(item.population || "PENDING")}</strong></div>
              <div class="readiness-detail"><span>VERIFICATION</span><strong>${item.verification === "verified" ? "VERIFIED — ตรวจต้นฉบับแล้ว" : "UNVERIFIED — ยังไม่ได้ตรวจต้นฉบับ"}</strong></div>
            </div>
            ${sourceBlock}
            <div class="readiness-issues">${issues}</div>
            <button type="button" class="btn btn-secondary edit-indicator-btn" data-edit-indicator="${item.id}">แก้ไขตัวชี้วัดนี้ที่ STEP 3</button>
          </div>
        </details>`;
    }).join("");

    const generalMissing = r.missing.filter(label => !label.startsWith("ACTUAL ตัวชี้วัด"));
    document.getElementById("missingList").innerHTML = generalMissing.length
      ? "<h3>สิ่งอื่นที่ยังขาด / ต้องตรวจ</h3>" + [...new Set(generalMissing)].map(x => `<div class="missing-item">${esc(x)}</div>`).join("")
      : '<div class="tip"><strong>ตัวชี้วัดดูรายละเอียดด้านบน:</strong> รายการ ACTUAL และ Evidence Trace แสดงแยกเป็นรายข้อแล้ว</div>';
  }

  function goToIndicatorInStep3(id) {
    showStep(2);
    window.requestAnimationFrame(() => {
      const card = indicatorCards.querySelector(`[data-id="${CSS.escape(id)}"]`);
      if (!card) return;
      const trace = card.querySelector(".indicator-trace");
      if (trace) trace.open = true;
      card.classList.add("focus-pulse");
      card.scrollIntoView({behavior:"smooth", block:"center"});
      window.setTimeout(() => card.classList.remove("focus-pulse"), 1800);
    });
  }

  function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return value + " B";
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
    return (value / (1024 * 1024)).toFixed(1) + " MB";
  }

  function visualSlotById(id) {
    return VE.normalizePlan(visualNamingPlan).slots.find(slot => slot.id === id) || null;
  }

  function syncSelectedVisualNames() {
    selectedFileNames = visualAssets
      .map(asset => String(asset.canonicalName || asset.originalName || "").trim())
      .filter(Boolean);
  }

  function revokeVisualPreview(id) {
    const url = visualPreviewUrls.get(id);
    if (url) URL.revokeObjectURL(url);
    visualPreviewUrls.delete(id);
  }

  function visualPreviewFor(asset) {
    const file = visualAssetFiles.get(asset.id);
    if (!file || !String(file.type || "").startsWith("image/")) return "";
    if (!visualPreviewUrls.has(asset.id)) {
      visualPreviewUrls.set(asset.id, URL.createObjectURL(file));
    }
    return visualPreviewUrls.get(asset.id);
  }

  function visualSlotOptions(currentSlotId) {
    const slots = VE.normalizePlan(visualNamingPlan).slots;
    return ['<option value="">ไม่กำหนด slot / ใช้ชื่อเอง</option>']
      .concat(slots.map(slot =>
        `<option value="${esc(slot.id)}" ${slot.id === currentSlotId ? "selected" : ""}>${esc(slot.filename)} · ${esc(slot.label)}</option>`
      )).join("");
  }

  function visualEvidenceOptions(current) {
    return ['<option value="">ยังไม่ระบุประเภทภาพ</option>']
      .concat(EVIDENCE_OPTIONS.map(label =>
        `<option value="${esc(label)}" ${label === current ? "selected" : ""}>${esc(label)}</option>`
      )).join("");
  }

  function renderVisualNamingStatus() {
    const normalized = VE.normalizePlan(visualNamingPlan);
    if (visualNamingPlanStatus) {
      visualNamingPlanStatus.textContent = `${normalized.title} · ${normalized.slots.length} slots`;
    }
  }

  function renderFileNames() {
    syncSelectedVisualNames();
    renderVisualNamingStatus();

    const canonicalCounts = new Map();
    selectedFileNames.forEach(name => canonicalCounts.set(name.toLowerCase(), (canonicalCounts.get(name.toLowerCase()) || 0) + 1));
    const duplicateCount = [...canonicalCounts.values()].filter(count => count > 1).length;
    const mismatchCount = visualAssets.filter(asset =>
      asset.canonicalName && asset.originalName && !VE.fileExtMatches(asset.canonicalName, asset.originalName)
    ).length;
    const withPreview = visualAssets.filter(asset => visualAssetFiles.has(asset.id)).length;

    if (visualFileSummary) {
      visualFileSummary.innerHTML = visualAssets.length
        ? `<span>ทั้งหมด <strong>${visualAssets.length}</strong> ไฟล์</span>
           <span>Preview ใน session <strong>${withPreview}</strong></span>
           <span class="${duplicateCount ? "warn" : ""}">ชื่อซ้ำ <strong>${duplicateCount}</strong></span>
           <span class="${mismatchCount ? "warn" : ""}">นามสกุลไม่ตรงแผน <strong>${mismatchCount}</strong></span>`
        : '<span>ยังไม่ได้แนบ Visual Evidence</span>';
    }

    if (!visualAssets.length) {
      selectedFileList.innerHTML = '<div class="empty-state">เลือกภาพด้านบน แล้ว Preview และชื่อไฟล์มาตรฐานจะปรากฏที่นี่</div>';
      return;
    }

    selectedFileList.innerHTML = visualAssets.map((asset,index) => {
      const preview = visualPreviewFor(asset);
      const file = visualAssetFiles.get(asset.id);
      const slot = visualSlotById(asset.slotId);
      const canonical = asset.canonicalName || asset.originalName;
      const duplicate = canonical && (canonicalCounts.get(canonical.toLowerCase()) || 0) > 1;
      const extMismatch = canonical && asset.originalName && !VE.fileExtMatches(canonical, asset.originalName);
      const resolvedName = VE.resolvedDownloadName(canonical, asset.originalName);
      const status = duplicate
        ? '<span class="visual-status warn">ชื่อมาตรฐานซ้ำ</span>'
        : extMismatch
          ? `<span class="visual-status warn">นามสกุลไฟล์จริงไม่ตรงแผน · ดาวน์โหลดจะใช้ ${esc(resolvedName)}</span>`
          : '<span class="visual-status ok">ชื่อพร้อมใช้</span>';

      const previewHtml = preview
        ? `<img src="${preview}" alt="Preview ${esc(asset.originalName)}" loading="lazy">`
        : `<div class="visual-preview-placeholder"><strong>${esc((VE.extension(asset.originalName) || "FILE").toUpperCase())}</strong><span>${file ? "ไม่มี image preview" : "เลือกไฟล์อีกครั้งหลัง refresh เพื่อดู Preview"}</span></div>`;

      return `
        <article class="visual-file-card" data-visual-id="${asset.id}">
          <div class="visual-preview">${previewHtml}<span class="visual-order">#${index + 1}</span></div>
          <div class="visual-file-body">
            <div class="visual-original">
              <span>ไฟล์ต้นฉบับ</span>
              <strong title="${esc(asset.originalName)}">${esc(asset.originalName || "ไม่พบไฟล์ใน session")}</strong>
              <small>${esc(asset.mimeType || file?.type || "unknown")} · ${formatBytes(asset.size || file?.size || 0)}</small>
            </div>

            <label>Slot ตาม Naming Plan
              <select data-visual-slot>${visualSlotOptions(asset.slotId)}</select>
            </label>

            <label>ชื่อไฟล์มาตรฐาน
              <input data-visual-canonical value="${esc(canonical)}" placeholder="เช่น 10_presenter_01.jpg">
            </label>

            <label>ประเภท Visual Evidence
              <select data-visual-evidence>${visualEvidenceOptions(asset.evidenceType || slot?.evidenceType || "")}</select>
            </label>

            <div class="visual-status-row">
              ${status}
              ${slot ? `<span class="visual-status info">${esc(slot.label)}</span>` : ""}
            </div>

            <div class="visual-card-actions">
              <button type="button" class="btn btn-ghost" data-copy-visual-name>คัดลอกชื่อ</button>
              <button type="button" class="btn btn-secondary" data-download-renamed ${file ? "" : "disabled"}>ดาวน์โหลดสำเนาชื่อนี้</button>
              <button type="button" class="btn btn-ghost visual-remove" data-remove-visual>ลบ</button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function buildVisualAssetFromFile(file) {
    const used = visualAssets.map(asset => asset.slotId).filter(Boolean);
    const matched = VE.matchSlotByFilename(visualNamingPlan, file.name);
    const slot = matched || VE.nextFreeSlot(visualNamingPlan, used);
    return {
      id: cryptoId(),
      originalName: file.name,
      canonicalName: slot?.filename || file.name,
      slotId: slot?.id || "",
      evidenceType: slot?.evidenceType || "",
      mimeType: file.type || "",
      size: file.size || 0
    };
  }

  function addVisualFiles(files) {
    const incoming = [...(files || [])].slice(0, 40);
    if (!incoming.length) return;
    incoming.forEach(file => {
      const asset = buildVisualAssetFromFile(file);
      visualAssets.push(asset);
      visualAssetFiles.set(asset.id, file);
    });
    renderFileNames();
    save();
  }

  function autoAssignVisualNames() {
    const slots = VE.normalizePlan(visualNamingPlan).slots;
    visualAssets.forEach((asset,index) => {
      const slot = slots[index] || null;
      asset.slotId = slot?.id || "";
      asset.canonicalName = slot?.filename || asset.originalName;
      if (slot?.evidenceType) asset.evidenceType = slot.evidenceType;
    });
    renderFileNames();
    save();
  }

  function applyVisualNamingPlan(plan) {
    const normalized = VE.normalizePlan(plan);
    const issues = VE.planIssues(normalized);
    if (!normalized.slots.length || issues.length) {
      throw new Error(issues.join(" · ") || "Naming Plan ไม่มี slot ที่ใช้ได้");
    }
    visualNamingPlan = normalized;
    autoAssignVisualNames();
    notify(`ใช้ Naming Plan “${normalized.title}” แล้ว · ${normalized.slots.length} slots`, "success", 6500);
  }

  function downloadVisualAsset(asset) {
    const file = visualAssetFiles.get(asset.id);
    if (!file) {
      notify("ไฟล์จริงไม่ได้อยู่ใน session นี้ กรุณาเลือกภาพอีกครั้งก่อนดาวน์โหลดสำเนา", "warn", 6500);
      return;
    }
    const requested = asset.canonicalName || asset.originalName;
    if (!VE.validFilename(requested)) {
      notify("ชื่อไฟล์มาตรฐานยังไม่ถูกต้อง กรุณาตรวจอักขระในชื่อไฟล์", "error", 6500);
      return;
    }
    const resolved = VE.resolvedDownloadName(requested, asset.originalName);
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = resolved;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
    if (resolved !== requested) {
      notify(`นามสกุลต้นฉบับไม่ตรงกับแผน จึงรักษาชนิดไฟล์จริงและดาวน์โหลดเป็น ${resolved}`, "warn", 7000);
    } else {
      notify(`ดาวน์โหลดสำเนาเป็น ${resolved}`, "success");
    }
  }

  function mdList(items, fallback = "- PENDING") {
    return items.length ? items.map(x => "- " + x).join("\n") : fallback;
  }

  function buildResultsSource() {
    syncIndicatorsFromDom();
    const targetLines = indicators.map((x,i) => `- **TARGET ${i+1}:** ${safe(x.title)} — ${safe(x.target)}`);
    const actualLines = indicators.map((x,i) => {
      const trace = R.validateIndicatorTrace(x);
      return [
        `- **ACTUAL ${i+1}:** ${safe(x.title)} — ${safe(x.actual)}`,
        `  - Evidence: ${safe(x.evidence)}`,
        `  - Source: ${safe(x.sourceFile)}${x.sourcePage ? " | หน้า/ตำแหน่ง: " + x.sourcePage : ""}`,
        `  - Period: ${safe(x.period)}`,
        `  - Population: ${safe(x.population)}`,
        `  - Cohort: ${safe(x.cohortId)}`,
        `  - Verification: ${x.verification === "verified" ? "VERIFIED BY USER" : "UNVERIFIED"}`,
        `  - Trace status: ${trace.ready ? "READY" : "PENDING — " + trace.issues.join("; ")}`
      ].join("\n");
    });
    return `---
document_type: "presentation_results"
presenter_name: "${safe(value("presenterName"))}"
status: "${getReadiness().finalReady ? "final_candidate" : "draft_pending_evidence"}"
schema: "pa-toolkit/project/3.1"
---

# Presentation Results Source

> ไฟล์นี้คือ **WHAT TO SAY** และเป็นแหล่งข้อเท็จจริงหลักสำหรับ NotebookLM

## Data Isolation Rule

ใช้เฉพาะข้อมูลของ **${safe(value("presenterName"))}** จาก Sources ของ Project นี้ หากไม่มีข้อมูลให้ใช้ PENDING ห้ามนำข้อมูลจากตัวอย่างหรือบุคคลอื่นมาเติม

## 1. Identity & Context

- ชื่อ: ${safe(value("presenterName"))}
- ตำแหน่ง: ${safe(value("position"))}
- วิทยฐานะ: ${safe(value("academicRank"))}
- หน่วยงาน: ${safe(value("organization"))}
- สังกัด: ${safe(value("affiliation"))}
- รอบ PA/ประเมิน: ${safe(value("paCycle"))}
- ช่วงผลการปฏิบัติงาน: ${safe(value("evaluationPeriod"))}
- เวลานำเสนอ: ${safe(value("duration"))} นาที

## 2. Problem / Development Need

**CONTEXT / แหล่งข้อมูลตั้งต้น:** ${safe(value("baselineSource"))}

${mdList(lines(value("contextNotes")))}

**ประเด็นที่ต้องพัฒนา**

${safe(value("developmentNeed"))}

## 3. Challenge / Agreement

- ชื่อ: **${safe(value("challengeTitle"))}**
- Model/Approach: **${safe(value("managementModel"))}**

## 4. Process

${lines(value("processNotes")).length ? lines(value("processNotes")).map((x,i)=>`${i+1}. ${x}`).join("\n") : "PENDING"}

## 5. Participation

- ครู/บุคลากร: ${safe(value("participationStaff"))}
- ผู้เรียน/ผู้รับบริการ: ${safe(value("participationLearners"))}
- ผู้ปกครอง/ชุมชน: ${safe(value("participationParents"))}
- เครือข่าย/หน่วยงาน: ${safe(value("participationNetwork"))}

## 6. Results

### TARGET

${targetLines.join("\n")}

### ACTUAL + EVIDENCE TRACE

${actualLines.join("\n")}

### Qualitative Evidence

- ผู้เรียน/ผู้รับบริการ: ${safe(value("learnerOutcome"))}
- ครู/บุคลากร: ${safe(value("staffOutcome"))}
- ห้องเรียน/งาน: ${safe(value("workOutcome"))}
- สถานศึกษา/องค์กร: ${safe(value("organizationOutcome"))}

## 7. Student / Service Journey

- ก่อนพัฒนา: ${safe(value("journeyBefore"))}
- ดำเนินการ: ${safe(value("journeyAction"))}
- หลังพัฒนา: ${safe(value("journeyAfter"))}
- หลักฐาน: ${safe(value("journeyEvidence"))}

## 8. Supporting Systems / Innovation

${mdList(lines(value("systems")))}

## 9. Recognition

- ${safe(value("recognition"), "ไม่ใช้ / PENDING")}
- หลักฐาน: ${safe(value("recognitionEvidence"))}

## 10. Expansion / Policy Alignment

- ระดับการขยายผล: ${safe(value("expansionLevel"))}
- หลักฐานการขยายผล: ${safe(value("expansionEvidence"))}
- Policy Alignment: ${safe(value("policyNotes"))}

## 11. PENDING / RELIABILITY CHECK

${[...new Set([...getReadiness().missing, ...getReadiness().traceIssues])].length
  ? [...new Set([...getReadiness().missing, ...getReadiness().traceIssues])].map(x=>"- "+x).join("\n")
  : "- ไม่มีรายการหลักค้างตาม checklist อัตโนมัติ"}

## NotebookLM Guardrails

- ห้ามเปลี่ยน TARGET ให้เป็น ACTUAL
- ห้ามแต่งตัวเลขหรือหลักฐาน
- CONTEXT ไม่ใช่ผลสำเร็จของรอบปัจจุบันโดยอัตโนมัติ
- PENDING ต้องคงเป็น PENDING จนกว่าจะมีหลักฐาน
- ACTUAL ต้องผูกกับ Source / Period / Population และผ่านการยืนยันต้นฉบับโดยผู้ใช้
- Before/After ต้องเป็น cohort/population ที่เปรียบเทียบกันได้
- หากข้อมูลขัดกัน ให้แจ้งผู้ใช้ก่อนสรุป
`;
  }

  function buildStoryboard() {
    const model = safe(value("managementModel"));
    const hasJourney = value("journeyBefore") && value("journeyAfter");
    return `---
document_type: "visual_storyboard"
status: "generated_from_easy_mode"
---

# Visual Storyboard

> ไฟล์นี้คือ **WHAT TO SHOW**

## Visual Priority
1. ภาพจริง
2. Screenshot ระบบจริง
3. Infographic จากเอกสาร
4. กราฟจากข้อมูลจริง
5. AI conceptual

## Available Visual Evidence — Standardized Filenames
${visualAssets.length
  ? visualAssets.map(asset => `- ${safe(asset.canonicalName || asset.originalName)} — ${safe(asset.evidenceType, "ยังไม่ระบุประเภท")}`).join("\n")
  : "- PENDING — ยังไม่ได้แนบภาพใน STEP 6"}

## S00 — Identity / Context
**Message:** แนะนำผู้รับการประเมินและบริบท
**Main Reference:** ภาพผู้รับการประเมิน + สถานศึกษา/หน่วยงาน
**Generated Image Allowed:** NO สำหรับบุคคลและสถานที่จริง

## S01 — Development Need
**Message:** ทำไมเรื่องนี้จึงต้องพัฒนา
**Main Reference:** ข้อมูล CONTEXT / baseline ที่ตรวจสอบแล้ว
**Generated Image Allowed:** YES เฉพาะกราฟจากข้อมูลจริง

## S02 — Challenge / Model
**Message:** ${safe(value("challengeTitle"))}
**Main Reference:** ${model}
**Generated Image Allowed:** YES เฉพาะ diagram เชิงแนวคิดที่ตรงกับ Model ที่ผู้ใช้ตรวจแล้ว

## S03 — Practice / Participation
**Message:** จาก Model สู่การปฏิบัติจริง
**Main Reference:** ภาพกิจกรรม ห้องเรียน งานจริง PLC/นิเทศ
**Generated Image Allowed:** NO

## S04 — ACTUAL Results
**Message:** แสดง TARGET เทียบ ACTUAL โดยไม่แต่งข้อมูล
**Main Reference:** กราฟจากผลจริง + หลักฐาน
**Generated Image Allowed:** YES เฉพาะ visualization จากข้อมูลจริง

## S05 — Student / Service Journey
**Message:** ${hasJourney ? "แสดงการเปลี่ยนแปลงก่อน → ดำเนินการ → หลัง" : "PENDING — ยังควรเพิ่ม Journey"}
**Main Reference:** หลักฐานก่อน–หลังของหน่วยเดียวกัน
**Generated Image Allowed:** NO สำหรับหลักฐานจริง

## S06 — Supporting Systems
**Message:** ระบบ/นวัตกรรมทำหน้าที่สนับสนุนผลลัพธ์
**Main Reference:** Screenshot ระบบจริง
**Generated Image Allowed:** NO สำหรับ Screenshot

## S07 — Recognition / Expansion
**Message:** การยอมรับและการขยายผลตามหลักฐานที่มี
**Main Reference:** หนังสือ/รางวัล/ภาพระบบหรือกิจกรรมจริง
**Generated Image Allowed:** NO สำหรับหลักฐาน

## S08 — Closing Impact
**Message:** ข้อมูล → การพัฒนา → การปฏิบัติ → ผลลัพธ์ → ผลกระทบ
**Generated Image Allowed:** YES เป็น conceptual impact chain

## Do Not Generate
- กิจกรรมจริงที่ไม่เกิดขึ้น
- Screenshot ปลอม
- รางวัล/หนังสือราชการปลอม
- ผล ACTUAL ที่ไม่มีหลักฐาน
`;
  }

  function buildScript() {
    syncIndicatorsFromDom();
    const dur = value("duration") || "5";
    const targets = indicators.map(x => `${safe(x.title)} ตั้งเป้า ${safe(x.target)} และผลจริง ${safe(x.actual)}`).join(" ; ");
    const systems = lines(value("systems")).slice(0,3).join(" ; ") || "PENDING";
    if (dur === "7") {
      return `# Presentation Script — 7 Minutes

## 0:00–0:25 Opening
เรียนคณะกรรมการทุกท่าน ผม/ดิฉัน **${safe(value("presenterName"))}** ${safe(value("position"))} ${safe(value("organization"))} ขอเสนอผลการปฏิบัติงานในช่วง ${safe(value("evaluationPeriod"))}

## 0:25–1:10 Context
จาก ${safe(value("baselineSource"))} พบว่า ${safe(value("developmentNeed"))}

## 1:10–2:30 Challenge / Model
จึงกำหนดประเด็นท้าทาย **${safe(value("challengeTitle"))}** โดยใช้ **${safe(value("managementModel"))}** เป็นแนวทางหลัก

กระบวนการสำคัญประกอบด้วย: ${safe(lines(value("processNotes")).join(" → "))}

## 2:30–3:30 Practice / Participation
การดำเนินงานเกิดจากการมีส่วนร่วมของครู/บุคลากร: ${safe(value("participationStaff"))} และผู้เรียน/ผู้รับบริการ: ${safe(value("participationLearners"))}

## 3:30–4:50 Results
ผลตามตัวชี้วัด: ${targets}

ผลเชิงคุณภาพต่อผู้เรียน/ผู้รับบริการคือ ${safe(value("learnerOutcome"))}

## 4:50–5:30 Journey / Continuous Improvement
ก่อนพัฒนา ${safe(value("journeyBefore"))} หลังดำเนินการ ${safe(value("journeyAction"))} พบว่า ${safe(value("journeyAfter"))}

## 5:30–6:20 Supporting Systems
ระบบหรือเครื่องมือที่ช่วยสนับสนุน ได้แก่ ${systems} โดยระบบเหล่านี้เป็นตัวสนับสนุน ไม่ใช่แกนแทนผลลัพธ์

## 6:20–7:00 Expansion / Closing
การขยายผลอยู่ในระดับ ${safe(value("expansionLevel"))} ตามหลักฐาน ${safe(value("expansionEvidence"))}

สิ่งสำคัญจึงไม่ใช่จำนวนกิจกรรมหรือระบบ แต่คือการทำให้ข้อมูลนำไปสู่การพัฒนา การปฏิบัติ และผลลัพธ์ที่ตรวจสอบได้

ขอบพระคุณครับ/ค่ะ
`;
    }
    return `# Presentation Script — 5 Minutes

## 0:00–0:20 Opening
เรียนคณะกรรมการทุกท่าน ผม/ดิฉัน **${safe(value("presenterName"))}** ${safe(value("position"))} ขอเสนอผลการปฏิบัติงานโดยให้เห็นเส้นทางจาก **ข้อมูล → การพัฒนา → การปฏิบัติ → ผลลัพธ์**

## 0:20–0:55 Context
จาก ${safe(value("baselineSource"))} พบว่า ${safe(value("developmentNeed"))} จึงนำไปสู่ประเด็นท้าทาย **${safe(value("challengeTitle"))}**

## 0:55–1:50 Model / Process
ใช้ **${safe(value("managementModel"))}** เป็นแนวทาง โดยมีขั้นตอนสำคัญ ${safe(lines(value("processNotes")).join(" → "))}

## 1:50–3:00 Results
ผลตามตัวชี้วัด: ${targets}

ในเชิงคุณภาพ ${safe(value("learnerOutcome"))}

## 3:00–3:55 Journey / Supporting Systems
Journey สำคัญ: ก่อนพัฒนา ${safe(value("journeyBefore"))} ดำเนินการ ${safe(value("journeyAction"))} และหลังพัฒนา ${safe(value("journeyAfter"))}

ระบบ/เครื่องมือสนับสนุนที่สำคัญ ได้แก่ ${systems}

## 3:55–4:30 Recognition / Expansion
การยอมรับ: ${safe(value("recognition"), "ไม่ใช้ / PENDING")}  
การขยายผล: ${safe(value("expansionLevel"))}

## 4:30–5:00 Closing
สิ่งสำคัญไม่ใช่จำนวนกิจกรรมหรือระบบ แต่คือการทำให้ **ข้อมูลนำไปสู่การพัฒนา และการพัฒนาส่งผลกลับไปยังผู้เรียน/ผู้รับบริการอย่างตรวจสอบได้**

ขอบพระคุณครับ/ค่ะ
`;
  }

  function buildManifest() {
    const files = selectedFileNames.length ? selectedFileNames.map(x=>"- [ ] "+x).join("\n") : "- [ ] PENDING — ยังไม่ได้เลือกชื่อไฟล์หลักฐานในหน้าเว็บ";
    const visualMap = visualAssets.length
      ? visualAssets.map(asset => {
          const slot = visualSlotById(asset.slotId);
          return `- ${safe(asset.originalName, "ไม่พบไฟล์ต้นฉบับ")} → **${safe(asset.canonicalName || asset.originalName)}**${asset.evidenceType ? " | " + asset.evidenceType : ""}${slot ? " | " + slot.label : ""}`;
        }).join("\n")
      : "- PENDING — ยังไม่ได้แนบ Visual Evidence";
    const audit = getDocumentAudit();
    const auditLines = [];
    audit.duplicates.forEach(x => auditLines.push(`- [ ] DUPLICATE: ${x.aName} ↔ ${x.bName} (${Math.round((x.similarity || 0) * 100)}%)`));
    audit.versionConflicts.forEach(x => auditLines.push(`- [ ] VERSION CHECK: ${x.aName} ↔ ${x.bName}`));
    audit.roleConflicts.forEach(x => auditLines.push(`- [ ] ROLE CHECK: ${x.aName} ↔ ${x.bName}`));
    audit.sourceIssues.forEach(x => auditLines.push(`- [ ] SOURCE LINK: Indicator ${x.indicatorIndex + 1} — ${x.message}`));
    return `# Source Manifest

## CORE SOURCES
- [x] presentation_results_source.md
- [x] visual_storyboard.md
- [x] presentation_script_${value("duration") || "5"}min.md
- [ ] เอกสารข้อตกลง/PA ฉบับจริง
- [ ] Policy Alignment (ถ้ามีและตรวจสอบแล้ว)

## DOCUMENT SOURCES — Local Extraction
${selectedExtractedDocuments().length
  ? selectedExtractedDocuments().map(doc => {
      const pages = doc.pages ? (doc.pageSpec ? ` · ใช้หน้า ${doc.pageSpec}` : ` · ${doc.pages} หน้า (ทั้งหมด)`) : "";
      const ocr = doc.ocrCompletedPages?.length
        ? ` · OCR: ${OCR.compressPages(doc.ocrCompletedPages)} [USER REVIEW REQUIRED]`
        : "";
      return `- [x] ${doc.name} — ROLE: ${documentRoleLabel(doc.role)}${pages}${ocr}`;
    }).join("\n")
  : "- [ ] ไม่มีเอกสารที่อ่านใน session นี้"}

## DOCUMENT AUDIT — Current Session
${extractedDocuments.length
  ? (auditLines.length ? auditLines.join("\n") : "- [x] ไม่พบ duplicate / version / role / source-link issue ใน session นี้")
  : "- [ ] ไม่ได้โหลดเอกสารใน session นี้ จึงยังไม่ได้ทำ Document Audit"}

## ACTUAL EVIDENCE TRACE
${indicators.map((item,i) => {
  const trace = R.validateIndicatorTrace(item);
  return `- [${trace.ready ? "x" : " "}] Indicator ${i+1}: ${safe(item.title)} | Source: ${safe(item.sourceFile)}${item.sourcePage ? " p./ตำแหน่ง " + item.sourcePage : ""} | Period: ${safe(item.period)} | Population: ${safe(item.population)} | ${item.verification === "verified" ? "VERIFIED" : "UNVERIFIED"}`;
}).join("\n")}

## VISUAL EVIDENCE
${[...document.querySelectorAll('input[name="evidenceType"]:checked')].map(x=>"- [x] "+x.value).join("\n") || "- [ ] PENDING"}

### ชื่อไฟล์มาตรฐานที่ใช้ใน Project
${files}

### Original → Standardized Name Map
${visualMap}

> หมายเหตุ: Browser ไม่สามารถเปลี่ยนชื่อไฟล์ต้นฉบับบนเครื่องโดยตรง ชื่อด้านบนคือชื่อมาตรฐานสำหรับ Manifest/Project และสำเนาที่ดาวน์โหลดจาก STEP 6

## ARCHIVE ONLY
- เอกสารดิบยาวที่สรุปสาระสำคัญแล้ว
- ตารางคะแนน/ข้อมูลดิบที่ไม่จำเป็นต่อการเล่าเรื่อง
- technical documentation จำนวนมาก

## DO NOT ADD
- Script สองเวอร์ชันพร้อมกัน
- ตัวอย่างของบุคคลอื่น
- ภาพ AI ที่อาจถูกเข้าใจว่าเป็นหลักฐานจริง
- เอกสารหรือข้อมูลลับที่ยังไม่ปกปิด
`;
  }

  function buildPrompts() {
    const dur = value("duration") || "5";
    return `# NotebookLM Prompts

## Chat QA

> ตรวจ Sources ของ **${safe(value("presenterName"))}** แล้วจัดข้อมูลเป็น FACT / TARGET / ACTUAL / CONTEXT / PENDING ระบุข้อมูลที่ขัดกัน ข้อมูลที่ยังขาด และจุดที่ห้ามตีความเป็นผลสำเร็จจริง ใช้เฉพาะข้อมูลของ Project นี้เท่านั้น

## Slide Deck

> สร้าง Slide Deck ภาษาไทยสำหรับ **${safe(value("presenterName"))}** ${safe(value("position"))} ใช้เวลาไม่เกิน **${dur} นาที**  
> ยึด Presentation Results Source เป็นข้อเท็จจริงหลัก ใช้ Visual Storyboard กำกับภาพ และใช้ Script ${dur} นาทีเป็นลำดับเรื่อง  
> เน้น Context → Development Need → Challenge/Model → Practice → ACTUAL Results → Supporting Systems → Expansion → Impact  
> ใช้ภาพจริงก่อนภาพสร้าง ห้ามสร้างภาพ AI แทนหลักฐาน ห้ามแต่ง ACTUAL และถ้าขาดหลักฐานให้ระบุ [ต้องเพิ่มภาพหลักฐาน]

## Video Overview

> สร้าง Video Overview **ภาษาไทย** ความยาวตาม Script ${dur} นาที สำหรับ **${safe(value("presenterName"))}**  
> ใช้เสียงผู้บรรยายที่เหมาะสมกับบริบททางวิชาชีพ โทนสุภาพ เป็นธรรมชาติ ไม่อ่านรายงานเป็นข้อ ๆ  
> ใช้ภาพคน/กิจกรรม/สถานที่จริงเป็นแกน และ Screenshot เป็น B-roll  
> เน้นเหตุผลของการพัฒนา กระบวนการ ACTUAL Results และผลกระทบ  
> ห้ามแต่งตัวเลข ห้ามพูด PENDING เป็นข้อเท็จจริง และห้ามสร้างหลักฐานปลอม

## Slide Revision

> ตรวจ Slide Deck เทียบกับ Presentation Results Source และ Visual Storyboard แก้ TARGET/ACTUAL/CONTEXT/PENDING ให้ถูก ลดข้อความให้แต่ละสไลด์มี message หลักเดียว และเปลี่ยนภาพ AI ที่ใช้แทน evidence ด้วยภาพจริง

## Video Revision

> ตรวจ Video Overview เทียบกับ Script และ Visual Storyboard แก้ข้อความหรือเสียงที่เปลี่ยน TARGET เป็น ACTUAL ตรวจภาพ evidence ให้ตรงกับประโยค และให้ภาพกิจกรรมจริงมีน้ำหนักมากกว่าหน้าจอระบบ

## Data Isolation Rule

> ห้ามนำชื่อ ตัวเลข ผลงาน รางวัล ระบบ หรือนวัตกรรมจากตัวอย่าง บุคคลอื่น หรือ Notebook อื่นมาใช้ หากไม่มีข้อมูลให้ระบุ PENDING
`;
  }

  function buildQa() {
    const r = getReadiness();
    const missing = [...new Set([...r.missing, ...r.traceIssues])];
    return `# Final QA Checklist

## Identity
- [ ] ชื่อถูกต้อง: ${safe(value("presenterName"))}
- [ ] ตำแหน่งถูกต้อง
- [ ] หน่วยงานและสังกัดถูกต้อง
- [ ] รอบประเมินถูกต้อง

## Evidence & Traceability
- [ ] ทุก ACTUAL มีหลักฐาน
- [ ] ทุก ACTUAL ระบุ Source file และหน้า/ตำแหน่งเมื่อมี
- [ ] ทุก ACTUAL ระบุ Period และ Population
- [ ] ผู้ใช้ตรวจต้นฉบับและตั้ง Verification = VERIFIED
- [ ] TARGET ไม่ถูกเรียกว่า ACTUAL
- [ ] CONTEXT ไม่ถูกเรียกว่า “ผลสำเร็จ” โดยอัตโนมัติ
- [ ] PENDING ไม่ถูกเติมด้วยการคาดเดา
- [ ] Before/After ใช้ cohort/population ที่เปรียบเทียบกันได้

## Import Integrity
- [ ] ไม่มี conflict จาก AI Import ค้าง
- [ ] ตรวจค่าที่ AI เสนอเทียบกับค่าปัจจุบันแล้ว

## Storyline
- [ ] ปัญหา/ความต้องการชัด
- [ ] กระบวนการพัฒนาชัด
- [ ] ผลลัพธ์เป็นแกน
- [ ] ระบบ/นวัตกรรมเป็นตัวสนับสนุน

## Visual
- [ ] ภาพหลักฐานจริงตรงกับข้อความ
- [ ] ไม่มีภาพ AI แทน evidence
- [ ] ปกปิดข้อมูลลับและข้อมูลส่วนบุคคล

## Timing
- [ ] ใช้ Script ${value("duration") || "5"} นาทีเพียงเวอร์ชันเดียว

## Data Isolation
- [ ] ไม่มีข้อมูลจากตัวอย่างหรือบุคคลอื่นปะปน

## Auto Check
- Draft readiness: ${r.draft}%
- Final readiness: ${r.final}%
- Verified ACTUAL: ${r.actualCount}/${indicators.length}
- Trace incomplete: ${r.tracePendingCount}
- Import conflicts: ${r.conflictCount}
- Status: ${r.finalReady ? "READY FOR FINAL" : "DRAFT — ยังมี PENDING/TRACE/CONFLICT"}

## รายการที่ยังขาด
${missing.length ? missing.map(x=>"- [ ] "+x).join("\n") : "- ไม่มีรายการหลักค้างตาม checklist อัตโนมัติ"}
`;
  }

  function buildFiles() {
    const dur = value("duration") || "5";
    return [
      {name:"presentation_results_source.md", desc:"WHAT TO SAY", content:buildResultsSource()},
      {name:"visual_storyboard.md", desc:"WHAT TO SHOW", content:buildStoryboard()},
      {name:`presentation_script_${dur}min.md`, desc:"HOW TO SAY", content:buildScript()},
      {name:"source_manifest.md", desc:"WHAT TO UPLOAD", content:buildManifest()},
      {name:"notebooklm_prompts.md", desc:"HOW TO GENERATE", content:buildPrompts()},
      {name:"final_qa_checklist.md", desc:"VERIFY", content:buildQa()}
    ];
  }

  function countThaiWords(text) {
    const raw = String(text || "");
    try {
      const segmenter = new Intl.Segmenter("th", {granularity:"word"});
      return [...segmenter.segment(raw)].filter(x => x.isWordLike).length;
    } catch {
      return raw.trim() ? raw.trim().split(/\s+/).length : 0;
    }
  }

  function buildBundle(files) {
    const presenter = safe(value("presenterName"), "PA Project");
    const stamp = new Date().toISOString();
    return `# NotebookLM Package Bundle

> สำเนารวมสำหรับตรวจทาน/สำรองข้อมูล
> สำหรับ NotebookLM แนะนำให้อัปโหลดไฟล์ Markdown แยกตาม Source Manifest เพื่อควบคุมบทบาทของ Source ได้ชัดกว่า

- Presenter: ${presenter}
- Generated: ${stamp}
- Files: ${files.length}

` + files.map(f => `\n\n---\n\n# FILE: ${f.name}\n\n${f.content}\n`).join("");
  }

  function updateScriptMetrics() {
    const script = generatedCache.find(f => f.name.startsWith("presentation_script_"));
    const words = script ? countThaiWords(script.content) : 0;
    const estimatedMinutes = words ? (words / 120) : 0;
    const targetMinutes = Number(value("duration") || 5);
    const delta = estimatedMinutes - targetMinutes;
    const timingText = !words ? "—" : (Math.abs(delta) <= 0.5 ? "ใกล้เป้าหมาย" : delta > 0 ? "อาจยาวเกิน" : "อาจสั้น");
    document.getElementById("scriptMetrics").innerHTML = `
      <div class="metric-chip"><strong>${words.toLocaleString()}</strong><span>คำใน Script</span></div>
      <div class="metric-chip"><strong>${estimatedMinutes ? estimatedMinutes.toFixed(1) : "—"} นาที</strong><span>ประมาณการ · ${timingText}</span></div>`;
  }

  function renderPreview(index = 0) {
    if (!generatedCache.length) return;
    activePreviewIndex = Math.max(0, Math.min(index, generatedCache.length - 1));
    const file = generatedCache[activePreviewIndex];
    document.getElementById("previewFileName").textContent = file.name;
    document.getElementById("previewEditor").value = file.content;
    document.querySelectorAll(".preview-tab").forEach((tab,i) => tab.classList.toggle("active", i === activePreviewIndex));
    updateScriptMetrics();
  }

  function renderPreviewStudio() {
    const studio = document.getElementById("previewStudio");
    const tabs = document.getElementById("previewTabs");
    if (!generatedCache.length) {
      studio.classList.add("hidden");
      return;
    }
    studio.classList.remove("hidden");
    tabs.innerHTML = generatedCache.map((f,i) =>
      `<button type="button" class="preview-tab ${i===activePreviewIndex ? "active" : ""}" data-preview-index="${i}">${esc(f.desc)}</button>`
    ).join("");
    renderPreview(activePreviewIndex);
  }

  function download(name, content, type="text/markdown;charset=utf-8") {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  }

  async function copyText(text) {
    await navigator.clipboard.writeText(text);
  }

  function renderGeneratedFiles() {
    generatedCache = buildFiles();
    activePreviewIndex = 0;
    const r = getReadiness();
    const summary = document.getElementById("generatedSummary");
    summary.classList.remove("hidden");
    summary.innerHTML = `<strong>${r.finalReady ? "พร้อมสำหรับ Final candidate" : "สร้างเป็น Draft Package"}</strong><br>
      สร้าง ${generatedCache.length} ไฟล์ · Final readiness ${r.final}% · Preview และแก้ไขข้อความก่อนดาวน์โหลดได้
      <div class="bundle-note">Bundle เป็นไฟล์รวมสำหรับสำรอง/ตรวจทาน; สำหรับ NotebookLM แนะนำใช้ไฟล์แยกตาม Source Manifest</div>`;

    document.getElementById("downloadBundleBtn").classList.remove("hidden");
    document.getElementById("resetGeneratedBtn").classList.remove("hidden");

    const wrap = document.getElementById("generatedFiles");
    wrap.innerHTML = generatedCache.map((f,i) => `
      <article class="file-card">
        <div><strong>${esc(f.name)}</strong><small>${esc(f.desc)}</small></div>
        <div class="file-actions">
          <button type="button" class="btn btn-ghost preview-generated" data-index="${i}">Preview</button>
          <button type="button" class="btn btn-ghost copy-generated" data-index="${i}">คัดลอก</button>
          <button type="button" class="btn btn-secondary download-generated" data-index="${i}">ดาวน์โหลด</button>
        </div>
      </article>`).join("");

    wrap.querySelectorAll(".preview-generated").forEach(btn => btn.addEventListener("click", () => {
      renderPreview(Number(btn.dataset.index));
      document.getElementById("previewStudio").scrollIntoView({behavior:"smooth", block:"start"});
    }));
    wrap.querySelectorAll(".copy-generated").forEach(btn => btn.addEventListener("click", async () => {
      await copyText(generatedCache[Number(btn.dataset.index)].content);
      btn.textContent = "คัดลอกแล้ว";
      setTimeout(()=>btn.textContent="คัดลอก",1000);
    }));
    wrap.querySelectorAll(".download-generated").forEach(btn => btn.addEventListener("click", () => {
      const f=generatedCache[Number(btn.dataset.index)];
      download(f.name,f.content);
    }));

    renderPreviewStudio();
  }

  document.getElementById("addIndicatorBtn").addEventListener("click", () => {
    syncIndicatorsFromDom();
    indicators.push({...R.normalizeIndicator({id:cryptoId(), actualMode:"pending", actual:"PENDING"}), id:cryptoId()});
    renderIndicators(); save();
  });

  indicatorCards.addEventListener("click", e => {
    const remove = e.target.closest(".remove-indicator");
    if (remove) {
      syncIndicatorsFromDom();
      const id = remove.closest(".indicator-card").dataset.id;
      indicators = indicators.filter(x => x.id !== id);
      renderIndicators(); save();
      return;
    }

    const targetPrefix = e.target.closest("[data-target-prefix]");
    if (targetPrefix) {
      const card = targetPrefix.closest(".indicator-card");
      const input = card?.querySelector('[data-field="target"]');
      if (!input) return;
      const symbol = targetPrefix.dataset.targetPrefix;
      const body = input.value.replace(/^\s*(?:≥|≤|>|<|=)\s*/, "").trimStart();
      input.value = symbol + body;
      refreshIndicatorCard(card, "target");
      save();
      input.focus();
      return;
    }

    const targetSuffix = e.target.closest("[data-target-suffix]");
    if (targetSuffix) {
      const card = targetSuffix.closest(".indicator-card");
      const input = card?.querySelector('[data-field="target"]');
      if (!input) return;
      const suffix = targetSuffix.dataset.targetSuffix;
      const trimmed = input.value.trimEnd();
      input.value = trimmed.endsWith(suffix) ? trimmed : trimmed + suffix;
      refreshIndicatorCard(card, "target");
      save();
      input.focus();
      return;
    }

    const sourcePick = e.target.closest("[data-pick-source-file]");
    if (sourcePick) {
      syncIndicatorsFromDom();
      const card = sourcePick.closest(".indicator-card");
      sourcePickerIndicatorId = card?.dataset.id || "";
      openDocumentReader();
      notify("เลือกไฟล์ต้นทาง: ถ้ายังไม่มีไฟล์ ให้เลือกไฟล์แล้วกด “อ่านข้อความ” จากนั้นกด “ใช้เป็น Source”", "info", 7000);
      if (!readySourceDocuments().length) {
        // Keep the native file chooser inside the original user gesture.
        sourceDocumentsInput.click();
      }
      return;
    }

    const modeBtn = e.target.closest("[data-actual-mode]");
    if (modeBtn) {
      syncIndicatorsFromDom();
      const card = modeBtn.closest(".indicator-card");
      const item = indicators.find(x => x.id === card?.dataset.id);
      if (!item) return;
      item.actualMode = modeBtn.dataset.actualMode;
      item.verification = "unverified";
      if (item.actualMode === "pending") {
        item.actual = "PENDING";
        item.actualNumerator = "";
        item.actualDenominator = "";
      } else {
        if (item.actualMode !== "fraction") {
          item.actualNumerator = "";
          item.actualDenominator = "";
        }
        if (R.isPending(item.actual)) item.actual = "";
      }
      renderIndicators();
      save();
    }
  });

  function refreshIndicatorCard(card, changedField = "") {
    if (!card) return;
    const item = indicators.find(x => x.id === card.dataset.id);
    if (!item) return;
    card.querySelectorAll("[data-field]").forEach(el => item[el.dataset.field] = el.value.trim());

    const percentInput = card.querySelector("[data-actual-percent]");
    if (percentInput) {
      const raw = percentInput.value.trim().replace("%","");
      item.actual = raw ? raw + "%" : "";
    }

    if (item.actualMode === "fraction" && ["actualNumerator","actualDenominator"].includes(changedField)) {
      const calculated = R.formatCalculatedActual(item.actualNumerator, item.actualDenominator, 2);
      const actualInput = card.querySelector('[data-field="actual"]');
      item.actual = calculated || "";
      if (actualInput) actualInput.value = item.actual;
      const output = card.querySelector("[data-calc-output]");
      if (output) output.textContent = calculated || "รอคำนวณ";
    }

    if (item.actualMode === "pending") item.actual = "PENDING";

    const traceSensitiveFields = new Set([
      "actual","actualPercent","actualNumerator","actualDenominator","evidence",
      "sourceFile","sourcePage","period","population","cohortId"
    ]);
    if (traceSensitiveFields.has(changedField) && item.verification === "verified") {
      item.verification = "unverified";
      const verificationSelect = card.querySelector('[data-field="verification"]');
      if (verificationSelect) verificationSelect.value = "unverified";
    }

    const trace = R.validateIndicatorTrace(item);
    const status = card.querySelector("[data-trace-status]");
    if (status) {
      status.className = "trace-status " + (trace.ready ? "ok" : "warn");
      status.textContent = trace.ready
        ? "ACTUAL มี trace ครบและผู้ใช้ยืนยันต้นฉบับแล้ว"
        : trace.issues.join(" · ");
    }
  }

  indicatorCards.addEventListener("input", e => {
    const field = e.target.closest("[data-field]");
    const percent = e.target.closest("[data-actual-percent]");
    const card = e.target.closest(".indicator-card");
    refreshIndicatorCard(card, field?.dataset.field || (percent ? "actualPercent" : ""));
    save();
  });

  indicatorCards.addEventListener("change", e => {
    const card = e.target.closest(".indicator-card");
    if (!card) return;

    const sourceSelect = e.target.closest("[data-source-doc-select]");
    if (sourceSelect) {
      const item = indicators.find(x => x.id === card.dataset.id);
      if (!item) return;
      item.sourceFile = sourceSelect.value;
      item.sourcePage = "";
      item.verification = "unverified";
      renderIndicators();
      save();
      return;
    }

    const pageSelect = e.target.closest("[data-source-page-select]");
    if (pageSelect) {
      const pageInput = card.querySelector('[data-field="sourcePage"]');
      if (pageInput) pageInput.value = pageSelect.value ? "หน้า " + pageSelect.value : "";
      refreshIndicatorCard(card, "sourcePage");
      save();
      return;
    }

    const field = e.target.closest("[data-field]");
    refreshIndicatorCard(card, field?.dataset.field || "");
    save();
  });

  form.addEventListener("input", () => save());
  form.addEventListener("change", () => save());

  document.addEventListener("click", e => {
    const pick = e.target.closest(".quick-pick[data-fill-target]");
    if (!pick) return;
    const target = form.elements[pick.dataset.fillTarget];
    if (!target) return;

    const incoming = pick.dataset.fillValue || "";
    if (pick.dataset.fillMode === "append") {
      const existing = String(target.value || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      if (incoming && !existing.includes(incoming)) existing.push(incoming);
      target.value = existing.join("\n");
    } else {
      target.value = incoming;
    }

    target.dispatchEvent(new Event("input", {bubbles:true}));
    syncSmartEditorsFromFields();

    document.querySelectorAll(`.quick-pick[data-fill-target="${CSS.escape(pick.dataset.fillTarget)}"]`)
      .forEach(btn => btn.classList.toggle("selected", btn === pick));

    const smartShell = document.querySelector(`[data-smart-field="${CSS.escape(pick.dataset.fillTarget)}"]`);
    if (smartShell?.classList.contains("smart-list-shell")) {
      smartShell.querySelector(".smart-list-input:last-of-type")?.focus();
    } else if (smartShell) {
      smartShell.querySelector(".rich-editor")?.focus();
    } else {
      target.focus();
    }
  });

  document.getElementById("openDocumentReaderBtn").addEventListener("click", openDocumentReader);

  function closeDocumentReaderModal() {
    documentReaderModal.classList.add("hidden");
    sourcePickerIndicatorId = "";
    if (aiJsonModal.classList.contains("hidden")) document.body.style.overflow = "";
  }

  document.getElementById("closeDocumentReaderBtn").addEventListener("click", closeDocumentReaderModal);
  documentReaderModal.addEventListener("click", e => {
    if (e.target === documentReaderModal) closeDocumentReaderModal();
  });

  sourceDocumentsInput.addEventListener("change", async e => {
    const files = [...(e.target.files || [])];
    const accepted = files.slice(0, 10);
    if (activeOcrJob) {
      try { await cancelOcrJob(activeOcrJob.docId); } catch {}
      activeOcrJob = null;
    }
    pendingSourceFiles = accepted;
    extractedDocuments = [];
    documentFiles.clear();
    documentChunks = [];
    documentSearchPageResults = [];
    if (documentSearchInput) documentSearchInput.value = "";
    rebuildDocumentIntelligenceIndex({rerunSearch:false});
    renderExtractedDocuments();
    document.getElementById("extractDocumentsBtn").disabled = !accepted.length;
    documentReaderStatus.className = "json-status " + (files.length > 10 ? "warn" : "neutral");
    documentReaderStatus.textContent = files.length > 10
      ? `เลือก ${files.length} ไฟล์ ระบบจะอ่าน 10 ไฟล์แรก`
      : `เลือกแล้ว ${accepted.length} ไฟล์ กด “อ่านข้อความ” เพื่อเริ่ม`;
  });

  document.getElementById("extractDocumentsBtn").addEventListener("click", extractPendingDocuments);

  documentList.addEventListener("change", e => {
    const card = e.target.closest("[data-doc-id]");
    const doc = extractedDocuments.find(x => x.id === card?.dataset.docId);
    if (!doc) return;

    const checkbox = e.target.closest(".document-include");
    if (checkbox) {
      doc.include = checkbox.checked;
      if (documentSearchInput?.value.trim() && documentSearchScope?.value === "included") {
        runDocumentSearch();
      }
    }

    const role = e.target.closest(".document-role");
    if (role) {
      doc.role = role.value;
      const badge = card.querySelector(".document-role-badge");
      if (badge) badge.textContent = documentRoleLabel(doc.role);
      rebuildDocumentIntelligenceIndex({rerunSearch:true});
    }

    const ocrLanguage = e.target.closest("[data-ocr-language]");
    if (ocrLanguage) doc.ocrLanguage = ocrLanguage.value;

    updateDocumentPreview();
    renderDocumentAuditMini();
    if (currentStep === 6) renderReadiness();
  });

  documentList.addEventListener("input", e => {
    const card = e.target.closest("[data-doc-id]");
    const doc = extractedDocuments.find(x => x.id === card?.dataset.docId);
    if (!doc) return;

    const pagesInput = e.target.closest(".document-pages");
    if (pagesInput) {
      doc.pageSpec = pagesInput.value.trim();
      const parsed = R.parsePageSpec(doc.pageSpec, doc.pages);
      doc.pageError = parsed.error;
      const errorEl = card.querySelector(".page-error");
      if (errorEl) errorEl.textContent = parsed.error;
      updateDocumentPreview();
      renderDocumentAuditMini();
      if (currentStep === 6) renderReadiness();
      return;
    }

    const ocrPages = e.target.closest("[data-ocr-pages]");
    if (ocrPages) {
      doc.ocrPageSpec = ocrPages.value.trim();
    }
  });

  documentList.addEventListener("click", async e => {
    const startOcr = e.target.closest("[data-start-ocr]");
    if (startOcr) {
      await runOcrForDocument(startOcr.dataset.startOcr);
      return;
    }

    const cancelOcr = e.target.closest("[data-cancel-ocr]");
    if (cancelOcr) {
      await cancelOcrJob(cancelOcr.dataset.cancelOcr);
      return;
    }

    const suggested = e.target.closest("[data-use-ocr-suggested]");
    if (suggested) {
      const doc = extractedDocuments.find(x => x.id === suggested.dataset.useOcrSuggested);
      const card = suggested.closest("[data-doc-id]");
      const input = card?.querySelector("[data-ocr-pages]");
      if (doc && input) {
        const pages = Array.isArray(doc.ocrSuggestedPages) && doc.ocrSuggestedPages.length
          ? doc.ocrSuggestedPages
          : OCR.candidatePages(doc.pageTexts || []);
        const spec = OCR.compressPages(pages.slice(0,12));
        doc.ocrPageSpec = spec;
        input.value = spec;
      }
      return;
    }

    const use = e.target.closest("[data-use-as-source]");
    if (use) {
      assignDocumentToIndicator(use.dataset.useAsSource);
      return;
    }

    const remove = e.target.closest(".document-remove");
    if (!remove) return;
    const card = remove.closest("[data-doc-id]");
    const docId = card?.dataset.docId;
    if (activeOcrJob?.docId === docId) {
      await cancelOcrJob(docId);
      activeOcrJob = null;
    }
    documentFiles.delete(docId);
    extractedDocuments = extractedDocuments.filter(x => x.id !== docId);
    rebuildDocumentIntelligenceIndex({rerunSearch:true});
    renderExtractedDocuments();
    syncIndicatorsFromDom();
    renderIndicators();
  });

  document.getElementById("documentSearchBtn").addEventListener("click", () => {
    runDocumentSearch();
  });

  documentSearchInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    runDocumentSearch();
  });

  documentSearchScope.addEventListener("change", () => {
    if (documentSearchInput.value.trim()) runDocumentSearch();
  });

  document.getElementById("clearDocumentSearchBtn").addEventListener("click", () => {
    documentSearchInput.value = "";
    documentSearchPageResults = [];
    rebuildDocumentIntelligenceIndex({rerunSearch:false});
    documentSearchInput.focus();
  });

  documentSearchSuggestions.addEventListener("click", e => {
    const chip = e.target.closest("[data-document-search-query]");
    if (!chip) return;
    documentSearchInput.value = chip.dataset.documentSearchQuery || "";
    runDocumentSearch();
    documentSearchResults.scrollIntoView({behavior:"smooth",block:"nearest"});
  });

  documentSearchResults.addEventListener("click", async e => {
    const key = e.target.closest("[data-use-search-page],[data-use-search-document],[data-use-search-source],[data-copy-search-result]")?.dataset;
    if (!key) return;

    const actionEl = e.target.closest("[data-use-search-page],[data-use-search-document],[data-use-search-source],[data-copy-search-result]");
    const resultKey = actionEl.dataset.useSearchPage
      || actionEl.dataset.useSearchDocument
      || actionEl.dataset.useSearchSource
      || actionEl.dataset.copySearchResult;
    const result = searchResultByKey(resultKey);
    if (!result) return;
    const doc = extractedDocuments.find(item => item.id === result.docId);

    if (actionEl.hasAttribute("data-use-search-page")) {
      addPageToDocumentSelection(doc,result.page);
      return;
    }

    if (actionEl.hasAttribute("data-use-search-document")) {
      if (doc) {
        doc.include = true;
        renderExtractedDocuments();
        updateDocumentPreview();
        notify(`เลือก ${doc.name} ใช้กับ AI แล้ว`, "success", 4300);
      }
      return;
    }

    if (actionEl.hasAttribute("data-use-search-source")) {
      useSearchResultAsSource(result);
      return;
    }

    if (actionEl.hasAttribute("data-copy-search-result")) {
      await copyText((result.excerpts || []).join("\n\n"));
      notify("คัดลอกข้อความจากผลค้นหาแล้ว", "success", 3200);
    }
  });

  documentTextPreview.addEventListener("input", () => {
    externalSourceText = documentTextPreview.value;
    const enabled = Boolean(documentTextPreview.value.trim());
    document.getElementById("copyExtractedTextBtn").disabled = !enabled;
    document.getElementById("downloadExtractedTextBtn").disabled = !enabled;
    document.getElementById("copyDocumentAiPackageBtn").disabled = !enabled;
    document.getElementById("openJsonAssistantFromDocsBtn").disabled = !enabled;
  });

  document.getElementById("copyExtractedTextBtn").addEventListener("click", async e => {
    await copyText(documentTextPreview.value);
    e.currentTarget.textContent = "คัดลอกแล้ว";
    setTimeout(() => e.currentTarget.textContent = "คัดลอกข้อความ", 1100);
  });

  document.getElementById("downloadExtractedTextBtn").addEventListener("click", () => {
    const name = slugName(value("presenterName") || "pa-sources") + "-extracted-sources.txt";
    download(name, documentTextPreview.value, "text/plain;charset=utf-8");
  });

  document.getElementById("copyDocumentAiPackageBtn").addEventListener("click", async e => {
    const prompt = buildExternalAiPrompt() + "\n\n" +
      "ต่อไปนี้คือข้อความจากเอกสารต้นทางที่ผู้ใช้เลือก กรุณาใช้เฉพาะข้อมูลที่มีหลักฐานในข้อความนี้:\n\n" +
      documentTextPreview.value;
    await copyText(prompt);
    e.currentTarget.textContent = "คัดลอกแล้ว";
    setTimeout(() => e.currentTarget.textContent = "คัดลอก Prompt + Sources", 1200);
  });

  document.getElementById("openJsonAssistantFromDocsBtn").addEventListener("click", () => {
    externalSourceText = documentTextPreview.value;
    closeDocumentReaderModal();
    aiPromptPreview.value = buildExternalAiPrompt() + "\n\n" +
      "ข้อความจากเอกสารที่ Toolkit อ่านใน Browser:\n\n" + externalSourceText;
    validatedAiJson = null;
    
    aiJsonStatus.className = "json-status neutral";
    aiJsonStatus.textContent = "Prompt มีข้อความจากเอกสารแล้ว คัดลอกไปถาม AI ภายนอก จากนั้นนำ JSON กลับมาวาง";
    aiJsonModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  document.getElementById("clearDocumentsBtn").addEventListener("click", async () => {
    if (activeOcrJob) {
      try { await cancelOcrJob(activeOcrJob.docId); } catch {}
      activeOcrJob = null;
    }
    pendingSourceFiles = [];
    extractedDocuments = [];
    documentFiles.clear();
    documentChunks = [];
    documentSearchPageResults = [];
    if (documentSearchInput) documentSearchInput.value = "";
    externalSourceText = "";
    sourceDocumentsInput.value = "";
    documentReaderStatus.className = "json-status neutral";
    documentReaderStatus.textContent = "ล้างเอกสารแล้ว";
    rebuildDocumentIntelligenceIndex({rerunSearch:false});
    renderExtractedDocuments();
    syncIndicatorsFromDom();
    renderIndicators();
  });

  document.getElementById("openAiJsonBtn").addEventListener("click", () => {
    aiPromptPreview.value = buildExternalAiPrompt();
    validatedAiJson = null;
    importReviewDecisions = {};
    lastConflictCount = 0;
    aiImportReview.classList.add("hidden");
    
    aiJsonStatus.className = "json-status neutral";
    aiJsonStatus.textContent = "วาง JSON ที่ AI ตอบกลับ แล้วกด “ตรวจ JSON”";
    aiJsonModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  function closeAiJsonModal() {
    aiJsonModal.classList.add("hidden");
    document.body.style.overflow = "";
    lastConflictCount = 0;
  }

  document.getElementById("closeAiJsonBtn").addEventListener("click", closeAiJsonModal);
  aiJsonModal.addEventListener("click", e => {
    if (e.target === aiJsonModal) closeAiJsonModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!aiJsonModal.classList.contains("hidden")) closeAiJsonModal();
    if (!documentReaderModal.classList.contains("hidden")) closeDocumentReaderModal();
  });

  document.getElementById("copyAiPromptBtn").addEventListener("click", async e => {
    const prompt = buildExternalAiPrompt();
    aiPromptPreview.value = prompt;
    await copyText(prompt);
    e.currentTarget.textContent = "คัดลอกแล้ว";
    setTimeout(() => e.currentTarget.textContent = "คัดลอก Prompt", 1100);
  });

  document.getElementById("loadAiJsonExampleBtn").addEventListener("click", () => {
    aiJsonInput.value = buildAiJsonExample();
    validatedAiJson = null;
    importReviewDecisions = {};
    lastConflictCount = 0;
    aiImportReview.classList.add("hidden");
    
    aiJsonStatus.className = "json-status neutral";
    aiJsonStatus.textContent = "โหลดตัวอย่างสมมติแล้ว กด “ตรวจ JSON” เพื่อทดลอง workflow";
  });

  document.getElementById("loadOwnerTestDataBtn").addEventListener("click", async e => {
    const btn = e.currentTarget;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "กำลังโหลด...";
    try {
      const response = await fetch("./test-data/owner-pa-2569.ai-intake.json", {cache:"no-store"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      aiJsonInput.value = JSON.stringify(data, null, 2);
      validatedAiJson = null;
      importReviewDecisions = {};
      lastConflictCount = 0;
      aiImportReview.classList.add("hidden");
      
      aiJsonStatus.className = "json-status neutral";
      aiJsonStatus.textContent = "โหลด Owner Test Data แล้ว กด “ตรวจ JSON” ก่อน Import";
    } catch (err) {
      aiJsonStatus.className = "json-status error";
      aiJsonStatus.textContent = "โหลด Owner Test Data ไม่สำเร็จ: " + (err?.message || "ไม่ทราบสาเหตุ");
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  document.getElementById("aiJsonFileInput").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    aiJsonInput.value = await file.text();
    validatedAiJson = null;
    importReviewDecisions = {};
    lastConflictCount = 0;
    aiImportReview.classList.add("hidden");
    
    aiJsonStatus.className = "json-status neutral";
    aiJsonStatus.textContent = "โหลดไฟล์แล้ว กรุณากด “ตรวจ JSON”";
    e.target.value = "";
  });

  aiJsonInput.addEventListener("input", () => {
    validatedAiJson = null;
    importReviewDecisions = {};
    lastConflictCount = 0;
    aiImportReview.classList.add("hidden");
    
    aiJsonStatus.className = "json-status neutral";
    aiJsonStatus.textContent = "JSON มีการเปลี่ยนแปลง กรุณาตรวจอีกครั้ง";
  });

  aiImportReviewRows.addEventListener("change", e => {
    const select = e.target.closest("[data-review-decision]");
    if (!select) return;
    importReviewDecisions[select.dataset.reviewDecision] = select.value;
  });

  document.getElementById("aiImportMode").addEventListener("change", () => {
    if (!validatedAiJson) return;
    const {out} = normalizeAiJson(validatedAiJson);
    renderImportReview(out, document.getElementById("aiImportMode").value);
  });

  document.getElementById("validateAiJsonBtn").addEventListener("click", () => {
    try {
      const parsed = parseExternalAiJson(aiJsonInput.value);
      const {out, warnings} = normalizeAiJson(parsed);
      validatedAiJson = parsed;
      const review = renderImportReview(out, document.getElementById("aiImportMode").value);
      const filled = Object.entries(out).filter(([k,v]) => !["indicators","evidenceTypes","importNotes"].includes(k) && String(v || "").trim()).length;
      const indicatorCount = out.indicators.length;
      
      const hasWarnings = warnings.length || review.conflicts.length;
      aiJsonStatus.className = "json-status " + (hasWarnings ? "warn" : "ok");
      aiJsonStatus.innerHTML = `<strong>JSON ใช้งานได้</strong> · พบข้อมูล ${filled} ช่อง · ตัวชี้วัด ${indicatorCount} รายการ · conflicts ${review.conflicts.length}`
        + (warnings.length ? `<br>คำเตือน: ${esc(warnings.join(" · "))}` : "")
        + (review.conflicts.length ? "<br>กรุณาตรวจแถว CONFLICT ก่อน Import; ค่าเริ่มต้นจะเก็บข้อมูลเดิม" : "")
        + (out.importNotes ? `<br>หมายเหตุจาก AI: ${esc(out.importNotes)}` : "");
    } catch (err) {
      validatedAiJson = null;
      importReviewDecisions = {};
      lastConflictCount = 0;
      aiImportReview.classList.add("hidden");
      
      aiJsonStatus.className = "json-status error";
      aiJsonStatus.textContent = "JSON ไม่ถูกต้อง: " + (err?.message || "ไม่ทราบสาเหตุ");
    }
  });

  importAiJsonBtn.addEventListener("click", () => {
    if (!validatedAiJson) {
      document.getElementById("validateAiJsonBtn").click();

      if (!validatedAiJson) {
        notify("ยัง Import ไม่ได้ เพราะ JSON ยังไม่ผ่านการตรวจ กรุณาดูข้อความผิดพลาดใต้ช่อง JSON แล้วแก้ไขก่อน", "error", 7000);
        aiJsonStatus.scrollIntoView({behavior:"smooth", block:"center"});
        return;
      }

      notify("ตรวจ JSON ให้แล้ว ✓ กรุณาตรวจ Pre-Import Review ด้านล่าง แล้วกด “Import เข้าระบบ” อีกครั้ง", "info", 7600);
      if (!aiImportReview.classList.contains("hidden")) {
        aiImportReview.scrollIntoView({behavior:"smooth", block:"nearest"});
      }
      return;
    }

    const mode = document.getElementById("aiImportMode").value;
    const reviewedConflictCount = lastConflictCount;
    const result = applyAiImport(validatedAiJson, mode, importReviewDecisions);
    closeAiJsonModal();
    const extra = [
      reviewedConflictCount ? `ตรวจพบ conflict ${reviewedConflictCount} จุด และใช้ตัวเลือกจาก Pre-Import Review แล้ว` : "",
      result.warnings.length ? "มีคำเตือน: " + result.warnings.join(" · ") : "",
      result.importNotes ? "หมายเหตุจาก AI: " + result.importNotes : ""
    ].filter(Boolean).join("\n");
    notify("Import JSON เข้าระบบเรียบร้อย" + (extra ? "\n" + extra : "") + "\nACTUAL จาก AI ยังเป็น UNVERIFIED จนกว่าคุณจะตรวจต้นฉบับใน STEP 3", "success", 7600);
  });

  readinessIndicatorList.addEventListener("click", e => {
    const edit = e.target.closest("[data-edit-indicator]");
    if (edit) {
      goToIndicatorInStep3(edit.dataset.editIndicator);
      return;
    }
    const source = e.target.closest("[data-open-indicator-source]");
    if (source) openIndicatorSource(source.dataset.openIndicatorSource);
  });

  projectDashboardGrid.addEventListener("click", e => {
    const card = e.target.closest("[data-dashboard-action]");
    if (!card) return;
    const action = card.dataset.dashboardAction;
    if (action === "step1") showStep(0);
    if (action === "step3") showStep(2);
    if (action === "reader") openDocumentReader();
    if (action === "audit") document.querySelector(".source-audit-wrap")?.scrollIntoView({behavior:"smooth", block:"start"});
    if (action === "missing") document.getElementById("missingList")?.scrollIntoView({behavior:"smooth", block:"start"});
  });

  sourceAuditList.addEventListener("click", e => {
    const docs = e.target.closest("[data-open-audit-docs]");
    if (docs) {
      openAuditDocuments(docs.dataset.openAuditDocs);
      return;
    }
    const indicator = e.target.closest("[data-edit-audit-indicator]");
    if (indicator?.dataset.editAuditIndicator) goToIndicatorInStep3(indicator.dataset.editAuditIndicator);
  });

  document.getElementById("openReaderFromAuditBtn").addEventListener("click", openDocumentReader);

  evidenceFiles.addEventListener("change", () => {
    addVisualFiles(evidenceFiles.files);
    evidenceFiles.value = "";
  });

  selectedFileList.addEventListener("change", e => {
    const card = e.target.closest("[data-visual-id]");
    const asset = visualAssets.find(item => item.id === card?.dataset.visualId);
    if (!asset) return;

    const slotSelect = e.target.closest("[data-visual-slot]");
    if (slotSelect) {
      asset.slotId = slotSelect.value;
      const slot = visualSlotById(asset.slotId);
      if (slot) {
        asset.canonicalName = slot.filename;
        asset.evidenceType = slot.evidenceType || asset.evidenceType;
        if (asset.evidenceType) {
          const checkbox = [...document.querySelectorAll('input[name="evidenceType"]')].find(x => x.value === asset.evidenceType);
          if (checkbox) checkbox.checked = true;
        }
      }
      renderFileNames();
      save();
      return;
    }

    const evidenceSelect = e.target.closest("[data-visual-evidence]");
    if (evidenceSelect) {
      asset.evidenceType = evidenceSelect.value;
      if (asset.evidenceType) {
        const checkbox = [...document.querySelectorAll('input[name="evidenceType"]')].find(x => x.value === asset.evidenceType);
        if (checkbox) checkbox.checked = true;
      }
      save();
    }
  });

  selectedFileList.addEventListener("input", e => {
    const input = e.target.closest("[data-visual-canonical]");
    if (!input) return;
    const card = input.closest("[data-visual-id]");
    const asset = visualAssets.find(item => item.id === card?.dataset.visualId);
    if (!asset) return;
    asset.canonicalName = input.value.trim();
    syncSelectedVisualNames();
    save();
  });

  selectedFileList.addEventListener("click", async e => {
    const card = e.target.closest("[data-visual-id]");
    const asset = visualAssets.find(item => item.id === card?.dataset.visualId);
    if (!asset) return;

    if (e.target.closest("[data-copy-visual-name]")) {
      await copyText(asset.canonicalName || asset.originalName);
      notify("คัดลอกชื่อไฟล์มาตรฐานแล้ว", "success", 3200);
      return;
    }

    if (e.target.closest("[data-download-renamed]")) {
      downloadVisualAsset(asset);
      return;
    }

    if (e.target.closest("[data-remove-visual]")) {
      revokeVisualPreview(asset.id);
      visualAssetFiles.delete(asset.id);
      visualAssets = visualAssets.filter(item => item.id !== asset.id);
      renderFileNames();
      save();
    }
  });

  document.getElementById("autoAssignVisualNamesBtn").addEventListener("click", () => {
    autoAssignVisualNames();
    notify("จัดชื่อภาพตามลำดับของ Naming Plan แล้ว", "success");
  });

  document.getElementById("resetNamingPlanBtn").addEventListener("click", () => {
    visualNamingPlan = VE.defaultPlan();
    autoAssignVisualNames();
    notify("กลับมาใช้ Generic Naming Plan แล้ว", "info");
  });

  document.getElementById("downloadNamingPlanBtn").addEventListener("click", () => {
    download("visual-naming-plan-template.json", JSON.stringify(VE.defaultPlan(), null, 2), "application/json;charset=utf-8");
  });

  visualNamingPlanInput.addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      applyVisualNamingPlan(data);
    } catch (err) {
      notify("อ่าน Naming Plan ไม่สำเร็จ: " + (err?.message || "รูปแบบ JSON ไม่ถูกต้อง"), "error", 7000);
    }
    e.target.value = "";
  });

  nextBtn.addEventListener("click", () => {
    if (currentStep < panels.length - 1) showStep(currentStep + 1);
    else renderReadiness();
  });
  prevBtn.addEventListener("click", () => showStep(currentStep - 1));
  stepLinks.forEach(b => b.addEventListener("click", () => showStep(Number(b.dataset.goto))));

  document.getElementById("generateBtn").addEventListener("click", () => {
    save();
    renderGeneratedFiles();
  });

  document.getElementById("previewTabs").addEventListener("click", e => {
    const btn = e.target.closest("[data-preview-index]");
    if (!btn) return;
    renderPreview(Number(btn.dataset.previewIndex));
  });

  document.getElementById("previewEditor").addEventListener("input", e => {
    if (!generatedCache.length) return;
    generatedCache[activePreviewIndex].content = e.target.value;
    updateScriptMetrics();
  });

  document.getElementById("copyPreviewBtn").addEventListener("click", async e => {
    if (!generatedCache.length) return;
    await copyText(generatedCache[activePreviewIndex].content);
    e.currentTarget.textContent = "คัดลอกแล้ว";
    setTimeout(()=>e.currentTarget.textContent="คัดลอก",1000);
  });

  document.getElementById("downloadPreviewBtn").addEventListener("click", () => {
    if (!generatedCache.length) return;
    const f = generatedCache[activePreviewIndex];
    download(f.name, f.content);
  });

  document.getElementById("downloadBundleBtn").addEventListener("click", () => {
    if (!generatedCache.length) return;
    const name = slugName(value("presenterName")) + "-notebooklm-package-bundle.md";
    download(name, buildBundle(generatedCache));
  });

  document.getElementById("resetGeneratedBtn").addEventListener("click", () => {
    renderGeneratedFiles();
  });

  document.getElementById("copyQaPromptBtn").addEventListener("click", async e => {
    const prompt = buildPrompts().split("## Slide Deck")[0].replace("# NotebookLM Prompts","").trim();
    await copyText(prompt);
    e.currentTarget.textContent = "คัดลอกแล้ว";
    setTimeout(()=>e.currentTarget.textContent="คัดลอก Chat QA Prompt",1200);
  });

  document.getElementById("exportProjectBtn").addEventListener("click", () => {
    const state = collectState();
    const filename = slugName(state.presenterName) + "-pa-toolkit-project.json";
    download(filename, JSON.stringify(state,null,2), "application/json;charset=utf-8");
  });

  document.getElementById("importProjectInput").addEventListener("change", async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      applyState(data); save(); showStep(data.currentStep || 0);
      notify("นำเข้าโปรเจกต์เรียบร้อย", "success");
    } catch {
      notify("ไม่สามารถอ่านไฟล์โปรเจกต์นี้ได้ กรุณาตรวจรูปแบบ JSON", "error", 6500);
    }
    e.target.value = "";
  });

  initSmartEditors();
  load();
  injectFieldExamples();
  syncSmartEditorsFromFields();
  aiPromptPreview.value = buildExternalAiPrompt();
  showStep(currentStep);
})();