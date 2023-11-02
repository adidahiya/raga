# music library tools

> Tools for managing a large music library for DJs

## Motivation

I built these tools to support my music library management workflow which includes:

-   [Swinsian](https://swinsian.com/) - watch folders for new downloads, fix metadata & tags, organize tracks into manual & smart playlists
-   [Rekordbox](https://rekordbox.com/en/) - import playlists & tracks from Swinsian, analyze for CDJ playback, export to portable USB drive

The most fundamental tool here is one that provides the data plumbing between Swinsian and Rekordbox. The
[`music-library-tools-cli` package](https://github.com/adidahiya/music-library-scripts/blob/main/packages/music-library-tools-cli/README.md)
allows you to export a Swinsian library into an XML format which can be imported by Rekordbox. For Node.js developers,
the functionality of this tool can also be accessed through the
[`music-library-tools-lib` package](https://github.com/adidahiya/music-library-scripts/blob/main/packages/music-library-tools-lib/README.md).

Beyond these data connection utilities, this repository also contains an Electron-based desktop application called
`music-library-app` with featuers to help manage a DJ library and provide some additional functionality not available
in either Swinsian or Rekordbox:

-   (coming soon) analyze track BPM and write values to ID3 tags

## Screenshot

(coming soon)

## Development

Requirements:

-   Node.js v20.x (see version specified in `.nvmrc`)
-   Yarn v4.x (see version specified in `package.json`)
-   Deno v1.x (see [installation docs](https://docs.deno.com/runtime/manual/getting_started/installation))

Getting started:

-   `corepack enable` - configures the Yarn package manager

Dev tasks

-   `yarn build` - builds TypeScript sources and bundles up the Electron app
-   `yarn dist` - creates the Electron app distributable package
