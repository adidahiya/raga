#!/usr/bin/env bash

set -e
set -o pipefail

bin_dir="$( dirname "$(readlink -f "$0")" )"

node $bin_dir/../lib/cli.mjs
