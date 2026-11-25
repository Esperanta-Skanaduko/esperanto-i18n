/**
 * Decides whether a value that is identical to the English text is a leftover
 * placeholder rather than a legitimate match. Very short values ("OK", "Menu"),
 * numbers and symbols are often spelled the same in many languages, so they are
 * not counted against a translator.
 *
 * @param value - The translated value.
 * @param baselineValue - The English value for the same key.
 * @returns True when the value was copied from English and is long enough to matter.
 */
export const isUntranslated = (value, baselineValue) =>
  typeof value === 'string' &&
  value === baselineValue &&
  /\p{L}/u.test(value) &&
  value.replace(/\{\{[^}]*\}\}/g, '').trim().length > 4;
