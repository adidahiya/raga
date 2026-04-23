#!/bin/bash
set -e

yarn install --immutable

yarn workspace @adahiya/raga-types build
yarn workspace @adahiya/raga-lib build
