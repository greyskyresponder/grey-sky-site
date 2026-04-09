export interface Discipline {
  name: string;
  abbr: string;
  slug: string;
  icon: string;
  description: string;
  examplePositions: string[];
}

export const disciplines: Discipline[] = [
  {
    name: "Animal Emergency Response",
    abbr: "AER",
    slug: "animal-emergency-response",
    icon: "🐾",
    description:
      "Specialists who rescue, shelter, and provide veterinary triage for animals displaced or endangered by disasters.",
    examplePositions: ["Animal Rescue Team", "Vet Tech", "Animal Shelter Manager"],
  },
  {
    name: "Emergency Medical Services",
    abbr: "EMS",
    slug: "emergency-medical-services",
    icon: "🚑",
    description:
      "Pre-hospital emergency medical providers including AEMTs, paramedics, aeromedical transport crews, and EMS strike teams.",
    examplePositions: ["AEMT", "Paramedic", "Aeromedical Transport Manager", "EMS Strike Team"],
  },
  {
    name: "Fire / Hazardous Materials",
    abbr: "Fire/HazMat",
    slug: "fire-hazmat",
    icon: "🔥",
    description:
      "Structural and wildland firefighters, ARFF crews, and HazMat technicians who contain chemical, biological, radiological, and nuclear threats.",
    examplePositions: ["Airport Firefighter", "HazMat Team", "Wildland Firefighter", "ARFF"],
  },
  {
    name: "Incident Management",
    abbr: "IMT",
    slug: "incident-management",
    icon: "📋",
    description:
      "ICS command and general staff, operations section chiefs, planning section chiefs, and all positions responsible for multi-agency operational coordination.",
    examplePositions: ["Incident Commander", "Operations Section Chief", "Planning Section Chief", "Logistics Section Chief"],
  },
  {
    name: "Operational Communications",
    abbr: "COML",
    slug: "operational-communications",
    icon: "📡",
    description:
      "Communications specialists who establish and maintain interoperable voice and data systems during incidents.",
    examplePositions: ["COML", "COMT", "AUXCOMM", "Airborne Comms Relay Team"],
  },
  {
    name: "Law Enforcement Operations",
    abbr: "LE",
    slug: "law-enforcement",
    icon: "🎯",
    description:
      "Tactical and operational law enforcement teams including SWAT, bomb squads, crisis negotiation, and law enforcement strike teams.",
    examplePositions: ["SWAT", "Bomb Squad/EOD", "LE Strike Team", "Crisis Negotiation"],
  },
  {
    name: "Mass Care Services",
    abbr: "MCS",
    slug: "mass-care",
    icon: "🏠",
    description:
      "Shelter managers, feeding teams, distribution point managers, disaster case managers, and access and functional needs advisors.",
    examplePositions: ["AFN Advisor", "Shelter Manager", "Feeding Team", "Disaster Case Manager"],
  },
  {
    name: "Medical and Public Health",
    abbr: "MPH",
    slug: "medical-public-health",
    icon: "🏥",
    description:
      "Physicians, nurses, pharmacists, behavioral health professionals, epidemiologists, and medical surge teams serving public health missions.",
    examplePositions: ["APRN", "Physician", "Pharmacist", "Epidemiologist", "Medical Surge Team"],
  },
  {
    name: "Public Works",
    abbr: "PW",
    slug: "public-works",
    icon: "🏗️",
    description:
      "Infrastructure assessment and restoration specialists covering damage assessment, debris management, utility restoration, and structural evaluation.",
    examplePositions: ["Damage Assessment", "Debris Management", "Utility Restoration", "Structural Assessment"],
  },
  {
    name: "Search and Rescue",
    abbr: "SAR",
    slug: "search-and-rescue",
    icon: "🔍",
    description:
      "US&R task forces, swiftwater rescue teams, land SAR, waterborne SAR, air search teams, and canine SAR units operating across all environments.",
    examplePositions: ["US&R Task Force", "Swiftwater Rescue Team", "Land SAR", "Canine SAR"],
  },
  {
    name: "Cybersecurity",
    abbr: "CYBER",
    slug: "cybersecurity",
    icon: "🛡️",
    description:
      "Cyber incident response teams and analysts who protect critical infrastructure and respond to cyber threats during emergencies.",
    examplePositions: ["Cyber Incident Response Team", "Cyber Analyst"],
  },
  {
    name: "Fatality Management",
    abbr: "FM",
    slug: "fatality-management",
    icon: "⚖️",
    description:
      "DMORT teams, victim identification specialists, and family assistance center personnel who ensure dignity and accountability in mass fatality events.",
    examplePositions: ["DMORT", "Victim ID Specialist", "Family Assistance Center"],
  },
  {
    name: "Logistics",
    abbr: "LOG",
    slug: "logistics",
    icon: "📦",
    description:
      "Supply unit leaders, facilities unit leaders, and ground support personnel who sustain incident operations through resource management.",
    examplePositions: ["Supply Unit Leader", "Facilities Unit Leader", "Ground Support Unit Leader"],
  },
  {
    name: "Situational Assessment",
    abbr: "SA",
    slug: "situational-assessment",
    icon: "🗺️",
    description:
      "GIS specialists, damage assessment teams, and situation unit leaders who collect, analyze, and disseminate critical incident intelligence.",
    examplePositions: ["GIS Specialist", "Damage Assessment Team", "Situation Unit Leader"],
  },
  {
    name: "Community Lifelines",
    abbr: "CL",
    slug: "community-lifelines",
    icon: "⚡",
    description:
      "Cross-cutting discipline covering energy, communications, transportation, food/water/shelter, health/medical, hazardous materials, and safety/security.",
    examplePositions: ["Energy Restoration", "Transportation Recovery", "Water/Shelter Operations"],
  },
  {
    name: "Environmental Response",
    abbr: "ER",
    slug: "environmental-response",
    icon: "🌿",
    description:
      "Environmental health specialists, oil spill responders, and decontamination teams protecting ecological systems and public health.",
    examplePositions: ["Environmental Health", "Oil Spill Response", "Decontamination"],
  },
  {
    name: "Volunteer & Donations Management",
    abbr: "VDM",
    slug: "volunteer-donations",
    icon: "🤝",
    description:
      "Volunteer coordinators and donations managers who organize spontaneous volunteers and manage the flow of donated goods and services.",
    examplePositions: ["Volunteer Coordinator", "Donations Manager"],
  },
];
