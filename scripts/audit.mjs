#!/usr/bin/env node
/**
 * Compares every locale file with locales/en.json.
 *
 *   node scripts/audit.mjs                 report for all languages
 *   node scripts/audit.mjs --lang es,fr    only these languages
 *   node scripts/audit.mjs --verbose       list every offending key
 *   node scripts/audit.mjs --json          machine-readable output
 *   node scripts/audit.mjs --markdown      the table used in docs/STATUS.md
 *   node scripts/audit.mjs --out FILE      write the report to FILE instead of printing
 *   node scripts/audit.mjs --strict        warnings also fail the run
 *   node scripts/audit.mjs --locales DIR   audit another folder (used by the tests)
 *   node scripts/audit.mjs --allowlist FILE  keys that may match English (default: audit-allowlist.json
 *                                          next to this repo's locales; none for --locales)
 *
 * Exit code 0: no errors. 1: errors (empty values, changed {{placeholders}},
 * unreadable files), or any warning when --strict is given.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { auditLocales } from './lib/auditLocales.mjs';
import { ALLOWLIST_FILE, LANGUAGES_FILE, LOCALES_DIR } from './lib/paths.mjs';
import { parseArguments } from './lib/parseArguments.mjs';
import { readJson } from './lib/readJson.mjs';
import { renderMarkdownReport } from './lib/renderMarkdownReport.mjs';
import { renderTextReport } from './lib/renderTextReport.mjs';

const options = parseArguments(process.argv.slice(2), ['lang', 'out', 'locales', 'allowlist']);
const localesDir = options.locales ?? LOCALES_DIR;
const onlyCodes = options.lang ? String(options.lang).split(',').map((code) => code.trim()) : undefined;
const allowlistFile = options.allowlist ?? (options.locales ? undefined : ALLOWLIST_FILE);
const sameAsEnglishOk = new Set(allowlistFile && existsSync(allowlistFile) ? readJson(allowlistFile).sameAsEnglish : []);
const audit = auditLocales(localesDir, onlyCodes, sameAsEnglishOk);

let output;
if (options.json) {
  output = JSON.stringify(audit, null, 2);
} else if (options.markdown) {
  const names = Object.fromEntries(readJson(LANGUAGES_FILE).map((language) => [language.code, language.name]));
  output = renderMarkdownReport(audit, names);
} else {
  output = renderTextReport(audit, Boolean(options.verbose));
}

if (options.out) {
  writeFileSync(String(options.out), output.endsWith('\n') ? output : `${output}\n`, 'utf-8');
} else {
  console.log(output);
}

const failed = audit.results.some(
  (result) => result.errors.length > 0 || (options.strict && result.warnings.length > 0),
);
process.exit(failed ? 1 : 0);
