const assert = require("assert");
const E = require("../js/evidence-review.js");

const note = E.createFromSearchResult({
  docName:"report.pdf",
  page:42,
  excerpts:["ผลการดำเนินงานตามตัวชี้วัด พบผลสัมฤทธิ์ร้อยละ 80"],
  extractionMode:"native"
},"ผลสัมฤทธิ์","n1");

assert.strictEqual(note.sourceFile,"report.pdf");
assert.strictEqual(note.sourcePage,"หน้า 42");
assert.strictEqual(note.reviewStatus,"candidate");
assert.ok(note.sectionHint.includes("ผลการดำเนินงาน"));
assert.ok(note.sectionHint.includes("ผลลัพธ์"));
assert.ok(note.sectionHint.includes("ตัวชี้วัด"));

const notes=[note];
assert.strictEqual(E.isDuplicate(notes,{...note}),true);
assert.strictEqual(E.counts(notes).candidate,1);

const checked=E.normalizeNote({...note,reviewStatus:"checked",classification:"actual",linkedIndicatorId:"i1"});
const counts=E.counts([checked]);
assert.strictEqual(counts.checked,1);
assert.strictEqual(counts.linked,1);
assert.strictEqual(E.classificationLabel("actual"),"ACTUAL");
assert.strictEqual(E.statusLabel("checked"),"ตรวจต้นฉบับแล้ว");

const md=E.markdown([checked],id => id === "i1" ? "ตัวชี้วัดที่ 1" : "");
assert.ok(md.includes("Evidence Review Notes"));
assert.ok(md.includes("ACTUAL"));
assert.ok(md.includes("ตัวชี้วัดที่ 1"));
assert.ok(md.includes("ไม่ใช่ Evidence Trace Verification"));

console.log("Phase 4.2 evidence review tests: PASS");
