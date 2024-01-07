# raga-lib

[![npm](https://img.shields.io/npm/v/@adahiya/raga-lib.svg?label=@adahiya/raga-lib)](https://www.npmjs.com/package/@adahiya/raga-lib)

## Usage guide

Requirements:

- [Node.js](https://nodejs.org/en) v20.x (see version specified in `.nvmrc`)
- (To use audio file conversion APIs) `ffmpeg` must be installed and available on the system path.
  See installation docs for [macOS](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/wiki/Installing-ffmpeg-on-Mac-OS-X)
  and [Debian](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/wiki/Installing-ffmpeg-on-Debian).
  - Note: you may need to configure your module loader or bundler to patch a buggy conditional import
    in the `fluent-ffmpeg` package. For example, use this
    [`resolve.alias` in Vite](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/573#issuecomment-1082586875)

Installation:

```sh
npm install @adahiya/raga-lib
```
