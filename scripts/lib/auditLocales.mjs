import { join } from 'node:path';
import { auditLocale } from './auditLocale.mjs';
import { flattenLocale } from './flattenLocale.mjs';
import { listLocaleCodes } from './listLocaleCodes.mjs';
import { BASELINE_CODE } from './paths.mjs';
import { readJson } from './readJson.mjs';

/**
 * Audits every locale file in a folder against the English baseline.
 * A file that cannot be parsed is reported as an error instead of stopping the run.
 *
 * @param localesDir - Absolute path of the folder holding `<code>.json` files.
 * @param onlyCodes - Optional list of language codes to audit; all files when omitted.
 * @param sameAsEnglishOk - Keys whose text may legitimately match English (brand names).
 * @returns The baseline key count and one audit result per audited language.
 * @throws When the English baseline itself is missing or cannot be parsed.
 */
export const auditLocales = (localesDir, onlyCodes, sameAsEnglishOk = new Set()) => {
  const baseline = flattenLocale(readJson(join(localesDir, `${BASELINE_CODE}.json`)));
  const codes = (onlyCodes ?? listLocaleCodes(localesDir)).filter((code) => code !== BASELINE_CODE);
  const results = codes.map((code) => {
    try {
      const locale = readJson(join(localesDir, `${code}.json`));
      return auditLocale(code, locale, flattenLocale(locale), baseline, sameAsEnglishOk);
    } catch (error) {
      return {
        code,
        status: 'unreadable',
        keyCount: 0,
        coverage: 0,
        missing: [],
        extra: [],
        empty: [],
        untranslated: [],
        placeholderMismatches: [],
        errors: [`cannot read ${code}.json: ${error.message}`],
        warnings: [],
      };
    }
  });
  return { baselineKeyCount: Object.keys(baseline).length, results };
};
