export const ServerErrors = {
  AUDIO_FILE_NOT_FOUND: `Audio file not found`,
  AUDIO_FILES_ROOT_FOLDER_NOT_FOUND: `Audio files root folder does not exist or is empty`,
  FFMPEG_UNAVAILABLE: `ffmpeg is not available, cannot convert audio files`,
  MP3_CODEC_UNAVAILABLE: `No MP3 codec is available`,
  INVALID_CONVERSION_REQUEST: `Invalid MP3 conversion request`,
  CONVERTED_AUDIO_FILE_NOT_FOUND: `Converted audio file not found`,
  libraryWriteTagFailedFileNotFound: (filePath: string) =>
    `Failed to write tag to track at ${filePath}: file not found`,
};
