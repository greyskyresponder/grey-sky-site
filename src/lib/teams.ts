import { getAllPositions, type RTLTPosition } from "./rtlt";

export interface TeamType {
  title: string;
  slug: string;
  description: string;
  positionCount: number;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Operational descriptions for each RTLT resource category
const categoryDescriptions: Record<string, string> = {
  "Mass Care Services":
    "Sheltering, feeding, distribution of emergency supplies, and reunification services for displaced populations during disasters.",
  "Emergency Medical Services":
    "Pre-hospital emergency medical care, triage, treatment, and transport of patients during incidents and mass casualty events.",
  "Medical and Public Health":
    "Clinical care, epidemiological surveillance, behavioral health, and public health response operations in emergency settings.",
  "Fire/Hazardous Materials":
    "Fire suppression, hazardous materials detection, containment, and decontamination across all incident types.",
  "Incident Management":
    "ICS-based command, coordination, and general staff functions for complex, multi-agency incident operations.",
  "Search and Rescue":
    "Structural collapse, swiftwater, wilderness, and technical rescue operations across land, water, and aerial domains.",
  "Animal Emergency Response":
    "Large and small animal rescue, sheltering, veterinary triage, and evacuation support during emergencies.",
  "Public Works":
    "Infrastructure assessment, debris management, emergency repair, and restoration of critical public works systems.",
  "Law Enforcement Operations":
    "Tactical operations, crowd management, perimeter security, and law enforcement functions during emergency incidents.",
  "Hazard Mitigation":
    "Risk assessment, vulnerability analysis, and implementation of measures to reduce the impact of future hazards.",
  Communications:
    "Emergency communications planning, interoperable radio systems, and information technology support during incidents.",
  "Emergency Management":
    "Coordination of emergency preparedness, response, recovery, and mitigation activities across all phases of disaster management.",
  Cybersecurity:
    "Protection of critical information systems, incident response for cyber threats, and digital infrastructure resilience.",
  "Logistics and Transportation":
    "Resource ordering, tracking, mobilization, and transportation coordination for personnel and equipment during incidents.",
  "Emergency Operations Center (EOC)":
    "Staffing and operation of Emergency Operations Centers for multi-agency coordination and resource management.",
  "Geographic Info Systems and Info Technology":
    "Geospatial analysis, mapping, data management, and information technology support for situational awareness.",
  "Damage Assessment":
    "Systematic evaluation of damage to structures, infrastructure, and communities following disasters for recovery planning.",
  Prevention:
    "Intelligence analysis, threat assessment, and counter-terrorism operations to prevent incidents before they occur.",
  Recovery:
    "Long-term community recovery planning, economic restoration, and rebuilding coordination following major disasters.",
  "Screening, Search, and Detection":
    "Screening operations, detection of chemical, biological, radiological, and nuclear threats at points of entry and incident sites.",
};

let _teamCache: TeamType[] | null = null;

export function getAllTeams(): TeamType[] {
  if (_teamCache) return _teamCache;

  const positions = getAllPositions();
  const grouped: Record<string, RTLTPosition[]> = {};

  for (const p of positions) {
    const cat = p.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }

  _teamCache = Object.entries(grouped)
    .map(([category, positions]) => ({
      title: category,
      slug: toSlug(category),
      description:
        categoryDescriptions[category] ??
        `FEMA RTLT resource category encompassing ${positions.length} typed positions and resources.`,
      positionCount: positions.length,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return _teamCache;
}

export function getTeamBySlug(slug: string): TeamType | undefined {
  return getAllTeams().find((t) => t.slug === slug);
}

export function getTeamSlugs(): string[] {
  return getAllTeams().map((t) => t.slug);
}
