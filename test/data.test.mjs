import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { listLocaleCodes } from '../scripts/lib/listLocaleCodes.mjs';
import { auditLocales } from '../scripts/lib/auditLocales.mjs';
import { LANGUAGES_FILE, LOCALES_DIR } from '../scripts/lib/paths.mjs';

const languages = JSON.parse(readFileSync(LANGUAGES_FILE, 'utf-8'));
const codes = listLocaleCodes(LOCALES_DIR);

test('every locale file is valid JSON', () => {
  for (const code of codes) JSON.parse(readFileSync(join(LOCALES_DIR, `${code}.json`), 'utf-8'));
});

test('languages.json and the locales folder list exactly the same codes', () => {
  assert.deepEqual(languages.map((language) => language.code).sort(), codes);
});

test('languages.json has no duplicates and every entry is complete', () => {
  assert.equal(new Set(languages.map((language) => language.code)).size, languages.length);
  for (const language of languages) {
    for (const field of ['code', 'name', 'nativeName', 'flag']) assert.ok(language[field], `${language.code} lacks ${field}`);
    assert.equal(typeof language.rtl, 'boolean');
  }
});

test('the shipped locales have no errors (empty values or changed placeholders)', () => {
  const { results } = auditLocales(LOCALES_DIR);
  const broken = results.filter((result) => result.errors.length > 0).map((result) => `${result.code}: ${result.errors.join(', ')}`);
  assert.deepEqual(broken, []);
});
