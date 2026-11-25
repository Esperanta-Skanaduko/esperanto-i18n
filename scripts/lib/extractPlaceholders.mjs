const INTERPOLATION = /\{\{\s*([^}\s]+?)\s*\}\}/g;
const NESTING = /\$t\(\s*([^)\s]+?)\s*\)/g;

/**
 * Lists the i18next tokens inside one translated value, sorted and de-duplicated:
 * interpolations such as `{{count}}` and nested lookups such as `$t(common.ok)`.
 * Translators must keep these tokens exactly as they are or the app shows broken text.
 *
 * @param value - A leaf value from a locale file (usually a string).
 * @returns Sorted unique tokens, written the way they appear in the file.
 */
export const extractPlaceholders = (value) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const tokens = new Set();
  for (const match of text.matchAll(INTERPOLATION)) tokens.add(`{{${match[1]}}}`);
  for (const match of text.matchAll(NESTING)) tokens.add(`$t(${match[1]})`);
  return [...tokens].sort();
};
