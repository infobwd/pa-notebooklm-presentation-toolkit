const assert = require("assert");
const A = require("../js/document-audit.js");

const docs = [
  {id:"a",name:"results.pdf",status:"ready",role:"assessment_result",text:"TARGET การอ่าน 75% ผลจริง 80% นักเรียน 30 คน"},
  {id:"b",name:"results (1).pdf",status:"ready",role:"assessment_result",text:"TARGET การอ่าน 75% ผลจริง 80% นักเรียน 30 คน"},
  {id:"c",name:"results copy.pdf",status:"ready",role:"sar_context",text:"TARGET การอ่าน 70% ผลจริง 72% นักเรียน 30 คน"}
];

const dup = A.detectDuplicates(docs);
assert.strictEqual(dup.length >= 1, true);
assert.strictEqual(dup[0].type, "exact_duplicate");

const versions = A.detectVersionConflicts(docs);
assert.strictEqual(versions.length >= 1, true);

assert.strictEqual(A.parseSourcePage("หน้า 4"), "4");
assert.strictEqual(A.parseSourcePage("หน้า 4-6"), "4-6");
assert.strictEqual(A.fileKey("C:\\tmp\\Results.PDF"), "results.pdf");

const linked = A.auditIndicatorSources(
  [{title:"ผ่านเกณฑ์",sourceFile:"results.pdf",sourcePage:"หน้า 1"}],
  [{id:"a",name:"results.pdf",status:"ready",pages:2,text:"x"}],
  (spec,total) => {
    const n=Number(spec);
    return n>=1 && n<=total ? {pages:[n],error:""} : {pages:[],error:"bad"};
  }
);
assert.strictEqual(linked.linked, 1);
assert.strictEqual(linked.issues.length, 0);

const missing = A.auditIndicatorSources(
  [{title:"ผ่านเกณฑ์",sourceFile:"missing.pdf",sourcePage:"1"}],
  docs,
  () => ({pages:[1],error:""})
);
assert.strictEqual(missing.linked, 0);
assert.strictEqual(missing.issues[0].type, "source_not_loaded");

console.log("Phase 3.3 document audit tests: PASS");
