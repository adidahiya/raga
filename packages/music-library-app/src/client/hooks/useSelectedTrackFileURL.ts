import { useMemo } from "react";

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../../common/constants";
import { getAudioFileURL } from "../audio/buffer";
import { appStore } from "../store/appStore";
import useSelectedTrackDef from "./useSelectedTrackDef";

export default function useSelectedTrackFileURL() {
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const trackDef = useSelectedTrackDef();

    return useMemo(() => {
        if (trackDef === undefined) {
            return undefined;
        }

        return getAudioFileURL({
            fileLocation: trackDef.Location,
            serverRootFolder: audioFilesRootFolder,
            serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
        });
    }, [trackDef, audioFilesRootFolder]);
}
