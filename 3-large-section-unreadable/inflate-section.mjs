// Usage: node inflate-section.mjs <manifest.json> <section>
//
// Prints one section of an Rsdoctor report (for example, chunkGraph) as JSON.
//
// The manifest lists each section's files. Together they hold one base64
// string of the zlib-compressed JSON. This decodes it into a Buffer instead of
// a string, so it also works for sections longer than V8's max string length.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

const [manifestPath, section] = process.argv.slice(2);
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sectionFiles = manifest.data[section];
if (!Array.isArray(sectionFiles)) {
  throw new Error(`Section "${section}" not found in ${manifestPath}`);
}

const base64 = sectionFiles.map((file) => readFileSync(file, 'utf8')).join('');
const json = inflateSync(Buffer.from(base64, 'base64'));
process.stdout.write(json);
