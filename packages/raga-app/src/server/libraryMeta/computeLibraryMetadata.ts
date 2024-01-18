import { fileURLToPath } from "node:url";

import type { SwinsianLibraryPlist } from "@adahiya/raga-lib";

export interface LibraryMetadata {
  longestCommonAudioFilePath: string;
}

export function computeLibraryMetadata(library: SwinsianLibraryPlist): LibraryMetadata {
  const trackLocations = Object.values(library.Tracks).map((track) => track.Location);
  const longestCommonTrackURL = getLongestCommonPrefix(trackLocations);
  const longestCommonAudioFilePath = fileURLToPath(longestCommonTrackURL);

  return {
    longestCommonAudioFilePath,
  };
}

function getLongestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) {
    return "";
  }

  let longestPrefix = "";

  // strs.length is guaranteed to be at least 1
  let shortestStr = strs[0];
  for (const str of strs) {
    if (str.length < shortestStr.length) {
      shortestStr = str;
    }
  }

  // longest prefix can only be as long as the shortest string
  outer: for (let i = 0; i < shortestStr.length; i++) {
    // check if all strings have this prefix
    for (const str of strs) {
      if (str.charAt(i) !== shortestStr.charAt(i)) {
        break outer;
      }
    }

    // if we reached here, it's a common prefix
    longestPrefix = shortestStr.slice(0, i + 1);
  }

  return longestPrefix;
}
