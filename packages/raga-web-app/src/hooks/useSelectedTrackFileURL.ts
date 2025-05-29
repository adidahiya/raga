import { useState } from "react";
import { Roarr as log } from "roarr";

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { isSupportedWebAudioFileFormat } from "../common/webAudioUtils";
import { getAudioFileURL } from "../audio/buffer";
import { appStore } from "../store/appStore";
import { useTaskEffect } from ".";
import useSelectedTrackDef from "./useSelectedTrackDef";

const serverPort = DEFAULT_AUDIO_FILES_SERVER_PORT;

/**
 * Get the media URL for the selected track.
 *
 * If the track has a file type unsupported by the Web Audio API, we will ask the server to convert
 * it to MP3 on the fly (this may take some time). URLs for tracks that have already been converted
 * are stored in app state so we don't ask the server to convert them again. While the app is
 * running, the converted tracks are also stored in a temp directory on disk, so it avoids
 * re-conversion even if our client-side cache is cleared.
 */
export default function useSelectedTrackFileURL() {
  const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
  const audioConvertedFileURLs = appStore.use.audioConvertedFileURLs();
  const convertTrackToMP3 = appStore.use.convertTrackToMP3();
  const trackDef = useSelectedTrackDef();
  const [selectedFileURL, setSelectedFileURL] = useState<string | undefined>(undefined);

  useTaskEffect(
    function* () {
      if (trackDef === undefined) {
        return undefined;
      }

      const existingConvertedFileURL = audioConvertedFileURLs[trackDef["Track ID"]];

      if (isSupportedWebAudioFileFormat(trackDef.Location)) {
        setSelectedFileURL(
          getAudioFileURL({
            fileOrResourceURL: trackDef.Location,
            serverRootFolder: audioFilesRootFolder,
            serverPort,
          }),
        );
      } else if (existingConvertedFileURL !== undefined) {
        log.debug(
          `[client] Using already-converted file for track ${trackDef["Track ID"].toString()}`,
        );
        setSelectedFileURL(existingConvertedFileURL);
      } else {
        const convertedTrackURL = yield* convertTrackToMP3(trackDef);
        setSelectedFileURL(convertedTrackURL);
      }
    },
    [trackDef, audioFilesRootFolder, audioConvertedFileURLs, convertTrackToMP3],
  );

  return selectedFileURL;
}
