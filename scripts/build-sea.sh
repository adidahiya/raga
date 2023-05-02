#!/usr/bin/env bash

set -e
set -o pipefail

scripts_dir="$( dirname "$(readlink -f "$0")" )"
root_dir=$scripts_dir/../

cd $root_dir

# 1. Configure main and output paths in `sea-config.json`
echo '{ "main": "lib-cjs/cli.mjs", "output": "sea-cli.blob" }' > sea-config.json

# 2. Generate the blob to be injected
node --experimental-sea-config sea-config.json

# 3. Create a copy of the node executable
cp $(command -v node) music-library-scripts-standalone

# 4. Remove the signature of the binary
codesign --remove-signature music-library-scripts-standalone

# 5. Inject the blob into the copied binary by running postject
npx postject music-library-scripts-standalone NODE_SEA_BLOB sea-cli.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 \
    --macho-segment-name NODE_SEA

# 6. Sign the binary
codesign --sign - music-library-scripts-standalone

# 7. Run the binary
./music-library-scripts-standalone
