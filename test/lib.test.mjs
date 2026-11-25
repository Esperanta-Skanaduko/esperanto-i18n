import assert from 'node:assert/strict';
import { test } from 'node:test';
import { auditLocale } from '../scripts/lib/auditLocale.mjs';
import { buildNewLocale } from '../scripts/lib/buildNewLocale.mjs';
import { extractPlaceholders } from '../scripts/lib/extractPlaceholders.mjs';
import { flattenLocale } from '../scripts/lib/flattenLocale.mjs';
import { isUntranslated } from '../scripts/lib/isUntranslated.mjs';
import { mergeWithBaseline } from '../scripts/lib/mergeWithBaseline.mjs';
import { parseArguments } from '../scripts/lib/parseArguments.mjs';

const english = { home: { title: 'Welcome home', count: 'You have {{count}} of {{total}} books' }, ok: 'OK' };
const audit = (locale, allow) => auditLocale('xx', locale, flattenLocale(locale), flattenLocale(english), allow);

test('flattenLocale joins nested keys with dots and skips _meta', () => {
  assert.deepEqual(flattenLocale({ _meta: { code: 'xx' }, a: { b: 'c', d: ['e'] } }), { 'a.b': 'c', 'a.d': ['e'] });
});

test('extractPlaceholders finds interpolations and nested lookups, sorted and unique', () => {
  assert.deepEqual(extractPlaceholders('{{total}} {{ count }} {{count}} $t(common.ok)'), ['$t(common.ok)', '{{count}}', '{{total}}']);
  assert.deepEqual(extractPlaceholders('plain text'), []);
});

test('isUntranslated ignores short, symbol-only and different values', () => {
  assert.equal(isUntranslated('Welcome home', 'Welcome home'), true);
  assert.equal(isUntranslated('OK', 'OK'), false);
  assert.equal(isUntranslated('2024', '2024'), false);
  assert.equal(isUntranslated('Bienvenido', 'Welcome home'), false);
});

test('a complete, correct translation has no errors and no warnings', () => {
  const result = audit({ home: { title: 'Bienvenido a casa', count: 'Tienes {{count}} de {{total}} libros' }, ok: 'Vale' });
  assert.deepEqual([result.errors, result.warnings, result.coverage], [[], [], 100]);
});

test('NEGATIVE CONTROL: a changed placeholder is an error', () => {
  const result = audit({ home: { title: 'Bienvenido', count: 'Tienes {{cuenta}} de {{total}}' }, ok: 'Vale' });
  assert.equal(result.errors.length, 1);
  assert.equal(result.placeholderMismatches[0].key, 'home.count');
});

test('NEGATIVE CONTROL: an empty value is an error', () => {
  const result = audit({ home: { title: '', count: 'Tienes {{count}} de {{total}}' }, ok: 'Vale' });
  assert.deepEqual(result.empty, ['home.title']);
  assert.equal(result.errors.length, 1);
});

test('missing keys, English text and extra keys are warnings, not errors', () => {
  const result = audit({ home: { title: 'Welcome home' }, extra: 'x' });
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.missing, ['home.count', 'ok']);
  assert.deepEqual(result.untranslated, ['home.title']);
  assert.deepEqual(result.extra, ['extra']);
  assert.equal(result.coverage, 0);
});

test('the allowlist stops a brand name counting as untranslated', () => {
  const locale = { home: { title: 'Welcome home', count: 'Tienes {{count}} de {{total}}' }, ok: 'Vale' };
  assert.deepEqual(audit(locale).untranslated, ['home.title']);
  assert.deepEqual(audit(locale, new Set(['home.title'])).untranslated, []);
});

test('a _meta status that overclaims is reported', () => {
  const result = audit({ _meta: { translationStatus: 'complete' }, home: { title: 'Welcome home' } });
  assert.ok(result.warnings.some((text) => text.includes('_meta says "complete"')));
  const ai = audit({ _meta: { translationStatus: 'human-translated', translator: 'AI Assistant' }, ok: 'Vale' });
  assert.ok(ai.warnings.some((text) => text.includes('translator is "AI Assistant"')));
});

test('mergeWithBaseline keeps translations, fills gaps in baseline order, keeps extras', () => {
  const merged = mergeWithBaseline(english, { ok: 'Vale', home: { title: 'Hola' }, extra: 'x' });
  assert.deepEqual(merged, { home: { title: 'Hola', count: 'You have {{count}} of {{total}} books' }, ok: 'Vale', extra: 'x' });
  assert.deepEqual(Object.keys(merged), ['home', 'ok', 'extra']);
});

test('mergeWithBaseline does not modify its inputs', () => {
  const locale = { home: { title: 'Hola' } };
  mergeWithBaseline(english, locale);
  assert.deepEqual(locale, { home: { title: 'Hola' } });
});

test('buildNewLocale gives an honest _meta and the full English text', () => {
  const created = buildNewLocale({ code: 'xx', name: 'Xish', nativeName: 'Xisho' }, { _meta: { code: 'en' }, ...english });
  assert.equal(created._meta.translationStatus, 'needs-translation');
  assert.equal(created._meta.language, 'Xisho');
  assert.deepEqual(flattenLocale(created), flattenLocale(english));
});

test('parseArguments reads flags, --a=b and --a b, and rejects a missing value', () => {
  assert.deepEqual(parseArguments(['--strict', '--lang=es', '--out', 'f.md'], ['lang', 'out']), { strict: true, lang: 'es', out: 'f.md' });
  assert.throws(() => parseArguments(['--lang'], ['lang']), /needs a value/);
  assert.throws(() => parseArguments(['stray'], []), /Unexpected argument/);
});
