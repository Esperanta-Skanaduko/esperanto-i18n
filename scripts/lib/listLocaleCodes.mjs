import { readdirSync } from 'node:fs';

/**
 * Lists the language codes that have a file in a locales folder.
 *
 * @param localesDir - Absolute path of the folder holding `<code>.json` files.
 * @returns Language codes in alphabetical order.
 */
export const listLocaleCodes = (localesDir) =>
  readdirSync(localesDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -'.json'.length))
    .sort();
