import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Creates a throwaway locales folder in the system temp folder.
 *
 * @param locales - Map of language code to the object to store as `<code>.json`.
 * @returns Absolute path of the new folder.
 */
export const makeLocalesDir = (locales) => {
  const dir = mkdtempSync(join(tmpdir(), 'esperanto-i18n-test-'));
  for (const [code, contents] of Object.entries(locales)) {
    writeFileSync(join(dir, `${code}.json`), JSON.stringify(contents), 'utf-8');
  }
  return dir;
};
