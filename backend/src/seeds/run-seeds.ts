import 'dotenv/config';
import pg from 'pg';
import { seedPositions } from './001_positions.js';
import { seedAffinities } from './002_affinities.js';
import { seedSrtDisciplines } from './003_srt_disciplines.js';
import { seedPositionRequirements } from './004_position_requirements.js';

async function runSeeds() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    console.log('Running seed scripts...');
    await seedPositions(client);
    await seedAffinities(client);
    await seedSrtDisciplines(client);
    await seedPositionRequirements(client);
    console.log('All seeds complete.');
  } finally {
    await client.end();
  }
}

runSeeds().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
