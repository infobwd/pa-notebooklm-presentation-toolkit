(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitEvidenceReview = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const REVIEW_STATUSES = ["candidate","checked","rejected"];
  const CLASSIFICATIONS = ["unclassified","fact","target","actual","context","pending"];

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function normalizeStatus(value) {
    const status = clean(value).toLowerCase();
    return REVIEW_STATUSES.includes(status) ? status : "candidate";
  }

  function normalizeClassification(value) {
    const item = clean(value).toLowerCase();
    return CLASSIFICATIONS.includes(item) ? item : "unclassified";
  }

  function normalizeNote(item) {
    const source = item && typeof item === "object" ? item : {};
    return {
      id: clean(source.id),
      sourceFile: clean(source.sourceFile),
      sourcePage: clean(source.sourcePage),
      excerpt: clean(source.excerpt),
      query: clean(source.query),
      sectionHint: clean(source.sectionHint),
      classification: normalizeClassification(source.classification),
      linkedIndicatorId: clean(source.linkedIndicatorId),
      reviewStatus: normalizeStatus(source.reviewStatus),
      note: clean(source.note),
      extractionMode: clean(source.extractionMode || "native")
    };
  }

  const HEADING_PATTERNS = [
    ["ผลการดำเนินงาน", /ผลการดำเนินงาน/iu],
    ["ผลลัพธ์", /ผลลัพธ์|ผลสัมฤทธิ์/iu],
    ["ตัวชี้วัด", /ตัวชี้วัด|indicator/iu],
    ["เป้าหมาย", /เป้าหมาย|target/iu],
    ["วิธีดำเนินงาน", /วิธีดำเนินงาน|กระบวนการดำเนินงาน|process/iu],
    ["บริบท/ข้อมูลฐาน", /บริบท|ข้อมูลฐาน|baseline|context/iu],
    ["การพัฒนา", /การพัฒนา|development/iu],
    ["กิจกรรม", /กิจกรรม|activity/iu],
    ["รางวัล/การยอมรับ", /รางวัล|การยอมรับ|award|recognition/iu],
    ["นโยบาย", /นโยบาย|policy/iu],
    ["ภาคผนวก", /ภาคผนวก|appendix/iu],
    ["สรุป", /สรุป|summary/iu]
  ];

  function detectSectionHints(text) {
    const value = clean(text);
    if (!value) return [];
    return HEADING_PATTERNS.filter(([,pattern]) => pattern.test(value)).map(([label]) => label).slice(0,4);
  }

  function makeKey(note) {
    const n = normalizeNote(note);
    return [n.sourceFile.toLowerCase(),n.sourcePage.toLowerCase(),n.query.toLowerCase()].join("::");
  }

  function isDuplicate(notes,note) {
    const key = makeKey(note);
    return (Array.isArray(notes) ? notes : []).map(normalizeNote).some(item => makeKey(item) === key);
  }

  function createFromSearchResult(result,query,id) {
    const source = result && typeof result === "object" ? result : {};
    const excerpt = clean(Array.isArray(source.excerpts) ? source.excerpts.join(" … ") : source.excerpt);
    return normalizeNote({
      id:clean(id),
      sourceFile:clean(source.docName),
      sourcePage:source.page == null ? "" : "หน้า " + source.page,
      excerpt,
      query:clean(query),
      sectionHint:detectSectionHints(excerpt).join(" · "),
      classification:"unclassified",
      linkedIndicatorId:"",
      reviewStatus:"candidate",
      note:"",
      extractionMode:clean(source.extractionMode || "native")
    });
  }

  function counts(notes) {
    const normalized = (Array.isArray(notes) ? notes : []).map(normalizeNote);
    return {
      total:normalized.length,
      candidate:normalized.filter(x => x.reviewStatus === "candidate").length,
      checked:normalized.filter(x => x.reviewStatus === "checked").length,
      rejected:normalized.filter(x => x.reviewStatus === "rejected").length,
      linked:normalized.filter(x => x.linkedIndicatorId).length
    };
  }

  function classificationLabel(value) {
    return {
      unclassified:"ยังไม่จัดประเภท",
      fact:"FACT",
      target:"TARGET",
      actual:"ACTUAL",
      context:"CONTEXT",
      pending:"PENDING"
    }[normalizeClassification(value)];
  }

  function statusLabel(value) {
    return {
      candidate:"รอตรวจ",
      checked:"ตรวจต้นฉบับแล้ว",
      rejected:"ไม่ใช้"
    }[normalizeStatus(value)];
  }

  function markdown(notes,indicatorLookup) {
    const normalized = (Array.isArray(notes) ? notes : []).map(normalizeNote);
    const lookup = typeof indicatorLookup === "function" ? indicatorLookup : () => "";
    const lines = [
      "# Evidence Review Notes",
      "",
      "> Review Status เป็นบันทึกการตรวจเอกสารใน Document Reader ไม่ใช่ Evidence Trace Verification และไม่ทำให้ ACTUAL เป็น VERIFIED อัตโนมัติ",
      ""
    ];
    if (!normalized.length) {
      lines.push("- PENDING — ยังไม่มี Evidence Review Note");
      return lines.join("\n");
    }
    normalized.forEach((item,index) => {
      lines.push(
        `## ${index + 1}. ${item.sourceFile || "Unknown source"}${item.sourcePage ? " · " + item.sourcePage : ""}`,
        `- Review: **${statusLabel(item.reviewStatus)}**`,
        `- Classification: **${classificationLabel(item.classification)}**`,
        `- Query: ${item.query || "—"}`,
        `- Section hint: ${item.sectionHint || "—"}`,
        `- Linked indicator: ${item.linkedIndicatorId ? (lookup(item.linkedIndicatorId) || item.linkedIndicatorId) : "—"}`,
        `- Extraction: ${item.extractionMode === "ocr" ? "OCR — ตรวจทานก่อนใช้" : item.extractionMode || "native"}`,
        `- Note: ${item.note || "—"}`,
        "",
        item.excerpt ? `> ${item.excerpt.replace(/\n+/g," ")}` : "> —",
        ""
      );
    });
    return lines.join("\n");
  }

  return {
    REVIEW_STATUSES,
    CLASSIFICATIONS,
    normalizeNote,
    detectSectionHints,
    makeKey,
    isDuplicate,
    createFromSearchResult,
    counts,
    classificationLabel,
    statusLabel,
    markdown
  };
});
