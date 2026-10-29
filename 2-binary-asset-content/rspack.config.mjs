import { RsdoctorRspackPlugin } from '@rsdoctor/core';

export default {
  mode: 'production',
  entry: './src/index.js',
  module: {
    // Emit both files as-is, so the report stores their content.
    rules: [{ test: /\.(png|svg)$/, type: 'asset/resource' }],
  },
  plugins: [
    // Write the report to .rsdoctor/ and exit, instead of starting the
    // report server.
    new RsdoctorRspackPlugin({ disableClientServer: true }),
  ],
};
