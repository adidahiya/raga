import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../../common/constants";
import { getAudioFileURL } from "../audio/buffer";
import { appStore } from "../store/appStore";

export function useSelectedTrackFileURL() {
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const selectedTrackId = appStore.use.selectedTrackId();
    const getTrackDef = appStore.use.getTrackDef();

    if (selectedTrackId === undefined) {
        return undefined;
    }

    const trackDef = getTrackDef(selectedTrackId);

    if (trackDef === undefined) {
        return undefined;
    }

    const fileUrl = getAudioFileURL({
        fileLocation: trackDef.Location,
        serverRootFolder: audioFilesRootFolder,
        serverPort: DEFAULT_AUDIO_FILES_SERVER_PORT,
    });

    return fileUrl;
}
