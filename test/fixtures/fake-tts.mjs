// Stands in for a real text-to-speech program: reads the text file and writes its length into the output file.
import { readFileSync, writeFileSync } from 'node:fs';
const [input, output] = process.argv.slice(2);
writeFileSync(output, `fake audio for ${readFileSync(input, 'utf8').length} characters`);
