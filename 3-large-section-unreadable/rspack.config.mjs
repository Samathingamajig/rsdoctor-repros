import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RsdoctorRspackPlugin } from '@rsdoctor/core';

// V8 can't create a string longer than 536,870,888 characters, and the
// Rsdoctor reader builds each report section as one string before parsing it.
//
// To get a section over that limit, src/padding.js imports three plain-text
// files of 190 MB each. Rsdoctor stores each file's content in both the
// chunkGraph and moduleCodeMap sections, so each of those ends up at about
// 570 million characters. The text is plain letters with nothing to escape.
const PADDING_DIR = join(import.meta.dirname, 'padding');
const PADDING_FILE_SIZE = 190_000_000;

function writePaddingFiles() {
  mkdirSync(PADDING_DIR, { recursive: true });
  // Each file needs different content; identical files would be emitted as a
  // single asset.
  for (const letter of ['a', 'b', 'c']) {
    const file = join(PADDING_DIR, `${letter}.txt`);
    if (!existsSync(file)) {
      writeFileSync(file, letter.repeat(PADDING_FILE_SIZE));
    }
  }
}

writePaddingFiles();

export default {
  mode: 'production',
  entry: {
    main: './src/index.js',
    padding: './src/padding.js',
  },
  module: {
    rules: [{ test: /\.txt$/, type: 'asset/resource' }],
  },
  plugins: [
    // Write the report to .rsdoctor/ and exit, instead of starting the
    // report server.
    new RsdoctorRspackPlugin({ disableClientServer: true }),
  ],
};
