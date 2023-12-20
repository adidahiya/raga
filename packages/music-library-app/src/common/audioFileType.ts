import { TrackDefinition } from "@adahiya/music-library-tools-lib";

export const AudioFileType = {
    MP3: "mp3" as const,
    M4A: "m4a" as const,
    FLAC: "flac" as const,
    WAV: "wav" as const,
    AIF: "aif" as const,
    AIFF: "aiff" as const,
    AAC: "aac" as const,
};
export type AudioFileType = (typeof AudioFileType)[keyof typeof AudioFileType];

export function getTrackFileType(trackDef: TrackDefinition): AudioFileType | undefined {
    const fileExtension = trackDef.Location.split(".").pop()!;
    if (Object.values(AudioFileType).includes(fileExtension as AudioFileType)) {
        return fileExtension as AudioFileType;
    }

    return undefined;
}
