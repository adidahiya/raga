import { extname } from "node:path";

import { log } from "../utils/log";

/**
 * Basic track properties, the bare minimum required for these scripts to function and for various applications
 * to locate & manage tracks.
 */
export const BasicTrackProperty = {
  TRACK_ID: "Track ID" as const,
  PERSISTENT_ID: "Persistent ID" as const,
  LOCATION: "Location" as const,
};
export type BasicTrackProperty = (typeof BasicTrackProperty)[keyof typeof BasicTrackProperty];

export interface BasicTrackDefinition {
  [BasicTrackProperty.TRACK_ID]: number;
  [BasicTrackProperty.PERSISTENT_ID]: string;
  [BasicTrackProperty.LOCATION]: string;
}

/**
 * @returns whether a record contains all the basic track properties
 */
export function isBasicTrackDefinition(
  track: Partial<BasicTrackDefinition>,
): track is Required<BasicTrackDefinition> {
  const expectedProperties = Object.values(BasicTrackProperty);
  const missingProperties = expectedProperties.filter((prop) => track[prop] === undefined);
  if (missingProperties.length > 0) {
    log.info(`Track missing expected properties: ${missingProperties.join(", ")}`);
    return false;
  }
  return true;
}

const NumericTrackProperty = {
  BIT_RATE: "Bit Rate" as const,
  BPM: "BPM" as const,
  PLAY_COUNT: "Play Count" as const,
  RATING: "Rating" as const,
  SAMPLE_RATE: "Sample Rate" as const,
  SIZE: "Size" as const,
  TOTAL_TIME: "Total Time" as const,
  TRACK_NUMBER: "Track Number" as const,
  VOLUME_ADJUSTMENT: "Volume Adjustment" as const,
  YEAR: "Year" as const,
};
export type NumericTrackProperty = (typeof NumericTrackProperty)[keyof typeof NumericTrackProperty];

const StringTrackProperty = {
  ALBUM_ARTIST: "Album Artist" as const,
  ALBUM: "Album" as const,
  ARTIST: "Artist" as const,
  GENRE: "Genre" as const,
  GROUPING: "Grouping" as const,
  NAME: "Name" as const,
  TRACK_TYPE: "Track Type" as const,
};
export type StringTrackProperty = (typeof StringTrackProperty)[keyof typeof StringTrackProperty];

const DateTrackProperty = {
  DATE_ADDED: "Date Added" as const,
  DATE_MODIFIED: "Date Modified" as const,
};
export type DateTrackProperty = (typeof DateTrackProperty)[keyof typeof DateTrackProperty];

/** Track properties present in both Swinsian and Music.app */
export const TrackProperty = {
  ...BasicTrackProperty,
  ...NumericTrackProperty,
  ...StringTrackProperty,
  ...DateTrackProperty,
};
export type TrackProperty = (typeof TrackProperty)[keyof typeof TrackProperty];

export type TrackDefinition = BasicTrackDefinition &
  Partial<{ [P in NumericTrackProperty]: number }> &
  Partial<{ [P in StringTrackProperty]: string }> &
  Partial<{ [P in DateTrackProperty]: Date }>;

/**
 * Track properties which are commonly user-edited.
 */
export const EDITABLE_TAGS: TrackProperty[] = [
  "Album",
  "Album Artist",
  "Artist",
  "Date Modified",
  "Name",
  "Rating",
  "Track Number",
  "Year",
  "Grouping",
  "Genre",
];

/**
 * @returns whether a record contains all the common track properties
 */
export function isTrackDefinition(
  track: Partial<TrackDefinition>,
): track is Required<TrackDefinition> {
  const expectedProperties = Object.values(TrackProperty);
  const missingProperties = expectedProperties.filter((prop) => track[prop] === undefined);
  if (missingProperties.length > 0) {
    log.info(`Track missing expected properties: ${missingProperties.join(", ")}`);
    return false;
  }
  return true;
}

/** Track properties present in Music.app library */
export const MusicAppTrackProperty = {
  ...TrackProperty,
  ARTWORK_COUNT: "Artwork Count" as const,
  FILE_FOLDER_COUNT: "File Folder Count" as const,
  LIBRARY_FOLDER_COUNT: "Library Folder Count" as const,
  KIND: "Kind" as const,
  NORMALIZATION: "Normalization" as const,
  LOVED: "Loved" as const,
};
export type MusicAppTrackProperty =
  (typeof MusicAppTrackProperty)[keyof typeof MusicAppTrackProperty];

export type MusicAppTrackDefinition = TrackDefinition &
  Partial<{
    [P in MusicAppTrackProperty]: string | number | boolean;
  }>;

export function convertSwinsianTrackToMusicAppTrack(
  track: SwinsianTrackDefinition,
): MusicAppTrackDefinition {
  const extension = extname(track.Location);
  let kind = "MPEG";
  switch (extension) {
    case ".aif":
    case ".aiff":
      kind = "AIFF";
      break;
    case ".flac":
      kind = "FLAC";
      break;
    case ".wav":
      kind = "WAV";
      break;
  }
  return {
    ...track,
    "Artwork Count": 1,
    "File Folder Count": -1,
    "Library Folder Count": -1,
    Kind: `${kind} audio file`,
    Normalization: 0,
    "Persistent ID": parseInt(track["Persistent ID"], 10).toString(16).padStart(16, "0"),
    Loved: false,
  };
}

/** Track properties present in Swinsian library */
export const SwinsianTrackProperty = {
  ...TrackProperty,
  VOLUME_ADJUSTMENT: "Volume Adjustment" as const,
};

export type SwinsianTrackProperty =
  (typeof SwinsianTrackProperty)[keyof typeof SwinsianTrackProperty];

export type SwinsianTrackDefinition = TrackDefinition &
  Partial<{
    [P in SwinsianTrackProperty]: string | number;
  }>;
