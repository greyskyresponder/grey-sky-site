// GSR-DOC-207: Seed position_requirements (and extend positions) from the
// FEMA RTLT reference JSON at references/rtlt/.
//
// For each of the 321 RTLT positions:
//   1. Ensure a positions row exists per type_level (type1..type4, or a single
//      row if type_levels === ['single']). rtlt_code = FEMA id.
//   2. Insert a position_requirements row for each:
//        - course code     (→ type='course',        code=<IS-700>, title=<course title>)
//        - certification   (→ type='certification', title=<cert name>)
//        - fitness_level   (→ type='fitness',       title='Physical Fitness: <level>')
//        - ptb mapping     (→ type='ptb',           title='Position Task Book: <name>')
//        - experience KSA  (→ type='experience',    title=<first line of text>)
//
// Idempotent — safe to run multiple times. Uses ON CONFLICT on the unique
// indexes created by migration 20260424000001.

import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

type RtltPosition = {
  id: string;
  name: string;
  category: string;
  resource_kind: string;
  type_levels: string[];
  course_codes: string[];
  training: string[];
  experience: string[];
  education: string[];
  fitness_level: string;
  currency: string[];
  certifications: string[];
};

type TrainingCourse = {
  code: string;
  title: string;
  description?: string;
  positions_requiring?: Array<{ id: string; name: string; category: string }>;
};

type PtbPqMap = {
  ptb_id: string;
  ptb_name: string;
  pq_id: string;
  pq_name: string;
  category: string;
};

const DISCIPLINE_MAP: Record<string, string> = {
  'Animal Emergency Response': 'Animal Emergency Response',
  Communications: 'Communications',
  Cybersecurity: 'Cybersecurity',
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
  Prevention: 'Prevention',
  'Public Works': 'Public Works',
  Recovery: 'Recovery',
  'Screening, Search, and Detection': 'Screening/Search/Detection',
  'Search and Rescue': 'Search and Rescue',
};

function extractDiscipline(category: string): string {
  return DISCIPLINE_MAP[category] ?? category;
}

function groupLabelForCourse(code: string): string {
  const upper = code.toUpperCase();
  if (upper.startsWith('IS-')) return 'Independent Study (IS)';
  if (upper.startsWith('ICS-')) return 'ICS Courses';
  if (upper.startsWith('E/L') || upper.startsWith('E/G/L') || upper.startsWith('L-') || upper.startsWith('E-')) {
    return 'EMI Resident & Field-Deliverable';
  }
  return 'Other Training';
}

function documentCategoryForType(t: string): string {
  // Map to values present in document_category_enum.
  switch (t) {
    case 'course':
      return 'training';
    case 'certification':
      return 'certification';
    case 'fitness':
      return 'medical';
    case 'ptb':
      return 'training';
    case 'experience':
      return 'other';
    default:
      return 'other';
  }
}

function nimsTypeFromLevel(level: string): string | null {
  if (level === 'type1' || level === 'type2' || level === 'type3' || level === 'type4' || level === 'type5') {
    return level;
  }
  return null; // 'single' or unrecognized — no specific NIMS type
}

function truncate(s: string, n: number): string {
  if (!s) return s;
  const trimmed = s.trim();
  return trimmed.length <= n ? trimmed : trimmed.slice(0, n - 1) + '…';
}

