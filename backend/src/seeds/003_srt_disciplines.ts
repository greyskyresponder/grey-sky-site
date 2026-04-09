import pg from 'pg';

interface SrtDisciplineSeed {
  value: string;
  description: string;
}

const SRT_DISCIPLINES: SrtDisciplineSeed[] = [
  { value: 'Urban Search & Rescue (US&R)', description: 'Structural collapse search, rescue, and recovery operations' },
  { value: 'Swiftwater/Flood Rescue Team (SWFRT)', description: 'Water-based rescue in flood and swiftwater environments' },
  { value: 'Hazardous Materials (HazMat)', description: 'Chemical, biological, radiological, and nuclear hazard response' },
  { value: 'Special Weapons and Tactics (SWAT)', description: 'High-risk law enforcement tactical operations' },
  { value: 'Bomb Squad', description: 'Explosive ordnance detection, render safe, and disposal' },
  { value: 'Waterborne Search & Rescue', description: 'Open water, coastal, and maritime search and rescue' },
  { value: 'Land Search & Rescue', description: 'Wilderness, rural, and urban land-based search operations' },
  { value: 'Small Unmanned Aircraft Systems (sUAS)', description: 'Drone-based aerial reconnaissance and situational awareness' },
  { value: 'Rotary Wing Search & Rescue', description: 'Helicopter-based search, rescue, and medical evacuation' },
  { value: 'Animal Rescue/SAR', description: 'Companion and livestock animal rescue and sheltering operations' },
  { value: 'Incident Management Teams (IMT)', description: 'All-hazard incident management and coordination' },
  { value: 'EOC Management Support Teams', description: 'Emergency operations center activation and management support' },
  { value: 'Public Safety Dive Teams', description: 'Underwater search, rescue, recovery, and evidence retrieval' },
];

export async function seedSrtDisciplines(client: pg.Client): Promise<void> {
  console.log('  Seeding SRT disciplines as affinities...');

  for (let i = 0; i < SRT_DISCIPLINES.length; i++) {
    const d = SRT_DISCIPLINES[i];
    await client.query(
      `INSERT INTO affinities (category, value, description, sort_order)
       VALUES ('srt_discipline', $1, $2, $3)
       ON CONFLICT DO NOTHING`,
      [d.value, d.description, i + 1]
    );
  }

  console.log(`  Seeded ${SRT_DISCIPLINES.length} SRT discipline entries.`);
}
