(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitReliability = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const INDICATOR_FIELDS = [
    "id","title","target","actual","evidence",
    "actualNumerator","actualDenominator",
    "sourceFile","sourcePage","period","population","cohortId","verification"
  ];

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function isPending(value) {
    const v = clean(value).toUpperCase();
    return !v || v === "PENDING" || v.startsWith("PENDING ");
  }

  function isMeaningful(value) {
    return !isPending(value);
  }

  function calculatePercentage(numerator, denominator, decimals) {
    const n = Number(numerator);
    const d = Number(denominator);
    const digits = Number.isInteger(decimals) ? decimals : 2;
    if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0 || n < 0) return null;
    const pct = (n / d) * 100;
    return Number(pct.toFixed(digits));
  }

  function formatCalculatedActual(numerator, denominator, decimals) {
    const pct = calculatePercentage(numerator, denominator, decimals);
    if (pct == null) return "";
    return clean(numerator) + "/" + clean(denominator) + " = " + pct + "%";
  }

  function normalizeIndicator(input) {
    const source = input && typeof input === "object" ? input : {};
    const out = {};
    INDICATOR_FIELDS.forEach(function (key) {
      out[key] = clean(source[key]);
    });
    if (!out.verification) out.verification = "unverified";
    return out;
  }

  function validateIndicatorTrace(input) {
    const indicator = normalizeIndicator(input);
    const issues = [];
    const hasActual = isMeaningful(indicator.actual);

    if (!hasActual) {
      issues.push("ACTUAL ยังเป็น PENDING/ว่าง");
      return {ready:false, hasActual:false, issues:issues, indicator:indicator};
    }

    if (!isMeaningful(indicator.evidence)) issues.push("ยังไม่มีหลักฐาน ACTUAL");
    if (!isMeaningful(indicator.sourceFile)) issues.push("ยังไม่ระบุไฟล์ต้นทาง");
    if (!isMeaningful(indicator.period)) issues.push("ยังไม่ระบุช่วงเวลา");
    if (!isMeaningful(indicator.population)) issues.push("ยังไม่ระบุกลุ่มเป้าหมาย/ประชากร");
    if (indicator.verification !== "verified") issues.push("ผู้ใช้ยังไม่ได้ยืนยันกับต้นฉบับ");

    const hasNumerator = clean(indicator.actualNumerator) !== "";
    const hasDenominator = clean(indicator.actualDenominator) !== "";
    if (hasNumerator || hasDenominator) {
      const pct = calculatePercentage(indicator.actualNumerator, indicator.actualDenominator, 2);
      if (pct == null) issues.push("ตัวตั้ง/ตัวหารของ ACTUAL ไม่ถูกต้อง");
    }

    return {
      ready: issues.length === 0,
      hasActual:true,
      issues:issues,
      indicator:indicator
    };
  }

  function parsePageSpec(spec, totalPages) {
    const max = Number(totalPages);
    const raw = clean(spec);
    if (!Number.isInteger(max) || max < 1) return {pages:[], error:"จำนวนหน้าไม่ถูกต้อง"};
    if (!raw) return {pages:Array.from({length:max}, function (_,i) { return i + 1; }), error:""};

    const set = new Set();
    const tokens = raw.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
    for (const token of tokens) {
      if (/^\d+$/.test(token)) {
        const page = Number(token);
        if (page < 1 || page > max) return {pages:[], error:"หน้าที่ระบุอยู่นอกช่วง 1-" + max};
        set.add(page);
        continue;
      }
      const match = token.match(/^(\d+)\s*-\s*(\d+)$/);
      if (!match) return {pages:[], error:"รูปแบบหน้าไม่ถูกต้อง: " + token};
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (start < 1 || end < 1 || start > end || end > max) {
        return {pages:[], error:"ช่วงหน้าไม่ถูกต้อง: " + token};
      }
      for (let page = start; page <= end; page += 1) set.add(page);
    }
    return {pages:Array.from(set).sort(function (a,b) { return a-b; }), error:""};
  }

  function normalizeComparable(value) {
    return clean(value).replace(/\s+/g, " ").toLowerCase();
  }

  function detectFieldConflicts(current, incoming, keys) {
    const conflicts = [];
    (keys || []).forEach(function (key) {
      const a = current ? current[key] : "";
      const b = incoming ? incoming[key] : "";
      if (!isMeaningful(a) || !isMeaningful(b)) return;
      if (normalizeComparable(a) !== normalizeComparable(b)) {
        conflicts.push({type:"field", key:key, current:clean(a), incoming:clean(b)});
      }
    });
    return conflicts;
  }

  function detectIndicatorConflicts(currentIndicators, incomingIndicators) {
    const current = Array.isArray(currentIndicators) ? currentIndicators.map(normalizeIndicator) : [];
    const incoming = Array.isArray(incomingIndicators) ? incomingIndicators.map(normalizeIndicator) : [];
    const conflicts = [];

    incoming.forEach(function (next) {
      const title = normalizeComparable(next.title);
      if (!title) return;
      const prev = current.find(function (item) { return normalizeComparable(item.title) === title; });
      if (!prev) return;
      ["target","actual","period","population","cohortId"].forEach(function (key) {
        if (!isMeaningful(prev[key]) || !isMeaningful(next[key])) return;
        if (normalizeComparable(prev[key]) !== normalizeComparable(next[key])) {
          conflicts.push({
            type:"indicator",
            title:next.title,
            key:key,
            current:prev[key],
            incoming:next[key]
          });
        }
      });
    });
    return conflicts;
  }

  return {
    clean:clean,
    isPending:isPending,
    isMeaningful:isMeaningful,
    calculatePercentage:calculatePercentage,
    formatCalculatedActual:formatCalculatedActual,
    normalizeIndicator:normalizeIndicator,
    validateIndicatorTrace:validateIndicatorTrace,
    parsePageSpec:parsePageSpec,
    detectFieldConflicts:detectFieldConflicts,
    detectIndicatorConflicts:detectIndicatorConflicts
  };
});
