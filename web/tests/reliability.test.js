const assert = require("assert");
const fs = require("fs");
const path = require("path");
const R = require("../js/reliability.js");
global.PAToolkitReliability = R;
const M = require("../js/migrations.js");

assert.strictEqual(R.calculatePercentage(24, 30, 2), 80);
assert.strictEqual(R.formatCalculatedActual(24, 30, 2), "24/30 = 80%");
assert.strictEqual(R.calculatePercentage(1, 0, 2), null);

assert.deepStrictEqual(R.parsePageSpec("1-3,5", 7), {pages:[1,2,3,5], error:""});
assert.strictEqual(R.parsePageSpec("8", 7).error.length > 0, true);

const pending = R.validateIndicatorTrace({
  title:"A",
  target:"70%",
  actual:"PENDING",
  evidence:"PENDING"
});
assert.strictEqual(pending.ready, false);
assert.strictEqual(pending.hasActual, false);

const verified = R.validateIndicatorTrace({
  title:"A",
  target:"70%",
  actual:"24/30 = 80%",
  evidence:"ผลประเมินปลายรอบ",
  sourceFile:"results.pdf",
  sourcePage:"4",
  period:"1 เม.ย. – 30 ก.ย. 2570",
  population:"นักเรียน ป.3 จำนวน 30 คน",
  cohortId:"P3-2570",
  verification:"verified",
  actualNumerator:"24",
  actualDenominator:"30"
});
assert.strictEqual(verified.ready, true);

const conflicts = R.detectFieldConflicts(
  {evaluationPeriod:"A", organization:"โรงเรียนหนึ่ง"},
  {evaluationPeriod:"B", organization:"โรงเรียนหนึ่ง"},
  ["evaluationPeriod","organization"]
);
assert.strictEqual(conflicts.length, 1);
assert.strictEqual(conflicts[0].key, "evaluationPeriod");

const indicatorConflicts = R.detectIndicatorConflicts(
  [{title:"ผ่านเกณฑ์", target:"70%", actual:"80%"}],
  [{title:"ผ่านเกณฑ์", target:"75%", actual:"80%"}]
);
assert.strictEqual(indicatorConflicts.length, 1);
assert.strictEqual(indicatorConflicts[0].key, "target");

const oldProject = M.migrateProject({
  version:2,
  schema_version:"pa-toolkit/project/2.2",
  indicators:[{title:"ผ่านเกณฑ์", target:"70%", actual:"PENDING", evidence:"PENDING"}]
});
assert.strictEqual(oldProject.schema_version, "pa-toolkit/project/3.1");
assert.strictEqual(oldProject.version, 3);
assert.strictEqual(oldProject.indicators[0].verification, "unverified");
assert.strictEqual(oldProject.indicators[0].actualMode, "pending");

const fractionMode = R.normalizeIndicator({
  actual:"24/30 = 80%",
  actualNumerator:"24",
  actualDenominator:"30"
});
assert.strictEqual(fractionMode.actualMode, "fraction");

const percentMode = R.normalizeIndicator({actual:"80%"});
assert.strictEqual(percentMode.actualMode, "percent");

console.log("Phase 3.1 reliability tests: PASS");


const ownerIntake = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../test-data/owner-pa-2569.ai-intake.json"), "utf8")
);
assert.strictEqual(ownerIntake.schema_version, "pa-toolkit/intake/3.1");
assert.strictEqual(ownerIntake.indicators.length, 3);
ownerIntake.indicators.forEach((item) => {
  assert.strictEqual(item.actual, "PENDING");
  assert.strictEqual(R.validateIndicatorTrace(item).ready, false);
  assert.strictEqual(item.verification, "unverified");
  assert.strictEqual(item.actualMode, "pending");
});

const ownerProject = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../test-data/owner-pa-2569.project.json"), "utf8")
);
assert.strictEqual(ownerProject.schema_version, "pa-toolkit/project/3.1");
assert.strictEqual(ownerProject.version, 3);
