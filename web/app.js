(() => {
  "use strict";

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

  let currentStep = 0;
  let indicators = [];
  let selectedFileNames = [];
  let generatedCache = [];
  let activePreviewIndex = 0;

  const defaultIndicators = () => [1,2,3].map(n => ({
    id: cryptoId(),
    title: "",
    target: "",
    actual: "",
    evidence: ""
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

  function renderEvidenceChecks(selected = []) {
    evidenceChecks.innerHTML = EVIDENCE_OPTIONS.map((label, i) => {
      const checked = selected.includes(label) ? "checked" : "";
      return `<label class="evidence-item"><input type="checkbox" name="evidenceType" value="${esc(label)}" ${checked}> <span>${esc(label)}</span></label>`;
    }).join("");
  }

  function indicatorCard(item, index) {
    return `
      <article class="indicator-card" data-id="${item.id}">
        <div class="card-head">
          <h3>ตัวชี้วัดที่ ${index + 1}</h3>
          ${indicators.length > 1 ? '<button type="button" class="remove-indicator">ลบ</button>' : ''}
        </div>
        <div class="grid two">
          <label class="wide">เรื่อง / ตัวชี้วัด
            <input data-field="title" value="${esc(item.title)}" placeholder="เช่น ผู้เรียนผ่านค่าเป้าหมาย">
          </label>
          <label>TARGET
            <input data-field="target" value="${esc(item.target)}" placeholder="เช่น ≥70%">
          </label>
          <label>ACTUAL
            <input data-field="actual" value="${esc(item.actual)}" placeholder="ถ้ายังไม่มีให้เว้นว่าง">
          </label>
          <label class="wide">หลักฐาน
            <input data-field="evidence" value="${esc(item.evidence)}" placeholder="เช่น แบบประเมิน / log / รายงานผล">
          </label>
        </div>
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
    data.indicators = indicators;
    data.selectedFileNames = selectedFileNames;
    data.currentStep = currentStep;
    data.version = 1;
    return data;
  }

  function applyState(data) {
    if (!data || typeof data !== "object") return;
    Object.entries(data).forEach(([k,v]) => {
      if (["evidenceTypes","indicators","selectedFileNames","currentStep","version"].includes(k)) return;
      const el = form.elements[k];
      if (!el) return;
      if (el instanceof RadioNodeList) {
        const target = [...document.querySelectorAll(`[name="${CSS.escape(k)}"]`)].find(x => x.value === String(v));
        if (target) target.checked = true;
      } else {
        el.value = v ?? "";
      }
    });
    indicators = Array.isArray(data.indicators) && data.indicators.length ? data.indicators : defaultIndicators();
    selectedFileNames = Array.isArray(data.selectedFileNames) ? data.selectedFileNames : [];
    renderIndicators();
    renderEvidenceChecks(Array.isArray(data.evidenceTypes) ? data.evidenceTypes : []);
    renderFileNames();
    currentStep = Number.isInteger(data.currentStep) ? Math.max(0, Math.min(7, data.currentStep)) : 0;
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collectState()));
    saveState.textContent = "บันทึกแล้ว";
    window.setTimeout(() => saveState.textContent = "บันทึกอัตโนมัติ", 900);
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) applyState(JSON.parse(raw));
      else {
        indicators = defaultIndicators();
        renderIndicators();
        renderEvidenceChecks();
      }
    } catch {
      indicators = defaultIndicators();
      renderIndicators();
      renderEvidenceChecks();
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
    const indicatorTargets = indicators.map((x,i) => [`TARGET ตัวชี้วัด ${i+1}`, x.title && x.target]);
    const indicatorActuals = indicators.map((x,i) => [`ACTUAL ตัวชี้วัด ${i+1}`, x.actual && x.evidence]);
    const qual = [
      ["ผลเชิงคุณภาพ", value("learnerOutcome") || value("staffOutcome") || value("workOutcome") || value("organizationOutcome")],
      ["Journey ก่อน–หลัง", value("journeyBefore") && value("journeyAfter") && value("journeyEvidence")]
    ];
    const visuals = [...document.querySelectorAll('input[name="evidenceType"]:checked')].length;

    const draftChecks = [...basics, ...processItems, ...indicatorTargets];
    const finalChecks = [...draftChecks, ...indicatorActuals, ...qual, ["Visual Evidence", visuals >= 3]];

    const score = arr => Math.round(arr.filter(([,v]) => Boolean(v)).length / arr.length * 100);
    const missing = finalChecks.filter(([,v]) => !v).map(([label]) => label);

    const actualCount = indicators.filter(x => x.actual && x.evidence).length;
    const pendingCount = indicators.length - actualCount;

    return {
      draft: score(draftChecks),
      final: score(finalChecks),
      missing,
      actualCount,
      pendingCount,
      finalReady: score(finalChecks) === 100
    };
  }

  function renderReadiness() {
    const r = getReadiness();
    document.getElementById("draftScore").textContent = r.draft + "%";
    document.getElementById("finalScore").textContent = r.final + "%";
    document.getElementById("draftBar").style.width = r.draft + "%";
    document.getElementById("finalBar").style.width = r.final + "%";

    const state = document.getElementById("readinessState");
    state.className = "readiness-state " + (r.finalReady ? "ready" : "draft");
    state.textContent = r.finalReady
      ? "READY FOR FINAL — ข้อมูลหลักครบตามกฎของ Toolkit"
      : "DRAFT — ยังมีข้อมูลสำคัญที่ควรเติมก่อนใช้เป็น Final";

    document.getElementById("statusSummary").innerHTML = [
      `<span class="tag fact">FACT: ข้อมูลพื้นฐาน</span>`,
      `<span class="tag target">TARGET: ${indicators.filter(x=>x.target).length}</span>`,
      `<span class="tag actual">ACTUAL: ${r.actualCount}</span>`,
      `<span class="tag context">CONTEXT: ${lines(value("contextNotes")).length}</span>`,
      `<span class="tag pending">PENDING: ${r.pendingCount + r.missing.length}</span>`
    ].join("");

    document.getElementById("missingList").innerHTML = r.missing.length
      ? "<h3>สิ่งที่ยังขาด</h3>" + r.missing.map(x => `<div class="missing-item">${esc(x)}</div>`).join("")
      : '<div class="tip"><strong>ครบ:</strong> ไม่มีรายการสำคัญค้างตาม checklist อัตโนมัติ</div>';
  }

  function renderFileNames() {
    selectedFileList.innerHTML = selectedFileNames.map(n => `<span class="file-pill">${esc(n)}</span>`).join("");
  }

  function mdList(items, fallback = "- PENDING") {
    return items.length ? items.map(x => "- " + x).join("\n") : fallback;
  }

  function buildResultsSource() {
    syncIndicatorsFromDom();
    const targetLines = indicators.map((x,i) => `- **TARGET ${i+1}:** ${safe(x.title)} — ${safe(x.target)}`);
    const actualLines = indicators.map((x,i) => `- **ACTUAL ${i+1}:** ${safe(x.title)} — ${safe(x.actual)} | หลักฐาน: ${safe(x.evidence)}`);
    return `---
document_type: "presentation_results"
presenter_name: "${safe(value("presenterName"))}"
status: "${getReadiness().finalReady ? "final_candidate" : "draft_pending_evidence"}"
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

### ACTUAL

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

## 11. PENDING

${getReadiness().missing.length ? getReadiness().missing.map(x=>"- "+x).join("\n") : "- ไม่มีรายการหลักค้างตาม checklist อัตโนมัติ"}

## NotebookLM Guardrails

- ห้ามเปลี่ยน TARGET ให้เป็น ACTUAL
- ห้ามแต่งตัวเลขหรือหลักฐาน
- CONTEXT ไม่ใช่ผลสำเร็จของรอบปัจจุบันโดยอัตโนมัติ
- PENDING ต้องคงเป็น PENDING จนกว่าจะมีหลักฐาน
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
    return `# Source Manifest

## CORE SOURCES
- [x] presentation_results_source.md
- [x] visual_storyboard.md
- [x] presentation_script_${value("duration") || "5"}min.md
- [ ] เอกสารข้อตกลง/PA ฉบับจริง
- [ ] Policy Alignment (ถ้ามีและตรวจสอบแล้ว)

## VISUAL EVIDENCE
${[...document.querySelectorAll('input[name="evidenceType"]:checked')].map(x=>"- [x] "+x.value).join("\n") || "- [ ] PENDING"}

### ชื่อไฟล์ที่ผู้ใช้เลือกใน session
${files}

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
    return `# Final QA Checklist

## Identity
- [ ] ชื่อถูกต้อง: ${safe(value("presenterName"))}
- [ ] ตำแหน่งถูกต้อง
- [ ] หน่วยงานและสังกัดถูกต้อง
- [ ] รอบประเมินถูกต้อง

## Evidence
- [ ] ทุก ACTUAL มีหลักฐาน
- [ ] TARGET ไม่ถูกเรียกว่า ACTUAL
- [ ] CONTEXT ไม่ถูกเรียกว่า “ผลสำเร็จ” โดยอัตโนมัติ
- [ ] PENDING ไม่ถูกเติมด้วยการคาดเดา

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
- Status: ${r.finalReady ? "READY FOR FINAL" : "DRAFT — ยังมี PENDING"}

## รายการที่ยังขาด
${r.missing.length ? r.missing.map(x=>"- [ ] "+x).join("\n") : "- ไม่มีรายการหลักค้างตาม checklist อัตโนมัติ"}
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
    indicators.push({id:cryptoId(), title:"", target:"", actual:"", evidence:""});
    renderIndicators(); save();
  });

  indicatorCards.addEventListener("click", e => {
    if (!e.target.classList.contains("remove-indicator")) return;
    syncIndicatorsFromDom();
    const id = e.target.closest(".indicator-card").dataset.id;
    indicators = indicators.filter(x => x.id !== id);
    renderIndicators(); save();
  });

  indicatorCards.addEventListener("input", () => { syncIndicatorsFromDom(); save(); });

  form.addEventListener("input", () => save());
  form.addEventListener("change", () => save());

  document.addEventListener("click", e => {
    const pick = e.target.closest(".quick-pick[data-fill-target]");
    if (!pick) return;
    const target = form.elements[pick.dataset.fillTarget];
    if (!target) return;
    target.value = pick.dataset.fillValue || "";
    target.dispatchEvent(new Event("input", {bubbles:true}));
    document.querySelectorAll(`.quick-pick[data-fill-target="${CSS.escape(pick.dataset.fillTarget)}"]`)
      .forEach(btn => btn.classList.toggle("selected", btn === pick));
    target.focus();
  });

  evidenceFiles.addEventListener("change", () => {
    selectedFileNames = [...evidenceFiles.files].map(f => f.name);
    renderFileNames();
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
      alert("นำเข้าโปรเจกต์เรียบร้อย");
    } catch {
      alert("ไม่สามารถอ่านไฟล์โปรเจกต์นี้ได้");
    }
    e.target.value = "";
  });

  load();
  showStep(currentStep);
})();