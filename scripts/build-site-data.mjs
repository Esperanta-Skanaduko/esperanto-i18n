#!/usr/bin/env node
/**
 * Writes site/status.json for the status page: one row per language with its
 * coverage and problems, from the same audit as `npm run audit`. The file has no
 * date, so CI can check it is up to date with `git diff`.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditLocales } from './lib/auditLocales.mjs';
import { readJson } from './lib/readJson.mjs';
import { ALLOWLIST_FILE, LANGUAGES_FILE, LOCALES_DIR, ROOT_DIR } from './lib/paths.mjs';

const languages = new Map(readJson(LANGUAGES_FILE).map((language) => [language.code, language]));
const sameAsEnglishOk = new Set(readJson(ALLOWLIST_FILE).sameAsEnglish);
const audit = auditLocales(LOCALES_DIR, undefined, sameAsEnglishOk);
const rows = audit.results.map((result) => ({
  code: result.code,
  name: languages.get(result.code)?.name ?? result.code,
  nativeName: languages.get(result.code)?.nativeName ?? result.code,
  rtl: languages.get(result.code)?.rtl ?? false,
  coverage: result.coverage,
  missing: result.missing.length,
  untranslated: result.untranslated.length,
  status: result.status,
  errors: result.errors,
  warnings: result.warnings.filter((text) => text.startsWith('_meta')),
}));
writeFileSync(join(ROOT_DIR, 'site', 'status.json'), `${JSON.stringify({ baselineKeys: audit.baselineKeyCount, languages: rows })}\n`);
console.log(`site/status.json written (${rows.length} languages)`);
