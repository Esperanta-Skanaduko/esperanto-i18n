import { META_KEY } from './paths.mjs';

/**
 * Turns a nested locale object into a flat map keyed by dot paths, for example
 * `{ a: { b: 'c' } }` becomes `{ 'a.b': 'c' }`. Arrays and other non-object values
 * are kept whole as leaves. The top-level `_meta` block is skipped because it
 * describes the file and is not a translation.
 *
 * @param object - The parsed locale JSON, or any nested piece of it.
 * @param prefix - Dot path of `object` inside the file; leave empty for the whole file.
 * @returns A flat record of dot path to leaf value.
 */
export const flattenLocale = (object, prefix = '') => {
  const flat = {};
  for (const [key, value] of Object.entries(object)) {
    if (prefix === '' && key === META_KEY) continue;
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flat, flattenLocale(value, path));
    } else {
      flat[path] = value;
    }
  }
  return flat;
};
