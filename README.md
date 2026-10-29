# Rsdoctor 2.0.1 large-report repros

Each folder is a standalone npm project. See its README for the commands and
the expected output. Each repro triggers only its own bug, so it should keep
reproducing after the other two are fixed.

| Folder | Bug |
|---|---|
| `1-fallback-newlines` | The fallback stringify for oversized sections strips `\n` escapes and writes invalid JSON |
| `2-binary-asset-content` | Binary assets (images, fonts) are stored as lossy UTF-8 text in `chunkGraph` |
| `3-large-section-unreadable` | Sections over V8's max string length are written but can't be read back |

Tested with Node 26.13.0, `@rsdoctor/core@2.0.1`, `@rsdoctor/cli@2.0.1`,
`@rspack/core@2.3.0`, and `@rspack/cli@2.3.0`.
