# `rsdoctor analyze` can't switch compilers in a multi-compiler report

With a MultiCompiler config, Rsdoctor writes one report per compiler and
shows a **Compiler** dropdown in the client. When the report is opened with
`rsdoctor analyze`, picking another compiler fails with "Load data failed,
please try again". Each compiler's report has to be opened with its own
`rsdoctor analyze --profile ...` command.

`rspack.config.mjs` exports two compilers, `web` and `worker`, each with
`RsdoctorRspackPlugin({ disableClientServer: true })`, so the build writes
the report and exits. The report is written
to the first compiler's output dir, `dist/web/.rsdoctor/`, and the `worker`
report goes in `dist/web/.rsdoctor/compilers/worker/`.

```sh
npm install
npm run build
npm run analyze
```

In the browser, open the **Compiler** dropdown and pick `worker`. The page
navigates to

```
http://localhost:<port>/index.html?manifest=%2F<abs path>%2Fdist%2Fweb%2F.rsdoctor%2Fcompilers%2Fworker%2Fmanifest.json
```

and shows "Load data failed, please try again". In the network tab:

```
404 GET http://localhost:<port>/<abs path>/dist/web/.rsdoctor/compilers/worker/manifest.json
```

Opening the `worker` report on its own works:

```sh
npm run analyze:worker
```

### Compare: switching works while the build is still running

```sh
npm run build:live
```

This runs the same build with `disableClientServer: false` (`rspack build
--env live`). The plugin starts a report server for each compiler and opens
the first one in the browser. Picking `worker` in the dropdown goes to the
`worker` server's port and shows its data. But the build never exits; stop it
with Ctrl+C.

The `manifest.json` files it writes to disk are the same as `npm run build`
writes, so `npm run analyze` afterwards still can't switch.

## Cause

Each manifest's `series` lists every compiler's report by `path`, which is an
absolute filesystem path
([controller.ts#L184](https://github.com/web-infra-dev/rsdoctor/blob/32e78e6fb6af229e0a556ec9acafec58f61f9ab8/packages/core/src/sdk/multiple/controller.ts#L184)).
An `origin` (the report server URL) is only added for live build servers.

The dropdown navigates to the compiler's `origin` if it has one. If not, it
sets `?manifest=<path>`
([builder-select.tsx#L70](https://github.com/web-infra-dev/rsdoctor/blob/32e78e6fb6af229e0a556ec9acafec58f61f9ab8/packages/client/src/components/Layout/builder-select.tsx#L70)),
and the client then fetches that path from the current server.

`rsdoctor analyze` loads only the one manifest passed to `--profile`
([analyze.ts#L102](https://github.com/web-infra-dev/rsdoctor/blob/32e78e6fb6af229e0a556ec9acafec58f61f9ab8/packages/cli/src/commands/analyze.ts#L102)).
It doesn't serve the other compilers' manifests or their section files, so
the request 404s.
