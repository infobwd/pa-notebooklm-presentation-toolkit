(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitVisualEvidence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_PLAN = {
    schema_version: "pa-toolkit/visual-naming-plan/1",
    title: "Generic Visual Evidence Naming Plan",
    slots: [
      {id:"10_presenter", order:10, filename:"10_presenter_01.jpg", label:"ภาพผู้รับการประเมิน", evidenceType:"ภาพผู้รับการประเมิน"},
      {id:"11_organization", order:11, filename:"11_organization_01.jpg", label:"ภาพสถานศึกษา/หน่วยงาน", evidenceType:"ภาพสถานศึกษา/หน่วยงาน"},
      {id:"12_model", order:12, filename:"12_model_framework.png", label:"Model / Framework", evidenceType:"Model / Framework"},
      {id:"13_process", order:13, filename:"13_process_overview.png", label:"ภาพรวมกระบวนการ", evidenceType:"Model / Framework"},
      {id:"14_process_real", order:14, filename:"14_process_real_01.jpg", label:"กิจกรรมพัฒนางานจริง", evidenceType:"ภาพกิจกรรมจริง"},
      {id:"15_classroom", order:15, filename:"15_active_classroom_01.jpg", label:"ห้องเรียน / งานปฏิบัติจริง", evidenceType:"ห้องเรียน / งานปฏิบัติจริง"},
      {id:"16_system_01", order:16, filename:"16_system_01.png", label:"Screenshot ระบบ 1", evidenceType:"Screenshot ระบบ"},
      {id:"17_system_02", order:17, filename:"17_system_02.png", label:"Screenshot ระบบ 2", evidenceType:"Screenshot ระบบ"},
      {id:"18_system_03", order:18, filename:"18_system_03.png", label:"Screenshot ระบบ 3", evidenceType:"Screenshot ระบบ"},
      {id:"19_safety", order:19, filename:"19_safety_system.png", label:"ระบบ/หลักฐานด้านความปลอดภัย", evidenceType:"Screenshot ระบบ"},
      {id:"20_network", order:20, filename:"20_network_dashboard.png", label:"Dashboard / การขยายผล", evidenceType:"การขยายผล"},
      {id:"21_recognition", order:21, filename:"21_recognition_01.jpg", label:"รางวัล / การยอมรับ", evidenceType:"รางวัล / การยอมรับ"},
      {id:"22_baseline", order:22, filename:"22_baseline_chart_01.png", label:"กราฟข้อมูลตั้งต้น", evidenceType:"กราฟผล ACTUAL"},
      {id:"23_information", order:23, filename:"23_information_chart_01.png", label:"กราฟข้อมูลระหว่างพัฒนา", evidenceType:"กราฟผล ACTUAL"},
      {id:"24_context_outcome", order:24, filename:"24_context_outcome_chart.png", label:"กราฟผล/บริบทสำคัญ", evidenceType:"กราฟผล ACTUAL"}
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function extension(name) {
    const match = clean(name).toLowerCase().match(/\.([a-z0-9]+)$/);
    return match ? match[1] : "";
  }

  function normalizeExt(ext) {
    const value = clean(ext).toLowerCase().replace(/^\./, "");
    if (value === "jpeg") return "jpg";
    return value;
  }

  function baseName(name) {
    return clean(name).replace(/\.[^.]+$/, "");
  }

  function validFilename(name) {
    const value = clean(name);
    if (!value || value.length > 180) return false;
    if (/[\\/:*?"<>|]/.test(value)) return false;
    return /^[\p{L}\p{N}._()\- ]+$/u.test(value);
  }

  function normalizeSlot(slot, index) {
    const source = slot && typeof slot === "object" ? slot : {};
    const filename = clean(source.filename);
    return {
      id: clean(source.id) || "slot_" + String(index + 1).padStart(2, "0"),
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : index + 1,
      filename,
      label: clean(source.label) || filename || "Visual " + (index + 1),
      evidenceType: clean(source.evidenceType),
      aliases: Array.isArray(source.aliases) ? source.aliases.map(clean).filter(Boolean) : []
    };
  }

  function normalizePlan(input) {
    const source = input && typeof input === "object" ? input : {};
    const slots = Array.isArray(source.slots) ? source.slots.map(normalizeSlot) : [];
    const validSlots = slots.filter(slot => slot.filename && validFilename(slot.filename));
    return {
      schema_version: "pa-toolkit/visual-naming-plan/1",
      title: clean(source.title) || "Custom Visual Evidence Naming Plan",
      slots: validSlots.sort((a,b) => a.order - b.order)
    };
  }

  function defaultPlan() {
    return clone(DEFAULT_PLAN);
  }

  function planIssues(plan) {
    const normalized = normalizePlan(plan);
    const issues = [];
    if (!normalized.slots.length) issues.push("แผนไม่มีชื่อไฟล์ที่ใช้ได้");
    const seen = new Set();
    normalized.slots.forEach(slot => {
      const key = slot.filename.toLowerCase();
      if (seen.has(key)) issues.push("ชื่อไฟล์ซ้ำ: " + slot.filename);
      seen.add(key);
    });
    return issues;
  }

  function fileExtMatches(canonicalName, originalName) {
    const a = normalizeExt(extension(canonicalName));
    const b = normalizeExt(extension(originalName));
    if (!a || !b) return true;
    return a === b;
  }

  function nextFreeSlot(plan, usedSlotIds) {
    const used = new Set(Array.isArray(usedSlotIds) ? usedSlotIds : []);
    return normalizePlan(plan).slots.find(slot => !used.has(slot.id)) || null;
  }

  function matchSlotByFilename(plan, filename) {
    const normalized = normalizePlan(plan);
    const file = clean(filename).toLowerCase();
    const fileBase = baseName(file);
    return normalized.slots.find(slot => {
      const target = slot.filename.toLowerCase();
      if (file === target) return true;
      const targetBase = baseName(target);
      if (fileBase === targetBase) return true;
      return slot.aliases.some(alias => fileBase.includes(alias.toLowerCase()));
    }) || null;
  }

  function resolvedDownloadName(canonicalName, originalName) {
    const canonical = clean(canonicalName);
    if (!canonical) return clean(originalName);
    if (fileExtMatches(canonical, originalName)) return canonical;
    const originalExt = normalizeExt(extension(originalName));
    return originalExt ? baseName(canonical) + "." + originalExt : canonical;
  }

  return {
    defaultPlan,
    normalizePlan,
    planIssues,
    extension,
    normalizeExt,
    baseName,
    validFilename,
    fileExtMatches,
    nextFreeSlot,
    matchSlotByFilename,
    resolvedDownloadName
  };
});
