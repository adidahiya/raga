# adi's music library scripts

## `convert-swinsian-to-rekordbox-itunes-xml-library`

Converting a Swinsian library to Rekordbox iTunes XML format.

### 1. Export your Swinsian library to an XML file

![swinsian-export-1](./docs/assets/swinsian-export-library.png)
![swinsian-export-2](./docs/assets/swinsian-export-library-location.png)

### 2. Run the script to generate a `ModifiedLibrary.xml` file

Run the CLI, either:

-   build from source (`pnpm build`) and run `pnpm run-cli`
-   install as an NPM package and run its binary (`npm run music-library-scripts` or `node node_modules/music-library-scripts/bin/cli.mjs`)

It will prompt you for a path to the exported `SwinsianLibrary.xml` file, and output something like this to the console:

```
> music-library-scripts@ run-cli /Users/adi/dev/repos/music-library-scripts
> node lib/cli.mjs

✔ Which script would you like to run? › Convert Swinsian library to Music.app/iTunes XML format
✔ Where is your exported SwinsianLibrary.xml located? … /Users/adi/Music/Swinsian export/Latest
Loading library at /Users/adi/Music/Swinsian export/Latest/SwinsianLibrary.xml
loadPlistFile: 8.220s
Building modified library
buildPlistOutput: 7.693s
Writing modified library to /Users/adi/Music/Swinsian export/Latest/ModifiedLibrary.xml
```

### 3. Point Rekordbox to the new modified library file

_This configuration only needs to be done once!_

![rekordbox-itunes-xml](./docs/assets/rekordbox-select-itunes-xml.png)

After the first time you configure Rekordbox to look for `ModifiedLibrary.xml` in this location,
you can just hit the refresh button to load the library when you run this process again:

![refresh](./docs/assets/rekordbox-refresh-itunes-xml.png)
