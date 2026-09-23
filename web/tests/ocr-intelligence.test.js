const assert = require("assert");
const O = require("../js/ocr-intelligence.js");

const pages = [
  {page:1,text:""},
  {page:2,text:"ข้อความภาษาไทยที่มี text layer เพียงพอสำหรับการอ่านข้อความปกติ"},
  {page:3,text:"  "}
];

const assessment = O.scanAssessment(pages);
assert.deepStrictEqual(assessment.candidatePages,[1,3]);
assert.strictEqual(assessment.likelyScanned,true);
assert.strictEqual(O.compressPages([1,2,3,5,7,8]),"1-3,5,7-8");
assert.deepStrictEqual(O.normalizeLanguages("tha+eng"),["tha","eng"]);
assert.deepStrictEqual(O.normalizeLanguages("tha"),["tha"]);

const merged = O.mergeOcrResults(pages,[
  {page:1,text:"ข้อความจาก OCR หน้า 1",confidence:88.4},
  {page:3,text:"ข้อความจาก OCR หน้า 3",confidence:72}
]);
assert.strictEqual(merged[0].extractionMode,"ocr");
assert.strictEqual(merged[0].nativeText,"");
assert.strictEqual(merged[0].text,"ข้อความจาก OCR หน้า 1");
assert.strictEqual(merged[2].ocrConfidence,72);
assert.ok(O.rebuildPdfText(merged).includes("[OCR — ตรวจทานก่อนใช้]"));
assert.ok(O.averageConfidence(merged) > 80 && O.averageConfidence(merged) < 81);

console.log("Phase 4 OCR intelligence tests: PASS");
