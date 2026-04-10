// Generates supabase/seed.sql from the FEMA RTLT NQS Database
// Run: node scripts/generate-seed.js > supabase/seed.sql

const data = require("../references/FEMA_RTLT_NQS_Database.json");
const fs = require("fs");

const NS = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

function esc(str) {
  if (str == null) return "NULL";
  return "'" + str.replace(/'/g, "''") + "'";
}

function escOrNull(str) {
  if (str == null || str === "") return "NULL";
  return esc(str);
}

const lines = [];
function w(s) { lines.push(s); }

w("-- Grey Sky Responder Society — Seed Data (DOC-003)");
w("-- Generated from references/FEMA_RTLT_NQS_Database.json");
w("-- Idempotent: all INSERTs use ON CONFLICT DO NOTHING.");
w("-- UUIDs are deterministic via uuid_generate_v5 for reproducibility.");
w("");
w("-- ── 1. Extension Check ──────────────────────────────────");
w("");
w("DO $$");
w("BEGIN");
w("  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN");
w("    CREATE EXTENSION \"uuid-ossp\" SCHEMA extensions;");
w("  END IF;");
w("END");
w("$$;");
w("");
w("-- Namespace UUID for all seed data");
w("-- " + NS);
w("");

// ── 2. RTLT Team Types (Resource Typing Definitions) ──

w("-- ══════════════════════════════════════════════════════════");
w("-- 2. RTLT Team Types — All FEMA Resource Typing Definitions");
w("-- ══════════════════════════════════════════════════════════");
w("");

const rtds = data.records.filter(r => r.record_type === "Resource Typing Definition");
// Deduplicate by name + category
const uniqueRtds = new Map();
rtds.forEach(r => {
  const key = r.name + "|" + r.resource_category;
  if (!uniqueRtds.has(key)) uniqueRtds.set(key, r);
});

// Group by category
const rtdsByCategory = {};
for (const [, r] of uniqueRtds) {
  const cat = r.resource_category;
  if (!rtdsByCategory[cat]) rtdsByCategory[cat] = [];
  rtdsByCategory[cat].push(r);
}

let rtdOrder = 0;
for (const cat of Object.keys(rtdsByCategory).sort()) {
  const items = rtdsByCategory[cat];
  w("-- " + cat + " (" + items.length + " team types)");
  w("INSERT INTO rtlt_team_types (id, code, name, discipline, nims_category, description, sort_order) VALUES");
  const rows = [];
  for (const r of items) {
    rtdOrder++;
    const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const seedKey = "team_type:" + r.fema_id;
    // Use overall_function or first bit of description for description field
    let desc = (r.overall_function || r.description || "").substring(0, 500).replace(/'/g, "''");
    if (desc.length === 0) desc = r.name;
    rows.push(
      "  (uuid_generate_v5('" + NS + "'::uuid, " + esc(seedKey) + "), " +
      esc(r.fema_id) + ", " +
      esc(r.name) + ", " +
      esc(cat) + ", " +
      esc(r.primary_core_capability || cat) + ", " +
      esc(desc) + ", " +
      rtdOrder + ")"
    );
  }
  w(rows.join(",\n"));
  w("ON CONFLICT (name) DO NOTHING;");
  w("");
}

// ── 3. Positions (Position Qualifications) ──

w("-- ══════════════════════════════════════════════════════════");
w("-- 3. FEMA RTLT Position Qualifications (328 positions)");
w("-- ══════════════════════════════════════════════════════════");
w("");

const pqs = data.records.filter(r => r.record_type === "Position Qualification");

// Group by category
const pqsByCategory = {};
pqs.forEach(r => {
  const cat = r.resource_category;
  if (!pqsByCategory[cat]) pqsByCategory[cat] = [];
  pqsByCategory[cat].push(r);
});

for (const cat of Object.keys(pqsByCategory).sort()) {
  const items = pqsByCategory[cat];
  w("-- " + cat + " (" + items.length + " positions)");
  w("INSERT INTO positions (id, title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description) VALUES");
  const rows = [];
  for (const r of items) {
    // Each position may have multiple type_levels — create one row per type level
    const typeLevels = r.type_levels || ["Single Type"];
    for (const tl of typeLevels) {
      const seedKey = "pos:" + r.fema_id + ":" + tl;

      // Map type level to nims_type enum
      let nimsType = "NULL";
      if (tl === "Type 1") nimsType = "'type1'";
      else if (tl === "Type 2") nimsType = "'type2'";
      else if (tl === "Type 3") nimsType = "'type3'";
      else if (tl === "Type 4") nimsType = "'type4'";
      else if (tl === "Type 5") nimsType = "'type5'";
      // Single Type stays NULL

      let desc = (r.overall_function || "").substring(0, 500);
      if (desc.length === 0) desc = r.name;

      rows.push(
        "  (uuid_generate_v5('" + NS + "'::uuid, " + esc(seedKey) + "), " +
        esc(r.name) + ", " +
        nimsType + ", " +
        escOrNull(tl) + ", " +
        esc(cat) + ", " +
        esc(r.fema_id) + ", " +
        esc(cat) + ", " +
        esc(desc) + ")"
      );
    }
  }
  w(rows.join(",\n"));
  w("ON CONFLICT DO NOTHING;");
  w("");
}

// ── 4. Affinities ──

w("-- ══════════════════════════════════════════════════════════");
w("-- 4. Affinities (37 across 3 categories)");
w("-- ══════════════════════════════════════════════════════════");
w("");

w("-- 4.1 Hazard Types (13)");
w("INSERT INTO affinities (id, category, value, description, sort_order) VALUES");
const hazards = [
  ["Hurricane", "Tropical cyclone response and recovery"],
  ["Tornado", "Tornado response and recovery"],
  ["Flood", "Riverine and flash flood response"],
  ["Earthquake", "Seismic event response and recovery"],
  ["Wildfire", "Wildland and wildland-urban interface fire"],
  ["HazMat Release", "Hazardous materials release or spill"],
  ["Structural Collapse", "Building or infrastructure collapse"],
  ["Mass Casualty", "Mass casualty incident response"],
  ["Pandemic", "Pandemic and public health emergency"],
  ["Radiological", "Radiological or nuclear incident"],
  ["Terrorism", "Terrorism and active threat response"],
  ["Cyber", "Cyber incident and critical infrastructure disruption"],
  ["Dam/Levee Failure", "Dam or levee failure and downstream flooding"],
];
const hazardRows = hazards.map((h, i) => {
  const slug = h[0].toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return "  (uuid_generate_v5('" + NS + "'::uuid, " + esc("affinity:hazard_type:" + slug) + "), 'hazard_type', " + esc(h[0]) + ", " + esc(h[1]) + ", " + (i + 1) + ")";
});
w(hazardRows.join(",\n"));
w("ON CONFLICT (category, value) DO NOTHING;");
w("");

w("-- 4.2 Functional Specialties (15)");
w("INSERT INTO affinities (id, category, value, description, sort_order) VALUES");
const specialties = [
  ["Incident Command", "ICS command and general staff functions"],
  ["Operations", "Tactical operations and field response"],
  ["Planning", "Situation analysis, resource tracking, and IAP development"],
  ["Logistics", "Supply chain, facilities, and service support"],
  ["Finance/Admin", "Cost tracking, procurement, and administrative functions"],
  ["Emergency Communications", "Interoperable communications and information systems"],
  ["Damage Assessment", "Preliminary and detailed damage assessment"],
  ["Mass Care", "Sheltering, feeding, and emergency assistance"],
  ["Evacuation", "Population evacuation planning and execution"],
  ["Search & Rescue", "All-hazard search and rescue operations"],
  ["Law Enforcement", "Security, access control, and law enforcement operations"],
  ["Fire Suppression", "Structural and wildland fire suppression"],
  ["EMS", "Emergency medical services and pre-hospital care"],
  ["Public Health", "Public health surveillance, epidemiology, and medical countermeasures"],
  ["Environmental Response", "Environmental hazard mitigation and remediation"],
];
const specRows = specialties.map((s, i) => {
  const slug = s[0].toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return "  (uuid_generate_v5('" + NS + "'::uuid, " + esc("affinity:functional_specialty:" + slug) + "), 'functional_specialty', " + esc(s[0]) + ", " + esc(s[1]) + ", " + (i + 1) + ")";
});
w(specRows.join(",\n"));
w("ON CONFLICT (category, value) DO NOTHING;");
w("");

w("-- 4.3 Sector Experience (9)");
w("INSERT INTO affinities (id, category, value, description, sort_order) VALUES");
const sectors = [
  ["Federal", "Federal government agencies (FEMA, DHS, DOD, etc.)"],
  ["State", "State-level emergency management and response agencies"],
  ["County", "County-level government and emergency services"],
  ["Municipal", "City and municipal government services"],
  ["Tribal", "Tribal nation emergency management"],
  ["Private Sector", "Private sector disaster response and business continuity"],
  ["NGO/Voluntary", "Non-governmental and voluntary organizations (Red Cross, NVOAD, etc.)"],
  ["Military", "Military DSCA, National Guard, and defense support to civil authorities"],
  ["International", "International disaster response and humanitarian assistance"],
];
const sectorRows = sectors.map((s, i) => {
  const slug = s[0].toLowerCase().replace(/[^a-z0-9]+/g, "_");
  return "  (uuid_generate_v5('" + NS + "'::uuid, " + esc("affinity:sector_experience:" + slug) + "), 'sector_experience', " + esc(s[0]) + ", " + esc(s[1]) + ", " + (i + 1) + ")";
});
w(sectorRows.join(",\n"));
w("ON CONFLICT (category, value) DO NOTHING;");
w("");

fs.writeFileSync("supabase/seed.sql", lines.join("\n") + "\n");
console.log("Generated supabase/seed.sql");

// Stats
const totalPosRows = pqs.reduce((sum, r) => sum + (r.type_levels || ["Single Type"]).length, 0);
console.log("Team types: " + uniqueRtds.size);
console.log("Position rows (expanded by type level): " + totalPosRows);
console.log("Affinities: " + (hazards.length + specialties.length + sectors.length));
