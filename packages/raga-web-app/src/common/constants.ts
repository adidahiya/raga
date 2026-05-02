export const DEBUG = process.env.NODE_ENV === "development";

export const LOCAL_STORAGE_KEY = "raga-app";
export const DEFAULT_AUDIO_FILES_SERVER_PORT = 8457;

// communication intervals & timeouts
export const AUDIO_FILES_SERVER_PING_INTERVAL = 10_000;
export const AUDIO_FILES_SERVER_PING_TIMEOUT = 1_000;
export const LOAD_SWINSIAN_LIBRARY_TIMEOUT = 10_000;
export const WRITE_AUDIO_FILE_TAG_TIMEOUT = 2_000;
export const WRITE_MODIFIED_LIBRARY_TIMEOUT = 20_000;
// Per-track analysis can take several seconds even with the worker (chromagram + BPM on long
// tracks). Generous bound to avoid spurious failures; cancellation is the user's lever.
export const ANALYZE_AUDIO_FILE_TIMEOUT = 60_000;

// UI settings
// TODO: make track table row height configurable
export const TRACK_TABLE_ROW_HEIGHT = 24;
export const TRACK_TABLE_HEADER_HEIGHT = 30;
export const TRACK_TABLE_FILTER_BAR_HEIGHT = 30 + 1; // add a pixel for border
