import type { TrackDefinition } from "@adahiya/raga-lib";
import { Button } from "@blueprintjs/core";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./trackTable.module.scss";

export default function FetchDiscogsGenreButton({ trackDef }: { trackDef: TrackDefinition }) {
  const getDiscogsGenres = appStore.use.getDiscogsGenres();
  const writeAudioFileTag = appStore.use.writeAudioFileTag();
  const handleFetchDiscogsGenre = useOperationCallback(
    function* () {
      const genres = yield* getDiscogsGenres(trackDef);

      yield* writeAudioFileTag(trackDef, "Genre", genres?.join(", ") ?? "");
    },
    [getDiscogsGenres, trackDef, writeAudioFileTag],
  );

  return (
    <Button
      className={styles.smallOutlinedButton}
      icon="plus"
      onClick={handleFetchDiscogsGenre}
      outlined={true}
      small={true}
      text="Fetch"
    />
  );
}
