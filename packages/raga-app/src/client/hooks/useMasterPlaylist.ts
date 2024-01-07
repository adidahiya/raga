import type { PlaylistDefinition } from "@adahiya/raga-lib";
import { useMemo } from "react";

import { appStore } from "../store/appStore";

export default function useMasterPlaylist(): PlaylistDefinition | undefined {
  const library = appStore.use.library();
  const masterPlaylist = useMemo(
    () => library?.Playlists.find((playlist) => playlist.Master),
    [library],
  );
  return masterPlaylist;
}
