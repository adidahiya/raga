// HACKHACK: do not use `{ TrackDefinition } from "@adahiya/raga-types"` values for this because that import
// causes our fluent-ffmepg resolution alias (defined in `vite.main.config.mjs`) to be insufficient; we cannot
// configure how raga-lib's CJS dependencies are resolved
export const enum TrackPropertySortKey {
  ARTIST = "artist",
  BPM = "bpm",
  DATE_ADDED = "dateAdded",
  FILESOURCE = "filesource",
  FILETYPE = "filetype",
  GENRE = "genre",
  INDEX = "index",
  NAME = "name",
  RATING = "rating",
}
