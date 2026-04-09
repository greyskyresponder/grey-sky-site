import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface IcsPosition {
  title: string;
  resource_category: string;
  discipline: string;
}

const ICS_POSITIONS: IcsPosition[] = [
  // Command Staff
  { title: 'Incident Commander', resource_category: 'Incident Management', discipline: 'Command' },
  { title: 'Deputy Incident Commander', resource_category: 'Incident Management', discipline: 'Command' },
  { title: 'Safety Officer', resource_category: 'Incident Management', discipline: 'Command' },
  { title: 'Public Information Officer', resource_category: 'Incident Management', discipline: 'Command' },
  { title: 'Liaison Officer', resource_category: 'Incident Management', discipline: 'Command' },
  // Operations Section
  { title: 'Operations Section Chief', resource_category: 'Incident Management', discipline: 'Operations' },
  { title: 'Division Supervisor', resource_category: 'Incident Management', discipline: 'Operations' },
  { title: 'Group Supervisor', resource_category: 'Incident Management', discipline: 'Operations' },
  { title: 'Branch Director', resource_category: 'Incident Management', discipline: 'Operations' },
  { title: 'Task Force Leader', resource_category: 'Incident Management', discipline: 'Operations' },
  { title: 'Strike Team Leader', resource_category: 'Incident Management', discipline: 'Operations' },
  // Planning Section
  { title: 'Planning Section Chief', resource_category: 'Incident Management', discipline: 'Planning' },
  { title: 'Situation Unit Leader', resource_category: 'Incident Management', discipline: 'Planning' },
  { title: 'Resources Unit Leader', resource_category: 'Incident Management', discipline: 'Planning' },
  { title: 'Documentation Unit Leader', resource_category: 'Incident Management', discipline: 'Planning' },
  { title: 'Demobilization Unit Leader', resource_category: 'Incident Management', discipline: 'Planning' },
  // Logistics Section
  { title: 'Logistics Section Chief', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Supply Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Facilities Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Ground Support Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Communications Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Food Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  { title: 'Medical Unit Leader', resource_category: 'Incident Management', discipline: 'Logistics' },
  // Finance/Admin Section
  { title: 'Finance/Admin Section Chief', resource_category: 'Incident Management', discipline: 'Finance/Admin' },
  { title: 'Time Unit Leader', resource_category: 'Incident Management', discipline: 'Finance/Admin' },
  { title: 'Procurement Unit Leader', resource_category: 'Incident Management', discipline: 'Finance/Admin' },
  { title: 'Compensation/Claims Unit Leader', resource_category: 'Incident Management', discipline: 'Finance/Admin' },
  { title: 'Cost Unit Leader', resource_category: 'Incident Management', discipline: 'Finance/Admin' },
];

const NIMS_TYPES = ['type1', 'type2', 'type3', 'type4'] as const;

const COMPLEXITY: Record<string, string> = {
  type1: 'Most complex',
  type2: 'Very complex',
  type3: 'Complex',
  type4: 'Least complex',
};

export async function seedPositions(client: pg.Client): Promise<void> {
  console.log('  Seeding ICS positions...');

  // Seed ICS positions with Type 1-4 variants
  for (const pos of ICS_POSITIONS) {
    for (const nimsType of NIMS_TYPES) {
      await client.query(
        `INSERT INTO positions (title, nims_type, complexity_level, resource_category, discipline, description)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT DO NOTHING`,
        [
          pos.title,
          nimsType,
          COMPLEXITY[nimsType],
          pos.resource_category,
          pos.discipline,
          `${pos.title} — ${COMPLEXITY[nimsType]} (${nimsType.replace('type', 'Type ')})`,
        ]
      );
    }
  }

  console.log(`  Seeded ${ICS_POSITIONS.length * NIMS_TYPES.length} ICS position entries.`);

  // Seed RTLT position qualifications from reference data
  console.log('  Seeding RTLT position qualifications...');
  const rtltPath = join(__dirname, '..', '..', '..', 'references', 'FEMA_RTLT_NQS_Database.json');
  const rtltData = JSON.parse(readFileSync(rtltPath, 'utf-8'));
  const positionQuals = rtltData.records.filter(
    (r: { record_type: string }) => r.record_type === 'Position Qualification'
  );

  let rtltCount = 0;
  for (const pq of positionQuals) {
    const discipline = extractDiscipline(pq.resource_category);
    await client.query(
      `INSERT INTO positions (title, rtlt_code, resource_category, discipline, description, requirements_json)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [
        pq.name,
        pq.fema_id,
        pq.resource_category,
        discipline,
        pq.overall_function ? pq.overall_function.substring(0, 1000) : null,
        JSON.stringify({
          type_levels: pq.type_levels,
          components: pq.components,
          references: pq.references,
          status: pq.status,
        }),
      ]
    );
    rtltCount++;
  }

  console.log(`  Seeded ${rtltCount} RTLT position qualification entries.`);
}

function extractDiscipline(resourceCategory: string): string {
  const mapping: Record<string, string> = {
    'Animal Emergency Response': 'Animal Emergency Response',
    'Communications': 'Communications',
    'Cybersecurity': 'Cybersecurity',
    'Damage Assessment': 'Damage Assessment',
    'Emergency Management': 'Emergency Management',
    'Emergency Medical Services': 'EMS',
    'Emergency Operations Center (EOC)': 'EOC',
    'Fire/Hazardous Materials': 'Fire/HazMat',
    'Geographic Info Systems and Info Technology': 'GIS/IT',
    'Hazard Mitigation': 'Hazard Mitigation',
    'Incident Management': 'Incident Management',
    'Law Enforcement Operations': 'Law Enforcement',
    'Logistics and Transportation': 'Logistics',
    'Mass Care Services': 'Mass Care',
    'Medical and Public Health': 'Medical/Public Health',
    'Prevention': 'Prevention',
    'Public Works': 'Public Works',
    'Recovery': 'Recovery',
    'Screening, Search, and Detection': 'Screening/Search/Detection',
    'Search and Rescue': 'Search and Rescue',
  };
  return mapping[resourceCategory] || resourceCategory;
}
