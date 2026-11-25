#!/usr/bin/env node
/**
 * Creates missing locale files and completes existing ones. Every new value is the
 * English text, so nothing is translated for you; the file just has the right shape.
 *
 *   node scripts/generate.mjs                 create a file for each language in
 *                                             languages.json that has none
 *   node scripts/generate.mjs --lang xx       create locales/xx.json (xx must be in languages.json)
 *   node scripts/generate.mjs --sync          also add missing keys to existing files
 *   node scripts/generate.mjs --sync --lang es,fr   only those languages
 *   node scripts/generate.mjs --dry-run       show what would change, write nothing
 *   node scripts/generate.mjs --locales DIR   work in another folder (used by the tests)
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildNewLocale } from './lib/buildNewLocale.mjs';
import { listLocaleCodes } from './lib/listLocaleCodes.mjs';
import { mergeWithBaseline } from './lib/mergeWithBaseline.mjs';
import { BASELINE_CODE, LANGUAGES_FILE, LOCALES_DIR, META_KEY } from './lib/paths.mjs';
import { parseArguments } from './lib/parseArguments.mjs';
import { readJson } from './lib/readJson.mjs';

const options = parseArguments(process.argv.slice(2), ['lang', 'locales']);
const localesDir = options.locales ?? LOCALES_DIR;
const languages = readJson(LANGUAGES_FILE);
const baseline = readJson(join(localesDir, `${BASELINE_CODE}.json`));
const { [META_KEY]: ignoredMeta, ...english } = baseline;

const requested = options.lang ? String(options.lang).split(',').map((code) => code.trim()) : undefined;
for (const code of requested ?? []) {
  if (!languages.some((language) => language.code === code)) {
    console.error(`"${code}" is not in languages.json. Add it there first (code, name, nativeName, flag, rtl).`);
    process.exit(1);
  }
}

const write = (code, contents) => {
  if (!options['dry-run']) {
    writeFileSync(join(localesDir, `${code}.json`), `${JSON.stringify(contents, null, 2)}\n`, 'utf-8');
  }
};

let created = 0;
let synced = 0;
for (const language of languages) {
  if (requested && !requested.includes(language.code)) continue;
  const filePath = join(localesDir, `${language.code}.json`);
  if (!existsSync(filePath)) {
    write(language.code, buildNewLocale(language, baseline));
    console.log(`created ${language.code}.json (${language.name})`);
    created += 1;
  } else if (options.sync && language.code !== BASELINE_CODE) {
    const current = readJson(filePath);
    const { [META_KEY]: meta, ...translations } = current;
    const merged = mergeWithBaseline(english, translations);
    const before = JSON.stringify(translations);
    if (JSON.stringify(merged) !== before) {
      write(language.code, { ...(meta ? { [META_KEY]: meta } : {}), ...merged });
      console.log(`synced ${language.code}.json`);
      synced += 1;
    }
  }
}

const orphans = listLocaleCodes(localesDir).filter((code) => !languages.some((language) => language.code === code));
for (const code of orphans) console.warn(`warning: locales/${code}.json has no entry in languages.json`);

console.log(`${options['dry-run'] ? '[dry run] ' : ''}${created} created, ${synced} synced`);
