# Binary asset content is stored as lossy UTF-8

`InternalBundlePlugin` collects each asset's `source()`
([bundle.ts#L81](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/core/src/inner-plugins/plugins/bundle.ts#L81)), and
`assetsContents` stores it with `content.toString()`
([assetsContent.ts#L16](https://github.com/web-infra-dev/rsdoctor/blob/6033225fce00e7b9c2943a702cf9123c733a6ed4/packages/shared/src/graph/transform/chunks/assetsContent.ts#L16)).
For a binary asset such as a PNG, decoding as UTF-8 turns every invalid byte
sequence into U+FFFD. The stored string can't be turned back into the image,
and each U+FFFD takes 3 bytes in the report (6 in the fallback stringify
path, which writes it as `\ufffd`). The asset code viewer only shows text,
so the stored content is never useful.

`src/index.js` imports `src/image.png` (a 32x32 noise PNG) and
`src/icon.svg` as `asset/resource`. The SVG is the control: it is text, and
its `✓` checks that multi-byte UTF-8 survives. The commands below extract
each asset's stored content from the report and compare it with the original
file.

```sh
npm install
npm run build

npm run -s inflate chunkGraph | jq -j '.assets[] | select(.path | endswith(".svg")) | .content' > stored.svg
cmp src/icon.svg stored.svg && echo identical
# identical

npm run -s inflate chunkGraph | jq -j '.assets[] | select(.path | endswith(".png")) | .content' > stored.png
cmp src/image.png stored.png
# src/image.png stored.png differ: char 1, line 1
wc -c src/image.png stored.png
#     3172 src/image.png
#     5632 stored.png
xxd -l 8 src/image.png; xxd -l 8 stored.png
# 00000000: 8950 4e47 0d0a 1a0a  .PNG....
# 00000000: efbf bd50 4e47 0d0a  ...PNG..   (0x89 became U+FFFD)
```

To see it in the report UI, run `npm run analyze`, open the **Bundle Size**
page, and select the `.png` asset. The code viewer shows the stored content as
garbled text.

To clean up afterwards, run `rm -rf dist .rsdoctor stored.svg stored.png`.
