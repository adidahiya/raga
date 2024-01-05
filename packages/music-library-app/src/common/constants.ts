export const DEBUG = process.env.NODE_ENV === "development";

// HACKHACK: this is currently not working, tried various packages (electron-devtools-installer,
// electron-devtools-vendor, and standalone react-devtools), and nothing seems to work with the current combination of
// Chromium, Electron, React, and the devtools extension. Likely due to https://github.com/facebook/react/issues/25939.
export const INSTALL_REACT_DEVELOPER_TOOLS = false;

export const LOCAL_STORAGE_KEY = "music-library-app";
// HACKHACK: need a better default
export const DEFAULT_AUDIO_FILES_ROOT_FOLDER = "/Volumes/CZSSD/music/tracks";
export const DEFAULT_AUDIO_FILES_SERVER_PORT = 8457;
export const DEFAULT_ID3_TAG_USER_EMAIL = "abc@123.com";

// communication intervals & timeouts
export const AUDIO_FILES_SERVER_PING_INTERVAL = 10_000;
export const AUDIO_FILES_SERVER_PING_TIMEOUT = 1_000;
export const LOAD_SWINSIAN_LIBRARY_TIMEOUT = 10_000;
export const WRITE_AUDIO_FILE_TAG_TIMEOUT = 2_000;
export const WRITE_MODIFIED_LIBRARY_TIMEOUT = 20_000;
export const ANALYZE_AUDIO_FILE_TIMEOUT = 4_000;

// UI settings
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const SHOW_TRACK_TABLE_CONTEXT_MENU: boolean = true;
