import { Roarr as log } from "roarr";
import { serializeError } from "serialize-error";

import {
    ANALYZE_AUDIO_FILE_TIMEOUT,
    WRITE_AUDIO_FILE_TAG_TIMEOUT,
} from "../../../common/constants";
import { ClientEventChannel, ServerEventChannel } from "../../../common/events";
import { analyzeBPM } from "../../audio/bpm";
import { loadAudioBuffer } from "../../audio/buffer";
import { isSupportedWebAudioFileFormat } from "../../audio/webAudioUtils";
import type { AppStoreSliceCreator } from "../zustandUtils";

export type AudioAnalyzerStatus = "ready" | "busy";

export interface AudioAnalyzerState {
    analyzeBPMPerTrack: boolean;
    analyzerStatus: AudioAnalyzerStatus;
}

export interface AudioAnalyzerActions {
    setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => void;
    analyzeTrack: (trackId: number) => Promise<void>;
    analyzePlaylist: (playlistId: string) => Promise<void>;
}

export const createAudioAnalyzerSlice: AppStoreSliceCreator<
    AudioAnalyzerState & AudioAnalyzerActions
> = (set, get) => ({
    analyzeBPMPerTrack: false,
    analyzerStatus: "ready",

    setAnalyzeBPMPerTrack: (analyzeBPMPerTrack: boolean) => {
        set({ analyzeBPMPerTrack });
    },

    /** @throws */
    analyzeTrack: async (trackId: number) => {
        const trackDef = get().getTrackDef(trackId);

        if (trackDef === undefined) {
            log.error(`[client] Unable to analyze track ${trackId}`);
            return;
        }

        const fileLocation = trackDef.Location;
        const canAnalyzeFileFormat = isSupportedWebAudioFileFormat(trackDef);

        if (trackDef.BPM !== undefined || !canAnalyzeFileFormat) {
            log.debug(`[client] skipping analysis of track ${trackId}`);
            return;
        }

        return new Promise((resolve, reject) => {
            set({ analyzerStatus: "busy" });
            const analyzeAudioTimeout = setTimeout(() => {
                log.error(`[client] timed out while analyzing track ${trackId}`);
                set({ analyzerStatus: "ready" });
                reject();
            }, ANALYZE_AUDIO_FILE_TIMEOUT);

            let bpm: number | undefined;

            void (async () => {
                try {
                    const trackAudio = await loadAudioBuffer(fileLocation);
                    bpm = Math.round(await analyzeBPM(trackAudio));
                } catch (e) {
                    log.error(
                        `[client] failed to analyze track ${trackId}, is the audio files server running? (file location: ${fileLocation})`,
                    );
                    set({ analyzerStatus: "ready" });
                    reject();
                } finally {
                    clearTimeout(analyzeAudioTimeout);
                }
            })();

            if (bpm === undefined) {
                return;
            }

            window.api.send(ClientEventChannel.WRITE_AUDIO_FILE_TAG, {
                fileLocation,
                tagName: "BPM",
                value: bpm,
            });

            const writeTagTimeout = setTimeout(() => {
                log.error(`[client] timed out writing BPM tag for track ${trackId}`);
                reject();
            }, WRITE_AUDIO_FILE_TAG_TIMEOUT);

            window.api.handleOnce(ServerEventChannel.WRITE_AUDIO_FILE_TAG_COMPLETE, () => {
                log.info(`[client] completed updating BPM for track ${trackId}`);
                set((state) => {
                    state.library!.Tracks[trackId].BPM = bpm!;
                    state.libraryWriteState = "ready"; // needs to be written to disk
                    state.analyzerStatus = "ready";
                });
                clearTimeout(writeTagTimeout);
                resolve();
            });
        });
    },

    analyzePlaylist: async (playlistId: string) => {
        const { libraryPlaylists, analyzeTrack } = get();

        if (libraryPlaylists === undefined) {
            log.error(
                `[client] Unable to analyze playlist ${playlistId}, libraryPlaylists is undefined`,
            );
            return;
        }

        const playlistDef = libraryPlaylists[playlistId];
        if (playlistDef === undefined) {
            log.error(
                `[client] Unable to analyze playlist ${playlistId}, could not find it in the library`,
            );
            return;
        }

        log.debug(`[client] analyzing playlist ${playlistId} (name: '${playlistDef.Name}')...`);

        const trackIds = playlistDef["Playlist Items"].map((item) => item["Track ID"]);

        for (const trackId of trackIds) {
            try {
                await analyzeTrack(trackId);
            } catch (e) {
                log.error(
                    `[client] error analyzing track ${trackId} in playlist ${playlistId}, error: ${JSON.stringify(
                        serializeError(e),
                    )}`,
                );
                continue;
            }
        }
    },
});
