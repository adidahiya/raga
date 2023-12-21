import { TrackDefinition } from "@adahiya/music-library-tools-lib";
import { pick } from "radash";
import { useEffect, useState } from "react";
import { Roarr as log } from "roarr";

import { AudioFilesServerRoutes as ServerRoutes } from "../../common/audioFilesServerRoutes";
import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../../common/constants";
import { isSupportedWebAudioFileFormat } from "../../common/webAudioUtils";
import { getAudioFileURL } from "../audio/buffer";
import { appStore } from "../store/appStore";
import useSelectedTrackDef from "./useSelectedTrackDef";

// TODO: better server URL
const serverPort = DEFAULT_AUDIO_FILES_SERVER_PORT;
const audioFilesServerBaseURL = `http://localhost:${serverPort}`;

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
  const setConvertedAudioFileURL = appStore.use.setConvertedAudioFileURL();
  const setAudioFilesConverterIsBusy = appStore.use.setAudioFilesConverterIsBusy();
  const trackDef = useSelectedTrackDef();
  const [selectedFileURL, setSelectedFileURL] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (trackDef === undefined) {
      return undefined;
    }

    const existingConvertedFileURL = audioConvertedFileURLs[trackDef["Track ID"]];

    if (isSupportedWebAudioFileFormat(trackDef.Location)) {
      setSelectedFileURL(
        getAudioFileURL({
          fileLocation: trackDef.Location,
          serverRootFolder: audioFilesRootFolder,
          serverPort,
        }),
      );
    } else if (existingConvertedFileURL !== undefined) {
      log.debug(`[client] Using already-converted file for track ${trackDef["Track ID"]}`);
      setSelectedFileURL(existingConvertedFileURL);
    } else {
      log.debug(
        `[client] Initiating request to convert track ${trackDef["Track ID"]} to MP3, this may take a few seconds...`,
      );
      setAudioFilesConverterIsBusy(true);
      convertTrackToMP3(trackDef)
        .then((convertedFileURL) => {
          setSelectedFileURL(convertedFileURL);
          setConvertedAudioFileURL(trackDef["Track ID"], convertedFileURL);
          log.debug(`[client] ... done converting track ${trackDef["Track ID"]}!`);
          setAudioFilesConverterIsBusy(false);
        })
        .catch((failedReason: string) => {
          log.error(failedReason);
        });
    }
  }, [
    trackDef,
    audioFilesRootFolder,
    audioConvertedFileURLs,
    setAudioFilesConverterIsBusy,
    setConvertedAudioFileURL,
  ]);

  return selectedFileURL;
}

/**
 * @returns the URL of the converted MP3 file
 */
async function convertTrackToMP3(trackDef: TrackDefinition): Promise<string> {
  const baseURL = audioFilesServerBaseURL;

  return new Promise((resolve, reject) => {
    fetch(`${baseURL}${ServerRoutes.POST_CONVERT_TO_MP3}`, {
      method: "POST",
      body: JSON.stringify({
        trackProperties: pick(trackDef, ["Artist", "Album", "Location", "Name", "Track ID"]),
      }),
    })
      .then((res) => {
        if (res.ok) {
          void res.text().then((outputFilePath) => {
            log.debug(`[client] Converted track ${trackDef["Track ID"]} to MP3: ${outputFilePath}`);
            resolve(
              `${baseURL}${ServerRoutes.GET_CONVERTED_MP3}/${encodeURIComponent(outputFilePath)}`,
            );
          });
        } else {
          reject(`[client] Failed to convert ${trackDef.Location} to MP3: ${res.statusText}`);
        }
      })
      .catch((e) => {
        reject(`[client] Failed to convert ${trackDef.Location} to MP3: ${(e as Error).message}`);
      });
  });
}
