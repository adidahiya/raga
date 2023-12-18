import { Roarr as log } from "roarr";

import { DEFAULT_AUDIO_FILES_ROOT_FOLDER } from "../../../common/constants";
import { ClientEventChannel, ServerEventChannel } from "../../../common/events";
import type { AppStoreSet, AppStoreSliceCreator } from "../zustandUtils";

export type AudioFilesServerStatus = "stopped" | "starting" | "started" | "failed";

export interface AudioFilesServerState {
    audioFilesRootFolder: string;
    audioFilesServerStatus: AudioFilesServerStatus;
}

export interface AudioFilesServerActions {
    setAudioTracksRootFolder: (audioFilesRootFolder: string) => void;
    startAudioFilesServer: () => void;
    stopAudioFilesServer: () => void;
}

export const createAudioFilesServerSlice: AppStoreSliceCreator<
    AudioFilesServerState & AudioFilesServerActions
> = (set) => {
    return {
        audioFilesRootFolder: DEFAULT_AUDIO_FILES_ROOT_FOLDER,
        audioFilesServerStatus: "stopped",

        setAudioTracksRootFolder: (audioFilesRootFolder: string) => {
            set({ audioFilesRootFolder });
        },

        startAudioFilesServer: () => {
            set((state) => {
                if (state.audioFilesServerStatus === "started") {
                    window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
                    window.api.handleOnce(
                        ServerEventChannel.AUDIO_FILES_SERVER_READY_FOR_RESTART,
                        () => {
                            log.debug("[client] restarting audio files server...");
                            initAudioFilesServer(set);
                        },
                    );
                } else {
                    log.debug("[client] starting audio files server...");
                    initAudioFilesServer(set);
                }
            });
        },

        stopAudioFilesServer: () => {
            set((state) => {
                if (state.audioFilesServerStatus !== "started") {
                    log.error("[client] audio files server is not running");
                    return;
                }

                log.debug("[client] stopping audio files server...");
                window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_STOP);
                state.audioFilesServerStatus = "stopped";
            });
        },
    };
};

function initAudioFilesServer(set: AppStoreSet) {
    set((state) => {
        window.api.send(ClientEventChannel.AUDIO_FILES_SERVER_START, {
            audioFilesRootFolder: state.audioFilesRootFolder,
        });
        state.audioFilesServerStatus = "starting";

        window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_STARTED, () => {
            set((state) => {
                state.audioFilesServerStatus = "started";
            });
        });

        window.api.handleOnce(ServerEventChannel.AUDIO_FILES_SERVER_ERROR, () => {
            set((state) => {
                state.audioFilesServerStatus = "failed";
            });
        });
    });
}
