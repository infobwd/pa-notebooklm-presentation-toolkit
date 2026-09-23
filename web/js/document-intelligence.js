(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PAToolkitDocumentIntelligence = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_MAX_CHARS = 1400;
  const DEFAULT_OVERLAP = 180;

  function clean(value) {
    return value == null ? "" : String(value).replace(/\u00a0/g, " ").trim();
  }

  function normalize(value) {
    return clean(value).toLowerCase().replace(/\s+/g, " ");
  }

  function segmentWords(text) {
    const value = normalize(text);
    if (!value) return [];
    const words = [];
    try {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("th", {granularity:"word"});
        for (const item of segmenter.segment(value)) {
          if (!item.isWordLike) continue;
          const token = item.segment.replace(/[^\p{L}\p{N}%]+/gu, "");
          if (token.length >= 2 || /^\d+$/.test(token)) words.push(token);
        }
      }
    } catch {}
    if (!words.length) {
      value.split(/[^\p{L}\p{N}%]+/gu)
        .map(x => x.trim())
        .filter(x => x.length >= 2 || /^\d+$/.test(x))
        .forEach(x => words.push(x));
    }
    return [...new Set(words)];
  }

  function queryTerms(query) {
    const value = normalize(query);
    const terms = segmentWords(value);
    if (value.length >= 2) terms.unshift(value);
    return [...new Set(terms)].filter(Boolean);
  }

  function findBreak(text, target, min) {
    const candidates = ["\n\n","\n","。",". ","! ","? "," "];
    for (const marker of candidates) {
      const pos = text.lastIndexOf(marker, target);
      if (pos >= min) return pos + marker.length;
    }
    return target;
  }

  function chunkText(text, options) {
    const value = clean(text);
    if (!value) return [];
    const opts = options || {};
    const maxChars = Math.max(400, Number(opts.maxChars) || DEFAULT_MAX_CHARS);
    const overlapChars = Math.min(Math.max(0, Number(opts.overlapChars) || DEFAULT_OVERLAP), Math.floor(maxChars / 3));
    if (value.length <= maxChars) {
      return [{text:value,start:0,end:value.length,chunkIndex:0}];
    }

    const chunks = [];
    let start = 0;
    let guard = 0;
    while (start < value.length && guard < 10000) {
      guard += 1;
      const hardEnd = Math.min(value.length, start + maxChars);
      const end = hardEnd < value.length
        ? findBreak(value, hardEnd, Math.min(hardEnd, start + Math.floor(maxChars * .62)))
        : value.length;
      const chunk = value.slice(start,end).trim();
      if (chunk) chunks.push({text:chunk,start,end,chunkIndex:chunks.length});
      if (end >= value.length) break;
      const next = Math.max(start + 1, end - overlapChars);
      start = next;
    }
    return chunks;
  }

  function pageSourceText(page) {
    if (!page || typeof page !== "object") return "";
    return clean(page.text || page.ocrText || page.nativeText);
  }

  function buildChunks(documents, options) {
    const docs = Array.isArray(documents) ? documents : [];
    const out = [];
    docs.forEach((doc,docIndex) => {
      if (!doc || doc.status !== "ready") return;
      const docId = clean(doc.id) || "doc-" + docIndex;
      const docName = clean(doc.name) || "document-" + (docIndex + 1);
      if (Array.isArray(doc.pageTexts) && doc.pageTexts.length) {
        doc.pageTexts.forEach((page,pageIndex) => {
          const text = pageSourceText(page);
          chunkText(text,options).forEach(part => out.push({
            id:`${docId}:p${Number(page.page) || pageIndex + 1}:c${part.chunkIndex}`,
            docId, docName,
            page:Number(page.page) || pageIndex + 1,
            chunkIndex:part.chunkIndex,
            text:part.text,
            start:part.start,
            end:part.end,
            role:clean(doc.role),
            extractionMode:clean(page.extractionMode || "native")
          }));
        });
      } else {
        chunkText(doc.text,options).forEach(part => out.push({
          id:`${docId}:c${part.chunkIndex}`,
          docId, docName,
          page:null,
          chunkIndex:part.chunkIndex,
          text:part.text,
          start:part.start,
          end:part.end,
          role:clean(doc.role),
          extractionMode:"native"
        }));
      }
    });
    return out;
  }

  function countOccurrences(haystack,needle) {
    if (!needle) return 0;
    let count = 0;
    let pos = 0;
    while ((pos = haystack.indexOf(needle,pos)) !== -1) {
      count += 1;
      pos += Math.max(1,needle.length);
      if (count >= 20) break;
    }
    return count;
  }

  function scoreChunk(chunk, query) {
    const text = normalize(chunk && chunk.text);
    const q = normalize(query);
    if (!text || !q) return null;
    const words = segmentWords(q);
    const uniqueWords = [...new Set(words)];
    let score = 0;
    let matched = 0;

    if (text.includes(q)) {
      score += 16 + Math.min(10,countOccurrences(text,q) * 2);
      matched += Math.max(1,uniqueWords.length);
    }

    uniqueWords.forEach(term => {
      const hits = countOccurrences(text,term);
      if (!hits) return;
      matched += 1;
      score += 3 + Math.min(6,hits);
      if (text.startsWith(term)) score += 1;
    });

    if (!score) return null;
    const coverage = uniqueWords.length ? Math.min(1,matched / uniqueWords.length) : 1;
    score += coverage * 8;
    if (chunk.page != null) score += .15;
    if (chunk.extractionMode === "ocr") score -= .15;

    return {
      ...chunk,
      score,
      coverage,
      matchedTerms:uniqueWords.filter(term => text.includes(term))
    };
  }

  function excerptFor(text, query, maxChars) {
    const value = clean(text);
    const limit = Math.max(180,Number(maxChars) || 360);
    if (value.length <= limit) return value;
    const normalized = value.toLowerCase();
    const terms = queryTerms(query).sort((a,b) => b.length - a.length);
    let hit = -1;
    for (const term of terms) {
      hit = normalized.indexOf(term.toLowerCase());
      if (hit >= 0) break;
    }
    if (hit < 0) return value.slice(0,limit).trim() + "…";
    const start = Math.max(0,hit - Math.floor(limit * .34));
    const end = Math.min(value.length,start + limit);
    return (start ? "…" : "") + value.slice(start,end).trim() + (end < value.length ? "…" : "");
  }

  function searchChunks(chunks, query, options) {
    const opts = options || {};
    const limit = Math.max(1,Math.min(100,Number(opts.limit) || 40));
    const allowedDocIds = opts.allowedDocIds ? new Set(opts.allowedDocIds) : null;
    return (Array.isArray(chunks) ? chunks : [])
      .filter(chunk => !allowedDocIds || allowedDocIds.has(chunk.docId))
      .map(chunk => scoreChunk(chunk,query))
      .filter(Boolean)
      .sort((a,b) => b.score - a.score || (a.page || 0) - (b.page || 0))
      .slice(0,limit)
      .map(item => ({...item,excerpt:excerptFor(item.text,query,opts.excerptChars)}));
  }

  function aggregatePageResults(results, options) {
    const limit = Math.max(1,Math.min(50,Number(options && options.limit) || 20));
    const groups = new Map();
    (Array.isArray(results) ? results : []).forEach(item => {
      const key = item.docId + "::" + (item.page == null ? "document" : item.page);
      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          docId:item.docId,
          docName:item.docName,
          page:item.page,
          role:item.role,
          extractionMode:item.extractionMode,
          score:0,
          bestScore:0,
          hitCount:0,
          excerpts:[],
          matchedTerms:new Set()
        };
        groups.set(key,group);
      }
      group.hitCount += 1;
      group.bestScore = Math.max(group.bestScore,item.score || 0);
      group.score += item.score || 0;
      if (item.excerpt && group.excerpts.length < 2) group.excerpts.push(item.excerpt);
      (item.matchedTerms || []).forEach(term => group.matchedTerms.add(term));
      if (item.extractionMode === "ocr") group.extractionMode = "ocr";
    });
    return [...groups.values()]
      .map(group => ({
        ...group,
        score:group.bestScore + Math.min(8,(group.hitCount - 1) * 1.5),
        matchedTerms:[...group.matchedTerms]
      }))
      .sort((a,b) => b.score - a.score || a.docName.localeCompare(b.docName) || (a.page || 0) - (b.page || 0))
      .slice(0,limit);
  }

  function contextQueries(fields, indicators) {
    const out = [];
    const add = (label,value) => {
      const text = clean(value);
      if (!text) return;
      const short = text.replace(/\s+/g," ").slice(0,120);
      if (!out.some(item => item.query === short)) out.push({label,query:short});
    };
    const source = fields || {};
    add("ประเด็นท้าทาย",source.challengeTitle);
    add("ความต้องการพัฒนา",source.developmentNeed);
    (Array.isArray(indicators) ? indicators : []).forEach((item,index) => add("ตัวชี้วัด " + (index + 1),item && item.title));
    return out.slice(0,8);
  }

  return {
    DEFAULT_MAX_CHARS,
    DEFAULT_OVERLAP,
    normalize,
    segmentWords,
    queryTerms,
    chunkText,
    buildChunks,
    scoreChunk,
    excerptFor,
    searchChunks,
    aggregatePageResults,
    contextQueries
  };
});
