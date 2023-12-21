# implementation notes

### data model

Much of the data model of Music.app/iTunes and Swinsian is encoded as types in `src/models/`.

Here are the differences I found between Music's XML library and Swinsian's:

- Some track properties are present in Music, and not Swinsian:
  - Artwork Count: 1
  - File Folder Count: -1
  - Library Folder Count: -1
  - Kind: MPEG/AIFF/FLAC audio file
  - Normalization: ###
- One property, "Persistent ID" has a different format in the two apps:
  - In Music, it's a a 16-character hexadecimal string, like `"E0759F0E0B819404"`
  - In Swinsian, it's a string representation of the "Track ID", like `"65455"
- Some track properties are present in Swinsian, and not Music:
  - Volume Adjustment: ###

### third-party parsing libraries

I first attempted to implement the Swinsian library converter using [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser), which seemed to work fine but was tedious because it required parsing the (rather verbose and archaic) plist data model myself.

I switched to using [plist.js](https://github.com/TooTallNate/plist.js). This works much better, even though it parses large XML more slowly (around 40% slower). The benefits of a transparent and ergonomic JavaScript data model with this library outweigh the performance costs.

### improvements, to-dos

- Make sure no invalid/illegal characters in track tags trip up the script, it should gracefully handle them
