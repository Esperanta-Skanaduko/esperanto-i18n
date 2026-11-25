# Contributing

Thank you for helping people read the Esperanta Skanaduko in their own language.

- **Translators:** read [docs/TRANSLATING.md](docs/TRANSLATING.md). It is written for people who are not programmers.
- **Tooling changes** (the audit and generator scripts): keep the zero-dependency setup, run `npm test` before you open a pull request, and add a test for every new check, including one that proves the check fails when it should.

## Code style for the scripts

- Every function is a `const` arrow function with a TSDoc comment, and each file holds one function (the CLI entry points `audit.mjs` and `generate.mjs` are the exceptions: they only wire the pieces together).
- Plain ES modules for Node 20 or newer, no build step, no runtime dependencies.

## Conduct

Everyone taking part must follow the [Code of Conduct](CODE_OF_CONDUCT.md).
