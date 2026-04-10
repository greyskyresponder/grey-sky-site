const data = require("../references/FEMA_RTLT_NQS_Database.json");

// Position Qualifications
const pqs = data.records.filter(r => r.record_type === "Position Qualification");
console.log("Position Qualifications:", pqs.length);
const pqCats = {};
pqs.forEach(r => {
  const cat = r.resource_category;
  pqCats[cat] = (pqCats[cat] || 0) + 1;
});
Object.keys(pqCats).sort().forEach(cat => {
  console.log("  " + cat + ": " + pqCats[cat]);
});

// Type levels
const typeCounts = {};
pqs.forEach(r => {
  (r.type_levels || ["Unknown"]).forEach(t => {
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });
});
console.log("\nType level distribution:", typeCounts);

// Resource Typing Definitions (team types)
const rtds = data.records.filter(r => r.record_type === "Resource Typing Definition");
console.log("\nResource Typing Definitions:", rtds.length);

// Unique RTD names (some have duplicates)
const uniqueRtds = new Map();
rtds.forEach(r => {
  const key = r.name + "|" + r.resource_category;
  if (!uniqueRtds.has(key)) uniqueRtds.set(key, r);
});
console.log("Unique RTDs (by name+category):", uniqueRtds.size);

// Sample a position record to see fields
console.log("\nSample position fields:", Object.keys(pqs[0]));
console.log("Sample position:", JSON.stringify({
  fema_id: pqs[0].fema_id,
  name: pqs[0].name,
  resource_category: pqs[0].resource_category,
  type_levels: pqs[0].type_levels,
  status: pqs[0].status,
}, null, 2));

// Sample RTD
console.log("\nSample RTD fields:", Object.keys(rtds[0]));
console.log("Sample RTD:", JSON.stringify({
  fema_id: rtds[0].fema_id,
  name: rtds[0].name,
  resource_category: rtds[0].resource_category,
  type_levels: rtds[0].type_levels,
  status: rtds[0].status,
}, null, 2));