async function ensurePosition(
  client: pg.Client,
  pos: RtltPosition,
  nimsType: string | null
): Promise<string> {
  const discipline = extractDiscipline(pos.category);
  const description = pos.training && pos.training.length > 0
    ? truncate(pos.training.join(' '), 1000)
    : null;

  // Look up existing row by (rtlt_code, nims_type).
  const existing = await client.query<{ id: string }>(
    `SELECT id FROM positions
      WHERE rtlt_code = $1
        AND ${nimsType === null ? 'nims_type IS NULL' : 'nims_type = $2'}
      LIMIT 1`,
    nimsType === null ? [pos.id] : [pos.id, nimsType]
  );

  if (existing.rows.length > 0) {
    // Refresh metadata but leave identity/id alone.
    await client.query(
      `UPDATE positions
          SET title = $1,
              resource_category = $2,
              discipline = $3,
              description = COALESCE($4, description),
              requirements_json = $5
        WHERE id = $6`,
      [
        pos.name,
        pos.category,
        discipline,
        description,
        JSON.stringify({
          type_levels: pos.type_levels,
          course_codes: pos.course_codes,
          fitness_level: pos.fitness_level,
          certifications: pos.certifications,
          currency: pos.currency,
        }),
        existing.rows[0].id,
      ]
    );
    return existing.rows[0].id;
  }

  const inserted = await client.query<{ id: string }>(
    `INSERT INTO positions
       (title, nims_type, complexity_level, resource_category, rtlt_code, discipline, description, requirements_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [
      pos.name,
      nimsType,
      nimsType ? nimsType.replace('type', 'Type ') : null,
      pos.category,
      pos.id,
      discipline,
      description,
      JSON.stringify({
        type_levels: pos.type_levels,
        course_codes: pos.course_codes,
        fitness_level: pos.fitness_level,
        certifications: pos.certifications,
        currency: pos.currency,
      }),
    ]
  );
  return inserted.rows[0].id;
}

async function upsertRequirement(
  client: pg.Client,
  positionId: string,
  row: {
    type: string;
    code: string | null;
    title: string;
    description: string | null;
    group_label: string | null;
    rtlt_source: string;
    sort_order: number;
    is_required: boolean;
  }
): Promise<void> {
  const docCategory = documentCategoryForType(row.type);
  if (row.code !== null) {
    await client.query(
      `INSERT INTO position_requirements
         (position_id, requirement_type, code, title, description, document_category, is_required, sort_order, group_label, rtlt_source)
       VALUES ($1, $2::requirement_type_enum, $3, $4, $5, $6::document_category_enum, $7, $8, $9, $10)
       ON CONFLICT (position_id, requirement_type, code) WHERE code IS NOT NULL
       DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         document_category = EXCLUDED.document_category,
         group_label = EXCLUDED.group_label,
         sort_order = EXCLUDED.sort_order`,
      [positionId, row.type, row.code, row.title, row.description, docCategory, row.is_required, row.sort_order, row.group_label, row.rtlt_source]
    );
  } else {
    await client.query(
      `INSERT INTO position_requirements
         (position_id, requirement_type, code, title, description, document_category, is_required, sort_order, group_label, rtlt_source)
       VALUES ($1, $2::requirement_type_enum, NULL, $3, $4, $5::document_category_enum, $6, $7, $8, $9)
       ON CONFLICT (position_id, requirement_type, title) WHERE code IS NULL
       DO UPDATE SET
         description = EXCLUDED.description,
         document_category = EXCLUDED.document_category,
         group_label = EXCLUDED.group_label,
         sort_order = EXCLUDED.sort_order`,
      [positionId, row.type, row.title, row.description, docCategory, row.is_required, row.sort_order, row.group_label, row.rtlt_source]
    );
  }
}

export async function seedPositionRequirements(client: pg.Client): Promise<void> {
  console.log('  Seeding position requirements from RTLT data...');

  const rtltDir = join(__dirname, '..', '..', '..', 'references', 'rtlt');
  const positions: RtltPosition[] = JSON.parse(
    readFileSync(join(rtltDir, 'positions_db.json'), 'utf-8')
  );
  const coursesRaw: Record<string, TrainingCourse> = JSON.parse(
    readFileSync(join(rtltDir, 'training_courses_db.json'), 'utf-8')
  );
  const ptbMap: PtbPqMap[] = JSON.parse(
    readFileSync(join(rtltDir, 'ptb_pq_map.json'), 'utf-8')
  );

  // Build a fast lookup: course_code → title.
  const courseTitleByCode: Record<string, string> = {};
  for (const code of Object.keys(coursesRaw)) {
    const row = coursesRaw[code];
    if (row && row.title) courseTitleByCode[code.toUpperCase()] = row.title;
  }
  // Build: pq_id → ptb entry.
  const ptbByPqId: Record<string, PtbPqMap> = {};
  for (const entry of ptbMap) {
    ptbByPqId[entry.pq_id] = entry;
  }

  let positionsInserted = 0;
  let requirementsInserted = 0;

  for (const pos of positions) {
    const levels = pos.type_levels && pos.type_levels.length > 0 ? pos.type_levels : ['single'];

    for (const level of levels) {
      const nimsType = nimsTypeFromLevel(level);
      const positionId = await ensurePosition(client, pos, nimsType);
      positionsInserted++;

      let sort = 0;

      // 1) Course codes.
      const seenCourseCodes = new Set<string>();
      for (const rawCode of pos.course_codes || []) {
        const code = (rawCode || '').trim();
        if (!code) continue;
        const upper = code.toUpperCase();
        if (seenCourseCodes.has(upper)) continue;
        seenCourseCodes.add(upper);

        const title = courseTitleByCode[upper] || code;
        await upsertRequirement(client, positionId, {
          type: 'course',
          code,
          title: title.length > 0 ? `${code}: ${title}` : code,
          description: null,
          group_label: groupLabelForCourse(code),
          rtlt_source: 'course_codes',
          sort_order: sort++,
          is_required: true,
        });
        requirementsInserted++;
      }

      // 2) Certifications (filter junk + Not Specified).
      const seenCertTitles = new Set<string>();
      for (const rawCert of pos.certifications || []) {
        const cert = (rawCert || '').trim();
        if (!cert) continue;
        if (/not specified/i.test(cert)) continue;
        if (cert.length < 6) continue;
        const title = truncate(cert.replace(/\s+/g, ' '), 200);
        if (seenCertTitles.has(title.toLowerCase())) continue;
        seenCertTitles.add(title.toLowerCase());

        await upsertRequirement(client, positionId, {
          type: 'certification',
          code: null,
          title,
          description: cert.length > 200 ? cert : null,
          group_label: 'Certifications & Licenses',
          rtlt_source: 'certifications',
          sort_order: sort++,
          is_required: true,
        });
        requirementsInserted++;
      }

      // 3) Fitness level (one slot per position).
      const fitness = (pos.fitness_level || '').trim();
      if (fitness && !/not specified/i.test(fitness)) {
        await upsertRequirement(client, positionId, {
          type: 'fitness',
          code: null,
          title: `Physical Fitness: ${fitness}`,
          description: null,
          group_label: 'Fitness',
          rtlt_source: 'fitness_level',
          sort_order: sort++,
          is_required: true,
        });
        requirementsInserted++;
      }

      // 4) PTB mapping.
      const ptb = ptbByPqId[pos.id];
      if (ptb) {
        await upsertRequirement(client, positionId, {
          type: 'ptb',
          code: ptb.ptb_id,
          title: `Position Task Book: ${ptb.ptb_name}`,
          description: null,
          group_label: 'Position Task Book',
          rtlt_source: 'ptb_pq_map',
          sort_order: sort++,
          is_required: true,
        });
        requirementsInserted++;
      }

      // 5) Experience — informational only, first ~3 entries with substantive content.
      const seenExp = new Set<string>();
      let expAdded = 0;
      for (const rawExp of pos.experience || []) {
        if (expAdded >= 3) break;
        const exp = (rawExp || '').trim();
        if (!exp || exp.length < 20) continue;
        // Skip the generic header.
        if (/^knowledge, skills and abilities/i.test(exp)) continue;
        const title = truncate(exp.replace(/\s+/g, ' '), 200);
        if (seenExp.has(title.toLowerCase())) continue;
        seenExp.add(title.toLowerCase());

        await upsertRequirement(client, positionId, {
          type: 'experience',
          code: null,
          title,
          description: exp.length > 200 ? exp : null,
          group_label: 'Experience',
          rtlt_source: 'experience',
          sort_order: sort++,
          is_required: false, // informational
        });
        requirementsInserted++;
        expAdded++;
      }
    }
  }

  console.log(
    `  Seeded/updated ${positionsInserted} position rows (from ${positions.length} RTLT entries).`
  );
  console.log(`  Seeded/updated ${requirementsInserted} position_requirements rows.`);
}
