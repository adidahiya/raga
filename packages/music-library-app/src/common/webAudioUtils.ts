import type { AudioFileType, TrackDefinition } from "@adahiya/music-library-tools-lib";

// see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
const WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS: AudioFileType[] = ["mp3", "wav", "flac", "aac"];

export function isSupportedWebAudioFileFormat(
    trackDefOrLocation: TrackDefinition | string,
): boolean {
    const location =
        typeof trackDefOrLocation === "string" ? trackDefOrLocation : trackDefOrLocation.Location;

    for (const ext of WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS) {
        if (location.endsWith(ext)) {
            return true;
        }
    }

    return false;
}
