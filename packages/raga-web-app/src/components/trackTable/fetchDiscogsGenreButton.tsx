import type { TrackDefinition } from "@adahiya/raga-types";
import { Button } from "@mantine/core";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export default function FetchDiscogsGenreButton({ trackDef }: { trackDef: TrackDefinition }) {
  const getDiscogsGenres = appStore.use.getDiscogsGenres();
  const writeAudioFileTag = appStore.use.writeAudioFileTag();
  const setLibraryTrackHasNoDiscogsGenres = appStore.use.setLibraryTrackHasNoDiscogsGenre();

  const handleFetchDiscogsGenre = useOperationCallback(
    function* () {
      const genres = yield* getDiscogsGenres(trackDef);
      if (genres == null || genres.length === 0) {
        setLibraryTrackHasNoDiscogsGenres(trackDef["Track ID"]);
        return;
      }

      yield* writeAudioFileTag(trackDef, "Genre", genres.join(", "));
    },
    [getDiscogsGenres, trackDef, writeAudioFileTag],
  );

  return (
    <Button
      className={styles.smallOutlinedButton}
      onClick={handleFetchDiscogsGenre}
      variant="light"
      color="gray"
      size="compact-sm"
      fullWidth={true}
    >
      Fetch
    </Button>
  );
}
