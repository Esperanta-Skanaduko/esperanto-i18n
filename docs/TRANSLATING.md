# Translator guide

This guide is for people who speak Esperanto and another language. You only need a GitHub account and a text editor; you can even edit a file in your browser (open it on GitHub and press the pencil icon).

## 1. Pick something small to fix

Run `npm run audit` (or read [STATUS.md](STATUS.md)) and choose one of these:

- **Fix a wrong translation** in a language you know well. Open the issue form "Translation fix" if you do not want to edit the file yourself.
- **Translate missing keys.** Run `node scripts/audit.mjs --lang xx --verbose` and look at the `missing:` and `english:` lines. Missing means the key is not in your file yet; `english` means it is there but still has the English text.
- **Review a machine translation.** Many files were produced by machine translation and are labelled "human-translated" anyway. A native speaker reading one section and fixing it is a real contribution.

Small pull requests are welcome. One section of one language is a good size.

## 2. Edit the file

Open `locales/<code>.json`. Each file has the same shape as `locales/en.json`:

```json
{
  "_meta": { "language": "Español", "code": "es", "translationStatus": "machine-translated" },
  "home": {
    "hero": {
      "title": "Aprende Esperanto"
    }
  }
}
```

Change only the text on the right of the colon.

### Rules that keep the website working

1. **Never change a key** (the text on the left). The website looks text up by key.
2. **Keep every `{{placeholder}}` exactly as written.** `"Showing {{count}} of {{total}}"` becomes `"Mostrando {{count}} de {{total}}"`. The words inside the braces stay in English. You may move a placeholder to wherever your grammar needs it. The audit fails if a placeholder is renamed, lost or added.
3. **Keep `$t(some.key)`** references as they are; they pull in another translation.
4. **Do not leave a value empty.** If you are not ready to translate a key, leave it out of the file or keep the English text. An empty string shows nothing on the site.
5. **Keep the site name `Esperanta\nSkanaduko`** (with the line break) unless your language has an established form. The audit allows brand names to stay in English; see `audit-allowlist.json`.
6. **Keep it valid JSON.** Strings are in double quotes, there is no comma after the last item, and a quote inside text is written `\"`. Your editor or `npm run audit` will tell you when something is wrong.
7. **Save the file as UTF-8** and write real characters (`ĉ ĝ ĥ ĵ ŝ ŭ`, `é`, `ß`, Arabic, Cyrillic). Do not use `\u` codes or the x-system (`cx`) in the text.

### Tone

Match the English text: friendly and plain, aimed at someone starting to learn Esperanto. Use the form of "you" that is normal for a language-learning site in your language. If a term has two common translations, prefer the one a learner will already have seen elsewhere.

### Right-to-left languages

Arabic, Persian and Hebrew are marked `"rtl": true` in `languages.json`. Translate normally; the page direction is handled by the site. Keep placeholders as `{{count}}` even in right-to-left text.

## 3. Update the `_meta` block honestly

The `_meta` block at the top of each file says how far the file can be trusted. Update it when you change the file:

| Field | Meaning |
| --- | --- |
| `translationStatus` | `needs-translation`: English placeholders. `machine-translated`: produced by a tool, not yet reviewed. `human-translated`: a person wrote or reviewed all of it. `complete`: human-translated and every key present. |
| `translator` | Your name or GitHub handle. For a tool, name the tool ("Google Translate"). |
| `reviewStatus` | `pending-human-review`, `in-review` or `completed`. |
| `lastUpdated` | The date, as `YYYY-MM-DD`. |

Do not mark a file `human-translated` or `complete` unless a person did the work and the key coverage is real. The audit warns when the status claims more than the file delivers, and it flags `human-translated` files whose translator is a machine.

Using a machine translation to get a first draft is fine, as long as the file says so and you read it before you send it.

## 4. Check your work

```bash
node scripts/audit.mjs --lang xx --verbose
```

- Zero **errors** is required. A pull request with an error will not be merged.
- Warnings are allowed, because a language can be finished in several pull requests. A language that wants the "complete" label must pass `node scripts/audit.mjs --strict --lang xx`.

## 5. Send it

1. Fork this repository on GitHub and make your change on a branch of your fork.
2. Describe what you changed in the pull request (language, section, and whether you are a native speaker). The pull request template has a checklist.
3. A maintainer or another speaker of your language reviews it. If nobody can review a language, say so in the pull request and it will be merged on the audit result alone, labelled accordingly.

You can also open an issue ("Translation fix") and paste the corrected text. A maintainer will apply it.

## Adding a new language

1. Add an entry to `languages.json`: `code` (the ISO 639-1 two-letter code if there is one, otherwise ISO 639-3), `name` in English, `nativeName` in the language itself, a `flag`, and `rtl`.
2. Run `node scripts/generate.mjs --lang xx`. It creates `locales/xx.json` filled with English.
3. Translate it as described above and open a pull request.

## Known problems you can help with

- 18 files say `human-translated` but name "AI Assistant" as translator. They need a human review pass, or their status needs to become `machine-translated`.
- 14 languages (`be bg bs cv mg mk os rn sb sk sl sr tg wa`) are still entirely English.
- The `accessibility`, `theme`, `games` and `analyzer` sections are translated in Esperanto only.
- `sb` (Sorbian) is not an ISO 639-1 code; Upper and Lower Sorbian are `hsb` and `dsb`. Renaming it needs a matching change in the website, so open an issue first.
- Several native names in `languages.json` are written in English rather than in the language itself (Bengali, Telugu and Kirundi).
- `eo.json` still has one English phrase left: `donate.sections.thankYou.title` is "Dankon! Thank You!".
