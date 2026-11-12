import { RsdoctorRspackPlugin } from '@rsdoctor/core';

// Two compilers, each with its own Rsdoctor plugin.
//
// By default, the plugin writes the report to disk and the build exits, so
// the report has to be opened with `rsdoctor analyze`. With `--env live`
// (`npm run build:live`), the plugin keeps a report server running for each
// compiler instead, and the build doesn't exit.
export default (env) => {
  const live = Boolean(env.live);

  const compiler = (name) => ({
    name,
    mode: 'production',
    entry: `./src/${name}.js`,
    output: { path: `dist/${name}` },
    plugins: [new RsdoctorRspackPlugin({ disableClientServer: !live })],
  });

  return [compiler('web'), compiler('worker')];
};
