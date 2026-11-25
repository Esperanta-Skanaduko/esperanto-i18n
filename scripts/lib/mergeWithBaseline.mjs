const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Builds a locale object that has every key of the English baseline. Existing
 * translations are kept untouched, missing keys receive the English text, and the
 * result follows the key order of the baseline so files stay easy to compare.
 * Keys the baseline does not have are kept at the end of their section.
 *
 * @param baseline - The parsed English file (without `_meta`).
 * @param locale - The parsed locale file to complete (without `_meta`).
 * @returns A new object; neither input is modified.
 */
export const mergeWithBaseline = (baseline, locale) => {
  const merged = {};
  for (const [key, baselineValue] of Object.entries(baseline)) {
    const current = locale?.[key];
    if (isPlainObject(baselineValue)) {
      merged[key] = mergeWithBaseline(baselineValue, isPlainObject(current) ? current : {});
    } else {
      merged[key] = current === undefined ? baselineValue : current;
    }
  }
  for (const [key, value] of Object.entries(locale ?? {})) {
    if (!(key in merged)) merged[key] = value;
  }
  return merged;
};
