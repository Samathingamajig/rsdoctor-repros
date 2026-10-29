import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RsdoctorRspackPlugin } from '@rsdoctor/core';

// V8 can't create a string longer than 536,870,888 characters. When a report
// section's JSON would be longer than that, JSON.stringify throws and Rsdoctor
// falls back to its streaming stringify, which is where the bug is.
//
// To get there, src/padding.js imports three plain-text files of 190 MB each.
// Rsdoctor stores each emitted asset's content in the chunkGraph section, so
// that section ends up at about 570 million characters.
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

export default (env) => {
  // `rspack build --env small` builds without the padding, so the report is
  // written by JSON.stringify. Compare its output with the padded build.
  const entry = { main: './src/index.js' };
  if (!env.small) {
    writePaddingFiles();
    entry.padding = './src/padding.js';
  }

  return {
    mode: 'production',
    entry,
    // Keep the output readable so the "\n" in src/index.js stays as written.
    optimization: { minimize: false },
    module: {
      rules: [{ test: /\.txt$/, type: 'asset/resource' }],
    },
    plugins: [
      // Write the report to .rsdoctor/ and exit, instead of starting the
      // report server.
      new RsdoctorRspackPlugin({ disableClientServer: true }),
    ],
  };
};
