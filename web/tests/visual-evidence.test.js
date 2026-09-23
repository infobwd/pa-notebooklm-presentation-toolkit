const assert = require("assert");
const V = require("../js/visual-evidence.js");

const plan = V.defaultPlan();
assert.strictEqual(plan.slots[0].filename, "10_presenter_01.jpg");
assert.strictEqual(V.fileExtMatches("10_presenter_01.jpg", "IMG_001.jpeg"), true);
assert.strictEqual(V.fileExtMatches("12_model_framework.png", "model.jpg"), false);
assert.strictEqual(V.resolvedDownloadName("12_model_framework.png", "model.jpg"), "12_model_framework.jpg");

const custom = V.normalizePlan({
  title:"Custom",
  slots:[
    {id:"10_a",order:10,filename:"10_a.jpg",label:"A",evidenceType:"ภาพกิจกรรมจริง"},
    {id:"11_b",order:11,filename:"11_b.png",label:"B"}
  ]
});
assert.strictEqual(custom.slots.length,2);
assert.strictEqual(V.nextFreeSlot(custom,["10_a"]).id,"11_b");
assert.strictEqual(V.matchSlotByFilename(custom,"10_a.jpeg").id,"10_a");
assert.strictEqual(V.planIssues(custom).length,0);

const bad = V.normalizePlan({slots:[{filename:"bad/name.jpg"}]});
assert.strictEqual(bad.slots.length,0);

const assigned = V.autoAssignAssets(custom, [
  {id:"x",originalName:"first.jpg",slotId:"10_a"},
  {id:"y",originalName:"second.png",slotId:"10_a"},
  {id:"z",originalName:"third.png",slotId:""}
]);
assert.strictEqual(assigned[0].slotId,"10_a");
assert.strictEqual(assigned[1].slotId,"11_b");
assert.strictEqual(assigned[2].slotId,"");
assert.strictEqual(V.assignmentSummary(custom,assigned).assignedUnique,2);
assert.deepStrictEqual(V.assignmentSummary(custom,assigned).missingSlotIds,[]);
assert.deepStrictEqual(V.assignmentSummary(custom,[
  {slotId:"10_a"},{slotId:"10_a"}
]).duplicateSlotIds,["10_a"]);

console.log("Visual evidence naming tests: PASS");
