import type {
  AlbumDefinition,
  SwinsianLibraryPlist,
  SwinsianTrackDefinition,
} from "@adahiya/raga-types";

import type { AudioFeaturesByPersistentId } from "../audio/featureCache";

/**
 * Computes a deterministic persistent album id from album artist + album name.
 *
 * This is intentionally not a hash - keeping it human-readable makes debugging the cache
 * substantially easier. Two albums with identical artist + name will collide, which is the
 * desired behaviour (they should be treated as the same album).
 */
export function computeAlbumPersistentId(albumArtist: string, albumName: string): string {
  const slug = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return `album:${slug(albumArtist) || "unknown-artist"}/${slug(albumName) || "unknown-album"}`;
}

interface AggregateAlbumsOptions {
  audioFeatures?: AudioFeaturesByPersistentId;
}

/**
 * Pure derivation that groups library tracks into {@link AlbumDefinition}s with aggregated
 * stats. Tracks without album/album artist tags are grouped under an "Unknown" placeholder so
 * the output covers the entire library.
 */
export function aggregateAlbums(
  library: SwinsianLibraryPlist,
  options: AggregateAlbumsOptions = {},
): AlbumDefinition[] {
  const audioFeatures = options.audioFeatures ?? {};
  const groups = new Map<string, SwinsianTrackDefinition[]>();

  // Stable iteration order: numeric Track ID ascending.
  const trackIds = Object.keys(library.Tracks)
    .map((s) => Number.parseInt(s, 10))
    .sort((a, b) => a - b);

  for (const id of trackIds) {
    const track = library.Tracks[id] as SwinsianTrackDefinition | undefined;
    if (track === undefined) continue;
    const albumArtist = track["Album Artist"] ?? track.Artist ?? "Unknown Artist";
    const albumName = track.Album ?? "Unknown Album";
    const id_ = computeAlbumPersistentId(albumArtist, albumName);
    let bucket = groups.get(id_);
    if (bucket === undefined) {
      bucket = [];
      groups.set(id_, bucket);
    }
    bucket.push(track);
  }

  const albums: AlbumDefinition[] = [];
  for (const [persistentAlbumId, tracks] of groups) {
    const first = tracks[0];
    const albumArtist = first["Album Artist"] ?? first.Artist ?? "Unknown Artist";
    const name = first.Album ?? "Unknown Album";

    const artists: string[] = [];
    const seenArtists = new Set<string>();
    let totalTimeMs = 0;
    let totalPlayCount = 0;
    const genreCounts = new Map<string, number>();
    let yearMin: number | undefined;
    let yearMax: number | undefined;
    let bpmSum = 0;
    let bpmCount = 0;
    let energySum = 0;
    let energyCount = 0;

    for (const t of tracks) {
      if (t.Artist !== undefined && !seenArtists.has(t.Artist)) {
        seenArtists.add(t.Artist);
        artists.push(t.Artist);
      }
      totalTimeMs += t["Total Time"] ?? 0;
      totalPlayCount += t["Play Count"] ?? 0;
      if (t.Genre !== undefined && t.Genre !== "") {
        genreCounts.set(t.Genre, (genreCounts.get(t.Genre) ?? 0) + 1);
      }
      if (t.Year !== undefined) {
        yearMin = yearMin === undefined ? t.Year : Math.min(yearMin, t.Year);
        yearMax = yearMax === undefined ? t.Year : Math.max(yearMax, t.Year);
      }
      if (t.BPM !== undefined) {
        bpmSum += t.BPM;
        bpmCount += 1;
      }
      const features = audioFeatures[t["Persistent ID"]] as
        | (typeof audioFeatures)[string]
        | undefined;
      if (features !== undefined) {
        energySum += features.energy;
        energyCount += 1;
        if (t.BPM === undefined) {
          bpmSum += features.bpm;
          bpmCount += 1;
        }
      }
    }

    let dominantGenre: string | undefined;
    let dominantGenreCount = 0;
    for (const [g, c] of genreCounts) {
      if (c > dominantGenreCount) {
        dominantGenre = g;
        dominantGenreCount = c;
      }
    }

    albums.push({
      persistentAlbumId,
      name,
      albumArtist,
      artists,
      trackCount: tracks.length,
      totalTimeMs,
      totalPlayCount,
      dominantGenre,
      yearMin,
      yearMax,
      meanBPM: bpmCount === 0 ? undefined : bpmSum / bpmCount,
      meanEnergy: energyCount === 0 ? undefined : energySum / energyCount,
      primaryCoverArtTrackPersistentId: first["Persistent ID"],
      trackPersistentIds: tracks.map((t) => t["Persistent ID"]),
      trackIds: tracks.map((t) => t["Track ID"]),
    });
  }

  // Sort albums alphabetically by album artist, then name, for stable output.
  albums.sort((a, b) => {
    const c = a.albumArtist.localeCompare(b.albumArtist);
    return c !== 0 ? c : a.name.localeCompare(b.name);
  });
  return albums;
}
