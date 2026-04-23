/**
 * Aggregated representation of an album, derived from a set of tracks belonging to it.
 *
 * The persistent id is computed deterministically from album artist + album name (or whatever
 * fields are available), so the same album receives the same id across library reloads.
 */
export interface AlbumDefinition {
  /**
   * Stable persistent id derived from album artist + album name. Survives library reloads as
   * long as the underlying tag values don't change.
   */
  persistentAlbumId: string;

  /** Display name of the album. */
  name: string;

  /** "Album Artist" if set, else the most common "Artist" across the tracks. */
  albumArtist: string;

  /** Set of distinct artists across the album's tracks, in insertion order. */
  artists: string[];

  /** Number of tracks. */
  trackCount: number;

  /** Total time across all tracks, in milliseconds. */
  totalTimeMs: number;

  /** Sum of "Play Count" across the album's tracks. */
  totalPlayCount: number;

  /** Most common "Genre" tag across the album's tracks. */
  dominantGenre: string | undefined;

  /** Earliest "Year" present in the album. */
  yearMin: number | undefined;

  /** Latest "Year" present in the album. */
  yearMax: number | undefined;

  /** Mean "BPM" across the tracks that have a BPM, or undefined if none do. */
  meanBPM: number | undefined;

  /** Mean energy across the tracks that have an energy feature, or undefined if none do. */
  meanEnergy: number | undefined;

  /**
   * Persistent id of the track whose artwork should be considered the "primary" cover art for
   * this album. Currently the first track in the album's track list.
   */
  primaryCoverArtTrackPersistentId: string;

  /** Persistent ids of the tracks belonging to this album, in their original ordering. */
  trackPersistentIds: string[];

  /** Track ids of the tracks belonging to this album, in their original ordering. */
  trackIds: number[];
}
