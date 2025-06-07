import type { TrackDefinition } from "@adahiya/raga-types";
import {
  AudioFilesServerRoutes as Routes,
  type GetDiscogsGenresRequestParams,
} from "@adahiya/raga-types";
import { call, type Operation } from "effection";
import { Roarr as log } from "roarr";

export default function* getDiscogsGenreTagsRequest(
  serverBaseURL: string,
  { Artist = "", Name = "" }: TrackDefinition,
  init?: RequestInit,
): Operation<string[]> {
  const params = new URLSearchParams({
    artist: Artist,
    track: Name,
  } satisfies GetDiscogsGenresRequestParams);

  return yield* call(() =>
    fetch(`${serverBaseURL}${Routes.GET_DISCOGS_GENRES}?${params.toString()}`, {
      method: "GET",
      ...init,
    })
      .then((res) => res.json())
      .then((json: { genres: string[] | null | undefined }) => {
        if (json.genres == null || !Array.isArray(json.genres)) {
          log.info(`[client] No Discogs genres found for ${Artist} - ${Name}`);
          return [];
        }

        const genres = json.genres;
        log.info(`[client] got Discogs genres for ${Artist} - ${Name}: ${genres.join(", ")}`);
        return genres;
      })
      .catch((e: unknown) => {
        log.error(`[client] Failed to get Discogs genres: ${(e as Error).message}`);
        return [];
      }),
  );
}
