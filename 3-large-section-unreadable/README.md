# Report sections over V8's max string length can be written but not read

`SDKCore.writePieces` streams a section that is too large for
`JSON.stringify` into fragments
([core.ts#L153](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/core/src/sdk/sdk/core.ts#L153)), so writing it
works. The reader, `fetchShardingData`, inflates the shards as a stream but
then joins all of the text into one string before `JSON.parse`
([manifest.ts#L137](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/shared/src/common/manifest.ts#L137)). Any
section over 536,870,888 chars (`buffer.constants.MAX_STRING_LENGTH`)
throws `RangeError: Invalid string length`, and a larger heap doesn't raise
that limit.

`rspack.config.mjs` creates three 190 MB text files in `./padding` the
first time it runs. They push `chunkGraph` and `moduleCodeMap` over the
limit. The text is plain letters with nothing to escape, so the report is
valid JSON. `jq` parses it once `inflate-section.mjs` decodes it with
Buffers.

```sh
npm install
npm run build

npm run analyze
# [@rsdoctor/cli] ✖ Invalid string length
# [RSDOCTOR ERROR] RangeError: Invalid string length
#     at Array.join (<anonymous>)
#     at fetchShardingData (.../@rsdoctor/shared/dist/common/manifest.js:55:73)

npm run -s inflate chunkGraph > chunkGraph.json
wc -c chunkGraph.json
# 570001904 chunkGraph.json
jq -c keys chunkGraph.json
# ["assets","chunks","entrypoints"]
```

The build takes about 5 seconds and peaks around 5 GB RSS. Afterwards, run
`rm -rf padding dist .rsdoctor chunkGraph.json` to free about 1.7 GB.
