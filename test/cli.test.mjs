import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { makeLocalesDir } from './helpers.mjs';

const script = (name) => fileURLToPath(new URL(`../scripts/${name}`, import.meta.url));
const run = (name, args) => spawnSync(process.execPath, [script(name), ...args], { encoding: 'utf-8' });
const en = { _meta: { code: 'en' }, a: { b: 'Hello there, friend {{name}}' }, c: 'Goodbye for now' };

test('audit exits 0 for a clean folder and 1 for a broken placeholder', () => {
  const clean = makeLocalesDir({ en, es: { a: { b: 'Hola amigo {{name}}' }, c: 'Adiós por ahora' } });
  assert.equal(run('audit.mjs', ['--locales', clean]).status, 0);
  const broken = makeLocalesDir({ en, es: { a: { b: 'Hola amigo {{nombre}}' }, c: 'Adiós por ahora' } });
  const result = run('audit.mjs', ['--locales', broken]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /differ from English/);
});

test('audit --strict fails on warnings; plain audit does not', () => {
  const gap = makeLocalesDir({ en, es: { c: 'Adiós por ahora' } });
  assert.equal(run('audit.mjs', ['--locales', gap]).status, 0);
  assert.equal(run('audit.mjs', ['--locales', gap, '--strict']).status, 1);
});

test('audit reports an unparsable file as an error instead of crashing', () => {
  const dir = makeLocalesDir({ en });
  const result = run('audit.mjs', ['--locales', dir, '--lang', 'zz']);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /cannot read zz.json/);
});

test('audit --json prints parseable results', () => {
  const dir = makeLocalesDir({ en, es: { c: 'Adiós por ahora' } });
  const parsed = JSON.parse(run('audit.mjs', ['--locales', dir, '--json']).stdout);
  assert.equal(parsed.baselineKeyCount, 2);
  assert.equal(parsed.results[0].code, 'es');
});

test('generate --dry-run writes nothing; --sync completes a file without touching translations', () => {
  const dir = makeLocalesDir({ en, es: { a: { b: 'Hola amigo {{name}}' } } });
  run('generate.mjs', ['--locales', dir, '--sync', '--lang', 'es', '--dry-run']);
  assert.equal(JSON.parse(readFileSync(join(dir, 'es.json'), 'utf-8')).c, undefined);
  const result = run('generate.mjs', ['--locales', dir, '--sync', '--lang', 'es']);
  assert.equal(result.status, 0);
  const synced = JSON.parse(readFileSync(join(dir, 'es.json'), 'utf-8'));
  assert.equal(synced.a.b, 'Hola amigo {{name}}');
  assert.equal(synced.c, 'Goodbye for now');
});

test('generate creates a file for a catalogued language and refuses an unknown code', () => {
  const dir = makeLocalesDir({ en });
  assert.equal(run('generate.mjs', ['--locales', dir, '--lang', 'fr']).status, 0);
  assert.equal(JSON.parse(readFileSync(join(dir, 'fr.json'), 'utf-8'))._meta.translationStatus, 'needs-translation');
  const refused = run('generate.mjs', ['--locales', dir, '--lang', 'qq']);
  assert.equal(refused.status, 1);
  assert.equal(existsSync(join(dir, 'qq.json')), false);
});
