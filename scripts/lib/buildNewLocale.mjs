import { mergeWithBaseline } from './mergeWithBaseline.mjs';
import { META_KEY } from './paths.mjs';

/**
 * Creates the contents of a locale file for a language that has none yet. Every
 * value is the English text, so the app keeps working while translators replace it,
 * and `_meta` states honestly that nothing has been translated.
 *
 * @param language - The language entry from `languages.json`.
 * @param baseline - The parsed English file (it may contain `_meta`, which is ignored).
 * @returns The new file contents, ready to serialise.
 */
export const buildNewLocale = (language, baseline) => {
  const { [META_KEY]: ignoredMeta, ...english } = baseline;
  return {
    [META_KEY]: {
      language: language.nativeName,
      code: language.code,
      translationStatus: 'needs-translation',
      note: 'This file contains English text as placeholders. A translation is needed.',
    },
    ...mergeWithBaseline(english, {}),
  };
};
