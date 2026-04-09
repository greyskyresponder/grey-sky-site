import pg from 'pg';

interface AffinitySeed {
  category: string;
  values: string[];
}

const AFFINITIES: AffinitySeed[] = [
  {
    category: 'hazard_type',
    values: [
      'Hurricane',
      'Tornado',
      'Flood',
      'Earthquake',
      'Wildfire',
      'HazMat Release',
      'Structural Collapse',
      'Mass Casualty',
      'Pandemic',
      'Radiological',
      'Terrorism',
      'Cyber',
      'Dam/Levee Failure',
    ],
  },
  {
    category: 'functional_specialty',
    values: [
      'Incident Command',
      'Operations',
      'Planning',
      'Logistics',
      'Finance/Admin',
      'Emergency Communications',
      'Damage Assessment',
      'Mass Care',
      'Evacuation',
      'Search & Rescue',
      'Law Enforcement',
      'Fire Suppression',
      'EMS',
      'Public Health',
      'Environmental Response',
    ],
  },
  {
    category: 'sector_experience',
    values: [
      'Federal',
      'State',
      'County',
      'Municipal',
      'Tribal',
      'Private Sector',
      'NGO/Voluntary',
      'Military',
      'International',
    ],
  },
];

export async function seedAffinities(client: pg.Client): Promise<void> {
  console.log('  Seeding affinities...');

  let total = 0;
  for (const group of AFFINITIES) {
    for (let i = 0; i < group.values.length; i++) {
      await client.query(
        `INSERT INTO affinities (category, value, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [group.category, group.values[i], i + 1]
      );
      total++;
    }
  }

  console.log(`  Seeded ${total} affinity entries.`);
}
