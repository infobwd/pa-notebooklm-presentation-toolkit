(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitOCR = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_MIN_CHARS = 28;

  function clean(value) {
    return value == null ? "" : String(value).trim();
  }

  function compactLength(text) {
    return clean(text).replace(/\s+/g, "").length;
  }

  function normalizePage(item, index) {
    const source = item && typeof item === "object" ? item : {};
    const nativeText = clean(source.nativeText != null ? source.nativeText : source.text);
    const ocrText = clean(source.ocrText);
    const text = clean(source.text || ocrText || nativeText);
    return {
      ...source,
      page: Number(source.page) || index + 1,
      nativeText,
      ocrText,
      text,
      extractionMode: source.extractionMode || (ocrText ? "ocr" : "native"),
      ocrConfidence: Number.isFinite(Number(source.ocrConfidence)) ? Number(source.ocrConfidence) : null
    };
  }

  function candidatePages(pageTexts, minChars) {
    const threshold = Number.isFinite(Number(minChars)) ? Number(minChars) : DEFAULT_MIN_CHARS;
    return (Array.isArray(pageTexts) ? pageTexts : [])
      .map(normalizePage)
      .filter(item => compactLength(item.nativeText) < threshold)
      .map(item => item.page);
  }

  function scanAssessment(pageTexts, minChars) {
    const pages = (Array.isArray(pageTexts) ? pageTexts : []).map(normalizePage);
    const candidates = candidatePages(pages, minChars);
    const ratio = pages.length ? candidates.length / pages.length : 0;
    return {
      totalPages: pages.length,
      candidatePages: candidates,
      candidateCount: candidates.length,
      candidateRatio: ratio,
      likelyScanned: Boolean(pages.length) && (ratio >= 0.5 || candidates.length === pages.length),
      hasAnyCandidate: candidates.length > 0
    };
  }

  function compressPages(pages) {
    const values = [...new Set((Array.isArray(pages) ? pages : [])
      .map(Number)
      .filter(Number.isInteger)
      .filter(n => n > 0))]
      .sort((a,b) => a-b);
    if (!values.length) return "";

    const parts = [];
    let start = values[0];
    let prev = values[0];
    for (let i = 1; i <= values.length; i += 1) {
      const current = values[i];
      if (current === prev + 1) {
        prev = current;
        continue;
      }
      parts.push(start === prev ? String(start) : start + "-" + prev);
      start = current;
      prev = current;
    }
    return parts.join(",");
  }

  function normalizeLanguages(value) {
    const raw = clean(value).toLowerCase();
    if (raw === "tha") return ["tha"];
    if (raw === "eng") return ["eng"];
    return ["tha","eng"];
  }

  function mergeOcrResults(pageTexts, results) {
    const resultMap = new Map((Array.isArray(results) ? results : []).map(item => [Number(item.page), item]));
    return (Array.isArray(pageTexts) ? pageTexts : []).map((item,index) => {
      const page = normalizePage(item,index);
      const result = resultMap.get(page.page);
      if (!result) return page;

      const ocrText = clean(result.text);
      const confidence = Number.isFinite(Number(result.confidence)) ? Number(result.confidence) : null;
      if (!ocrText) {
        return {
          ...page,
          ocrText:"",
          ocrConfidence:confidence,
          extractionMode:page.nativeText ? "native" : "ocr_empty"
        };
      }

      return {
        ...page,
        text:ocrText,
        ocrText,
        ocrConfidence:confidence,
        extractionMode:"ocr"
      };
    });
  }

  function rebuildPdfText(pageTexts) {
    return (Array.isArray(pageTexts) ? pageTexts : [])
      .map((item,index) => {
        const page = normalizePage(item,index);
        const tag = page.extractionMode === "ocr"
          ? " [OCR — ตรวจทานก่อนใช้]"
          : page.extractionMode === "ocr_empty"
            ? " [OCR ไม่พบข้อความ]"
            : "";
        return `--- หน้า ${page.page}${tag} ---\n${page.text}`;
      })
      .join("\n\n")
      .trim();
  }

  function averageConfidence(pageTexts) {
    const values = (Array.isArray(pageTexts) ? pageTexts : [])
      .map(item => item && item.ocrConfidence)
      .filter(value => value !== null && value !== undefined && value !== "")
      .map(Number)
      .filter(Number.isFinite);
    if (!values.length) return null;
    return values.reduce((sum,value) => sum + value,0) / values.length;
  }

  return {
    DEFAULT_MIN_CHARS,
    compactLength,
    normalizePage,
    candidatePages,
    scanAssessment,
    compressPages,
    normalizeLanguages,
    mergeOcrResults,
    rebuildPdfText,
    averageConfidence
  };
});
