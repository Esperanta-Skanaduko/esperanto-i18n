/**
 * Splits command-line arguments into flags and options. `--name value` and
 * `--name=value` both give an option; a bare `--name` gives a flag set to true.
 *
 * @param argv - The arguments after the script name.
 * @param valueOptions - Names of the options that take a value.
 * @returns A record of option name to value (`true` for flags).
 * @throws When an option that needs a value has none.
 */
export const parseArguments = (argv, valueOptions) => {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`);
    const [name, inline] = argument.slice(2).split(/=(.*)/s);
    if (valueOptions.includes(name)) {
      const value = inline ?? argv[++index];
      if (value === undefined || value.startsWith('--')) throw new Error(`--${name} needs a value`);
      parsed[name] = value;
    } else {
      parsed[name] = true;
    }
  }
  return parsed;
};
