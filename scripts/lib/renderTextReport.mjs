/**
 * Formats audit results as a plain-text report for the terminal.
 *
 * @param audit - The value returned by `auditLocales`.
 * @param verbose - When true, lists the offending keys under each language.
 * @returns The report, ready to print.
 */
export const renderTextReport = (audit, verbose) => {
  const lines = [`Translation audit: ${audit.results.length} locales against en.json (${audit.baselineKeyCount} keys)`, ''];
  for (const result of audit.results) {
    const problems = [...result.errors.map((text) => `ERROR ${text}`), ...result.warnings];
    lines.push(`${problems.length === 0 ? 'ok  ' : result.errors.length > 0 ? 'FAIL' : 'warn'} ${result.code.padEnd(4)} ${String(result.coverage).padStart(5)}%  ${result.status}`);
    for (const problem of problems) lines.push(`       - ${problem}`);
    if (verbose) {
      for (const key of result.empty) lines.push(`       empty: ${key}`);
      for (const mismatch of result.placeholderMismatches) {
        lines.push(`       placeholders: ${mismatch.key} expected ${mismatch.expected.join(' ') || 'none'}, found ${mismatch.found.join(' ') || 'none'}`);
      }
      for (const key of result.missing) lines.push(`       missing: ${key}`);
      for (const key of result.untranslated) lines.push(`       english: ${key}`);
      for (const key of result.extra) lines.push(`       extra: ${key}`);
    }
  }
  const failing = audit.results.filter((result) => result.errors.length > 0).length;
  const warning = audit.results.filter((result) => result.errors.length === 0 && result.warnings.length > 0).length;
  lines.push('', `${audit.results.length - failing - warning} clean, ${warning} with warnings, ${failing} with errors`);
  return lines.join('\n');
};
