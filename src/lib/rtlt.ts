import fs from "fs";
import path from "path";

export interface RTLTPosition {
  id: string;
  title: string;
  category: string;
  record_type: string;
  description: string;
  type_levels: string[];
  training: string;
  experience: string;
  physical_fitness: string;
  slug: string;
}

interface RawRecord {
  fema_id?: string;
  record_type?: string;
  name?: string;
  resource_category?: string;
  type_levels?: string[];
  components?: {
    description?: string;
    training?: string;
    experience?: string;
    physical_medical_fitness?: string;
  };
  overall_function?: string;
  overview?: string;
}

interface RTLTDatabase {
  metadata: { total_records: number };
  records: RawRecord[];
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const DEFAULT_DESCRIPTION =
  "This position is part of the FEMA National Qualification System. Grey Sky is building verified credentialing for this role.";

let _cache: RTLTPosition[] | null = null;

function loadData(): RTLTDatabase {
  const filePath = path.join(
    process.cwd(),
    "references",
    "FEMA_RTLT_NQS_Database.json"
  );
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as RTLTDatabase;
}

export function getAllPositions(): RTLTPosition[] {
  if (_cache) return _cache;

  const data = loadData();
  const seen = new Set<string>();

  _cache = data.records.map((entry) => {
    const title = entry.name ?? "Unknown Position";
    let slug = toSlug(title);

    // Deduplicate slugs
    if (seen.has(slug)) {
      const recordType = (entry.record_type ?? "").toLowerCase().replace(/\s+/g, "-");
      slug = `${slug}-${recordType}`;
    }
    if (seen.has(slug)) {
      slug = `${slug}-${(entry.fema_id ?? "").replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
    }
    seen.add(slug);

    const desc =
      entry.components?.description ??
      entry.overall_function ??
      entry.overview ??
      DEFAULT_DESCRIPTION;

    // Clean up concatenated text from PDF extraction
    const cleanDesc = desc
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\n/g, " ")
      .replace(/\s{2,}/g, " ")
      .slice(0, 1000);

    return {
      id: entry.fema_id ?? slug,
      title,
      category: entry.resource_category ?? "",
      record_type: entry.record_type ?? "",
      description: cleanDesc || DEFAULT_DESCRIPTION,
      type_levels: entry.type_levels ?? [],
      training: entry.components?.training ?? "",
      experience: entry.components?.experience ?? "",
      physical_fitness: entry.components?.physical_medical_fitness ?? "",
      slug,
    };
  });

  return _cache;
}

export function getPositionBySlug(slug: string): RTLTPosition | undefined {
  return getAllPositions().find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return getAllPositions().map((p) => p.slug);
}

export function getPositionsByCategory(): Record<string, RTLTPosition[]> {
  const positions = getAllPositions();
  const grouped: Record<string, RTLTPosition[]> = {};
  for (const p of positions) {
    const cat = p.category || "Other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(p);
  }
  return grouped;
}
