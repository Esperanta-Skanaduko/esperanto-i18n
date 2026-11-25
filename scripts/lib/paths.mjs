import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Absolute path of the repository root. */
export const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Absolute path of the folder that holds one JSON file per language. */
export const LOCALES_DIR = join(ROOT_DIR, 'locales');

/** Absolute path of the language catalogue (code, names, flag, direction). */
export const LANGUAGES_FILE = join(ROOT_DIR, 'languages.json');

/** Absolute path of the list of keys that may legitimately match the English text. */
export const ALLOWLIST_FILE = join(ROOT_DIR, 'audit-allowlist.json');

/** Language code of the file every other language is compared against. */
export const BASELINE_CODE = 'en';

/** Top-level key that holds file metadata instead of translations. */
export const META_KEY = '_meta';
