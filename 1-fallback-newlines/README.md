# Fallback JSON stringify strips `\n` escapes

When a report section is too large for `JSON.stringify`, `SDKCore.writePieces`
falls back to `Json.stringify`
([core.ts#L153](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/core/src/sdk/sdk/core.ts#L153)). That function splits
every chunk on the two characters `\n` and drops them
([json.ts#L27](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/core/src/build-utils/build/json.ts#L27)).

So every newline in stored code disappears, and a `\n` escape inside a
string literal leaves a stray backslash. That is an invalid JSON escape, or,
before a quote, it ends the string early.

`src/index.js` is `console.log("Hello\nWorld");`. `rspack.config.mjs`
creates three 190 MB text files in `./padding` the first time it runs. They
push `chunkGraph` over V8's max string length (536,870,888 chars), so that
section goes through the fallback. `--env small` leaves the padding out.

`rsdoctor analyze` can't load a section that large (see
`3-large-section-unreadable`), so `inflate-section.mjs` decodes it with
Buffers instead.

```sh
npm install

npm run build:small
npm run -s inflate chunkGraph > small.json
grep -o 'console\.log(\\"Hello[^;]*;' small.json
# console.log(\"Hello\\nWorld\");
jq empty small.json
# (valid)

npm run build
npm run -s inflate chunkGraph > padded.json
grep -o 'console\.log(\\"Hello[^;]*;' padded.json
# console.log(\"Hello\World\");
jq empty padded.json
# jq: parse error: Invalid escape at line 1, column 190003100
```

The build takes about 5 seconds and peaks around 4.5 GB RSS. Afterwards, run
`rm -rf padding dist .rsdoctor small.json padded.json` to free about 1.7 GB.

## Unit tests

Below are some sample tests to be put in `packages/core/tests/utils/json.test.ts`.

Notice that `Json.stringify` comes from `packages/core/src/build-utils/build/json.ts`, not the builtin `JSON` module.

```ts
it('preserves escaped newlines in string values', async () => {
  const data = {
    newline: 'line1\nline2',
    windowsPath: 'C:\\new\\path',
    backslashBeforeQuote: 'a\\n"b',
  };

  for (const chunkSize of [undefined, 5]) {
    const chunks = (await Json.stringify(
      data,
      undefined,
      undefined,
      undefined,
      chunkSize,
    )) as unknown as string[];

    expect(JSON.parse(chunks.join(''))).toStrictEqual(data);
  }
});
```
