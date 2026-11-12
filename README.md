# Rsdoctor Bug Reproducible Examples

Each folder is a standalone npm project. See its README for the commands and
the expected output. Each repro triggers only its own bug.

| Folder | Bug | Versions | Status |
|---|---|---|---|
| `1-fallback-newlines` | The fallback stringify for oversized sections strips `\n` escapes and writes invalid JSON | Rsdoctor 2.0.1, Rspack 2.3.0, Node 26.13.0 | Fixed by [#2145](https://github.com/web-infra-dev/rsdoctor/pull/2145) ([`554ef59`](https://github.com/web-infra-dev/rsdoctor/commit/554ef59c13469513b949a9dc1b692b59822b2090)), released in [v2.0.3](https://github.com/web-infra-dev/rsdoctor/releases/tag/v2.0.3) (2026-11-12) |
| `2-binary-asset-content` | Binary assets (images, fonts) are stored as lossy UTF-8 text in `chunkGraph` | Rsdoctor 2.0.1, Rspack 2.3.0, Node 26.13.0 | Fixed by [#2131](https://github.com/web-infra-dev/rsdoctor/pull/2131) ([`e6b7f92`](https://github.com/web-infra-dev/rsdoctor/commit/e6b7f921ff7e373323d09488675c766aa01a00a2)), released in [v2.0.2](https://github.com/web-infra-dev/rsdoctor/releases/tag/v2.0.2) (2026-11-06) |
| `3-large-section-unreadable` | Sections over V8's max string length are written but can't be read back | Rsdoctor 2.0.1, Rspack 2.3.0, Node 26.13.0 | Fixed by [#2144](https://github.com/web-infra-dev/rsdoctor/pull/2144) ([`e5262bb`](https://github.com/web-infra-dev/rsdoctor/commit/e5262bbb869adee4b103d5aa7f1152727901780e)), released in [v2.0.3](https://github.com/web-infra-dev/rsdoctor/releases/tag/v2.0.3) (2026-11-12) |
| `4-multi-compiler-analyze-switch` | `rsdoctor analyze` can't switch compilers in a multi-compiler report ("Load data failed") | Rsdoctor 2.0.3, Rspack 2.3.2, Node 26.13.1 | Not fixed as of 2026-11-12; still reproduces on v2.0.3, the latest release |

"Rsdoctor" means `@rsdoctor/core` and `@rsdoctor/cli`, and "Rspack" means
`@rspack/core` and `@rspack/cli`. The Versions column lists the versions each
repro pins in its `package.json`.
