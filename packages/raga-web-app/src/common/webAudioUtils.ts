import type { AudioFileType, TrackDefinition } from "@adahiya/raga-types";
import { isString } from "radash";

// see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Containers
const WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS: AudioFileType[] = ["mp3", "wav", "flac", "aac"];

export function isSupportedWebAudioFileFormat(
  trackDefOrLocation: TrackDefinition | string | undefined,
): boolean {
  if (trackDefOrLocation === undefined) {
    return false;
  }

  const location = isString(trackDefOrLocation) ? trackDefOrLocation : trackDefOrLocation.Location;

  for (const ext of WEB_AUDIO_SUPPORTED_FILE_EXTENSIONS) {
    if (location.endsWith(ext)) {
      return true;
    }
  }

  return false;
}
