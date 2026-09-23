(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitDocumentAudit = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function fileKey(name) {
    return clean(name)
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function versionKey(name) {
    return fileKey(name)
      .replace(/\.(pdf|docx|txt|md)$/i, "")
      .replace(/\s*\((?:copy|สำเนา|\d+)\)\s*$/i, "")
      .replace(/[_\-\s]+(?:copy|สำเนา)$/i, "")
      .trim();
  }

  function normalizeText(text) {
    return clean(text)
      .toLowerCase()
      .normalize("NFKC")
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokenSet(text, maxTokens) {
    const normalized = normalizeText(text);
    const matches = normalized.match(/[\p{L}\p{N}%./-]+/gu) || [];
    const limit = Number.isInteger(maxTokens) ? maxTokens : 6000;
    return new Set(matches.slice(0, limit).filter(x => x.length > 1));
  }

  function jaccard(a, b) {
    if (!a.size || !b.size) return 0;
    let intersection = 0;
    const smaller = a.size <= b.size ? a : b;
    const larger = a.size <= b.size ? b : a;
    smaller.forEach(x => { if (larger.has(x)) intersection += 1; });
    return intersection / (a.size + b.size - intersection);
  }

  function detectDuplicates(documents, threshold) {
    const docs = (Array.isArray(documents) ? documents : [])
      .filter(d => d && d.status === "ready" && clean(d.text).length >= 40);
    const nearThreshold = typeof threshold === "number" ? threshold : 0.86;
    const pairs = [];

    for (let i = 0; i < docs.length; i += 1) {
      for (let j = i + 1; j < docs.length; j += 1) {
        const a = docs[i];
        const b = docs[j];
        const normA = normalizeText(a.text);
        const normB = normalizeText(b.text);
        if (normA === normB) {
          pairs.push({
            type:"exact_duplicate",
            aId:a.id, bId:b.id, aName:a.name, bName:b.name,
            similarity:1,
            message:"เนื้อหาเหมือนกันทุกประการ"
          });
          continue;
        }
        const tokensA = tokenSet(normA);
        const tokensB = tokenSet(normB);
        if (Math.min(tokensA.size, tokensB.size) < 20) continue;
        const score = jaccard(tokensA, tokensB);
        if (score >= nearThreshold) {
          pairs.push({
            type:"near_duplicate",
            aId:a.id, bId:b.id, aName:a.name, bName:b.name,
            similarity:Number(score.toFixed(3)),
            message:"เนื้อหาใกล้เคียงกันมาก"
          });
        }
      }
    }
    return pairs;
  }

  function detectVersionConflicts(documents) {
    const docs = (Array.isArray(documents) ? documents : [])
      .filter(d => d && d.status === "ready" && clean(d.name));
    const issues = [];

    for (let i = 0; i < docs.length; i += 1) {
      for (let j = i + 1; j < docs.length; j += 1) {
        const a = docs[i];
        const b = docs[j];
        if (versionKey(a.name) !== versionKey(b.name)) continue;
        const sameContent = normalizeText(a.text) === normalizeText(b.text);
        if (!sameContent) {
          issues.push({
            type:"same_name_different_content",
            aId:a.id, bId:b.id, aName:a.name, bName:b.name,
            message:"ชื่อไฟล์/ชื่อเวอร์ชันใกล้กัน แต่เนื้อหาไม่เหมือนกัน — ควรตรวจว่าเป็นคนละรุ่นหรือไม่"
          });
        }
      }
    }
    return issues;
  }

  function detectRoleConflicts(documents, duplicatePairs) {
    const byId = new Map((Array.isArray(documents) ? documents : []).map(d => [d.id, d]));
    return (Array.isArray(duplicatePairs) ? duplicatePairs : [])
      .map(pair => {
        const a = byId.get(pair.aId);
        const b = byId.get(pair.bId);
        if (!a || !b || !a.role || !b.role || a.role === b.role) return null;
        return {
          type:"duplicate_role_mismatch",
          aId:a.id, bId:b.id, aName:a.name, bName:b.name,
          roleA:a.role, roleB:b.role,
          message:"เอกสารที่ซ้ำ/ใกล้ซ้ำถูกกำหนดบทบาทต่างกัน"
        };
      })
      .filter(Boolean);
  }

  function parseSourcePage(value) {
    const raw = clean(value);
    if (!raw) return "";
    const range = raw.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (range) return range[1] + "-" + range[2];
    const single = raw.match(/\d+/);
    return single ? single[0] : "";
  }

  function findDocumentBySource(documents, sourceFile) {
    const key = fileKey(sourceFile);
    if (!key) return null;
    const docs = Array.isArray(documents) ? documents : [];
    return docs.find(d => fileKey(d.name) === key) || null;
  }

  function auditIndicatorSources(indicators, documents, parsePageSpec) {
    const list = Array.isArray(indicators) ? indicators : [];
    const docs = Array.isArray(documents) ? documents : [];
    const issues = [];
    let linked = 0;

    list.forEach((indicator, index) => {
      const source = clean(indicator && indicator.sourceFile);
      if (!source) return;
      const doc = findDocumentBySource(docs, source);
      if (!doc) {
        issues.push({
          type:"source_not_loaded",
          indicatorIndex:index,
          title:clean(indicator.title),
          sourceFile:source,
          message:"ยังไม่พบไฟล์ต้นทางนี้ใน Document Reader ของ session ปัจจุบัน"
        });
        return;
      }
      linked += 1;
      const pageSpec = parseSourcePage(indicator.sourcePage);
      if (pageSpec && doc.pages && typeof parsePageSpec === "function") {
        const parsed = parsePageSpec(pageSpec, doc.pages);
        if (parsed.error) {
          issues.push({
            type:"source_page_invalid",
            indicatorIndex:index,
            title:clean(indicator.title),
            sourceFile:source,
            sourcePage:clean(indicator.sourcePage),
            message:parsed.error
          });
        }
      }
    });

    return {linked, issues};
  }

  function audit(documents, indicators, parsePageSpec) {
    const duplicates = detectDuplicates(documents);
    const versionConflicts = detectVersionConflicts(documents);
    const roleConflicts = detectRoleConflicts(documents, duplicates);
    const sourceAudit = auditIndicatorSources(indicators, documents, parsePageSpec);
    return {
      duplicates,
      versionConflicts,
      roleConflicts,
      sourceLinks:sourceAudit.linked,
      sourceIssues:sourceAudit.issues,
      issueCount:duplicates.length + versionConflicts.length + roleConflicts.length + sourceAudit.issues.length
    };
  }

  return {
    fileKey,
    versionKey,
    normalizeText,
    tokenSet,
    jaccard,
    detectDuplicates,
    detectVersionConflicts,
    detectRoleConflicts,
    parseSourcePage,
    findDocumentBySource,
    auditIndicatorSources,
    audit
  };
});
