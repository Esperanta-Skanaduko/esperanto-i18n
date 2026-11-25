import { extractPlaceholders } from './extractPlaceholders.mjs';
import { isUntranslated } from './isUntranslated.mjs';

const CLAIMS_DONE = new Set(['complete', 'human-translated', 'machine-translated']);

/**
 * Compares one language against the English baseline and reports every problem
 * a translator or reviewer needs to know about.
 *
 * Errors break the app or the data and always fail the audit: values left empty,
 * and placeholders that differ from English. Warnings are gaps that fall back to
 * English at run time: missing keys, text still in English, keys English does not
 * have, and a `_meta` status that does not match the real coverage.
 *
 * @param code - Language code of the file being audited.
 * @param locale - The parsed JSON of that file.
 * @param flatLocale - The same file flattened with `flattenLocale`.
 * @param baseline - The English file flattened with `flattenLocale`.
 * @param sameAsEnglishOk - Keys whose text is legitimately the same as English (brand names such as "GitHub").
 * @returns An object with counts, the lists behind them, `errors`, and `warnings`.
 */
export const auditLocale = (code, locale, flatLocale, baseline, sameAsEnglishOk = new Set()) => {
  const baselineKeys = Object.keys(baseline);
  const missing = baselineKeys.filter((key) => !(key in flatLocale));
  const extra = Object.keys(flatLocale).filter((key) => !(key in baseline));
  const empty = Object.keys(flatLocale).filter(
    (key) => flatLocale[key] === '' || flatLocale[key] === null || flatLocale[key] === undefined,
  );
  const untranslated = baselineKeys.filter(
    (key) => key in flatLocale && !sameAsEnglishOk.has(key) && isUntranslated(flatLocale[key], baseline[key]),
  );
  const placeholderMismatches = [];
  for (const key of baselineKeys) {
    if (!(key in flatLocale) || empty.includes(key)) continue;
    const expected = extractPlaceholders(baseline[key]);
    const found = extractPlaceholders(flatLocale[key]);
    if (expected.join('|') !== found.join('|')) placeholderMismatches.push({ key, expected, found });
  }

  const translated = baselineKeys.length - missing.length - untranslated.length - empty.length;
  const coverage = Math.round((translated / baselineKeys.length) * 1000) / 10;
  const meta = locale._meta ?? {};
  const status = meta.translationStatus ?? 'unknown';

  const errors = [];
  if (empty.length > 0) errors.push(`${empty.length} empty value(s)`);
  if (placeholderMismatches.length > 0) {
    errors.push(`${placeholderMismatches.length} value(s) whose {{placeholders}} differ from English`);
  }

  const warnings = [];
  if (missing.length > 0) warnings.push(`${missing.length} missing key(s)`);
  if (untranslated.length > 0) warnings.push(`${untranslated.length} value(s) still in English`);
  if (extra.length > 0) warnings.push(`${extra.length} key(s) that English does not have`);
  if (CLAIMS_DONE.has(status) && coverage < 100) {
    warnings.push(`_meta says "${status}" but only ${coverage}% is translated`);
  }
  if (status === 'human-translated' && /\bAI\b|machine|google/i.test(String(meta.translator ?? ''))) {
    warnings.push(`_meta says "human-translated" but the translator is "${meta.translator}"`);
  }

  return {
    code,
    status,
    keyCount: Object.keys(flatLocale).length,
    coverage,
    missing,
    extra,
    empty,
    untranslated,
    placeholderMismatches,
    errors,
    warnings,
  };
};
