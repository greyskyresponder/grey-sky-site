// GSR-DOC-900: Defense-in-depth input sanitization.
// Zod validators are the primary gate; these backstop.

export function sanitizeTextInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

export function sanitizeObject(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      out[key] = sanitizeTextInput(value);
    } else if (Array.isArray(value)) {
      out[key] = value.map((v) =>
        typeof v === 'string'
          ? sanitizeTextInput(v)
          : v && typeof v === 'object'
            ? sanitizeObject(v as Record<string, unknown>)
            : v,
      );
    } else if (value && typeof value === 'object') {
      out[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}
