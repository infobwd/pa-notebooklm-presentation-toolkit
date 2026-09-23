const assert = require("assert");
const D = require("../js/document-intelligence.js");

const longText = "ผลสัมฤทธิ์ทางการเรียน ".repeat(120) + "\n\n" + "การซ่อมเสริมรายบุคคล ".repeat(90);
const parts = D.chunkText(longText,{maxChars:700,overlapChars:90});
assert.ok(parts.length > 3);
assert.ok(parts.every(x => x.text.length <= 710));

const docs = [{
  id:"a",name:"report.pdf",status:"ready",role:"performance_report",
  pageTexts:[
    {page:1,text:"ข้อมูลทั่วไปของสถานศึกษาและผู้เรียน"},
    {page:2,text:"ผลสัมฤทธิ์ทางการเรียน นักเรียนผ่านเกณฑ์ร้อยละ 80 และมีการติดตามผล"},
    {page:3,text:"นักเรียนที่ไม่ผ่านได้รับการซ่อมเสริมรายบุคคลครบทุกคน"}
  ]
},{
  id:"b",name:"policy.txt",status:"ready",role:"policy",
  text:"นโยบายการศึกษาและกรอบการดำเนินงาน"
}];

const chunks = D.buildChunks(docs,{maxChars:500});
assert.strictEqual(chunks.filter(x => x.docId === "a").length,3);
assert.ok(chunks.some(x => x.page === 2));

const hits = D.searchChunks(chunks,"ผลสัมฤทธิ์ทางการเรียน",{limit:10});
assert.ok(hits.length >= 1);
assert.strictEqual(hits[0].page,2);

const pages = D.aggregatePageResults(hits);
assert.strictEqual(pages[0].docName,"report.pdf");
assert.strictEqual(pages[0].page,2);
assert.ok(pages[0].excerpts[0].includes("ผลสัมฤทธิ์"));

const thaiHits = D.searchChunks(chunks,"ซ่อมเสริม",{limit:10});
assert.strictEqual(thaiHits[0].page,3);

const context = D.contextQueries(
  {challengeTitle:"พัฒนาการอ่าน",developmentNeed:"อ่านจับใจความ"},
  [{title:"ผู้เรียนผ่านเกณฑ์ 75%"},{title:"ซ่อมเสริม 100%"}]
);
assert.strictEqual(context.length,4);
assert.strictEqual(context[0].label,"ประเด็นท้าทาย");

console.log("Phase 4 document intelligence tests: PASS");
