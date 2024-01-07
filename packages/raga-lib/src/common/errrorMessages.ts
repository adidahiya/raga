export const LibErrors = {
  libraryInputPathNotFound: (inputLibraryPath: string) =>
    `[lib] No file found at ${inputLibraryPath}, please make sure it exists`,

  TEMP_DIR_UNAVAILABLE: `Unable to create a temporary directory for audio file conversion`,
  UNIMPLEMENTED: `Unimplemented`,
};
