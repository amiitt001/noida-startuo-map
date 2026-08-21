/**
 * Slug Utilities
 *
 * Shared slug generation and normalization for use across
 * seed pipeline and repositories.
 */

/**
 * Generate a URL-safe slug from a string.
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Ensure slug uniqueness by appending a numeric suffix if needed.
 */
export function ensureUniqueSlug(
  slug: string,
  existingSlugs: Set<string>
): string {
  if (!existingSlugs.has(slug)) {
    return slug;
  }

  let counter = 2;
  let candidate = `${slug}-${counter}`;
  while (existingSlugs.has(candidate)) {
    counter++;
    candidate = `${slug}-${counter}`;
  }
  return candidate;
}
