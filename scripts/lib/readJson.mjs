import { readFileSync } from 'node:fs';

/**
 * Reads and parses a UTF-8 JSON file.
 *
 * @param filePath - Absolute path of the file.
 * @returns The parsed JSON value.
 * @throws When the file is missing or is not valid JSON.
 */
export const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf-8'));
