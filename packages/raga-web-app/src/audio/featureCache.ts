import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  ClientEventChannel,
  createEmptyAudioFeatureCache,
  type LoadAudioFeatureCacheOptions,
  type LoadedAudioFeatureCacheEventPayload,
  ServerEventChannel,
  type TrackAudioFeatures,
  type WriteAudioFeatureCacheEntriesOptions,
} from "@adahiya/raga-types";
import { call, type Operation, sleep } from "effection";

import { withTimeout } from "../common/asyncUtils";

export type AudioFeaturesByPersistentId = Readonly<Record<string, TrackAudioFeatures>>;

export const FEATURE_CACHE_LOAD_TIMEOUT = 5_000;
export const FEATURE_CACHE_WRITE_TIMEOUT = 5_000;

/**
 * Read/write API for the audio feature sidecar cache. The Electron-backed implementation talks
 * to the app server via IPC; the in-memory implementation keeps everything in process for
 * mock / web mode and tests.
 */
export interface FeatureCacheClient {
  load: (options?: LoadAudioFeatureCacheOptions) => Operation<AudioFeatureCache>;
  write: (options: WriteAudioFeatureCacheEntriesOptions) => Operation<void>;
}

export function createInMemoryFeatureCacheClient(
  initial: AudioFeatureCache = createEmptyAudioFeatureCache(),
): FeatureCacheClient {
  let state: AudioFeatureCache = {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId: initial.libraryPersistentId,
    tracks: { ...initial.tracks },
  };

  return {
    load: function* () {
      yield* sleep(0);
      return state;
    },
    write: function* ({ entries, libraryPersistentId }) {
      yield* sleep(0);
      state = {
        version: AUDIO_FEATURE_CACHE_VERSION,
        libraryPersistentId: libraryPersistentId ?? state.libraryPersistentId,
        tracks: { ...state.tracks, ...entries },
      };
    },
  };
}

let _activeClient: FeatureCacheClient | undefined;

/**
 * Returns the process-wide audio feature cache client. In Electron the IPC client is used so
 * the cache is persisted via the sidecar JSON; in pure web/mock mode a single in-memory client
 * is shared so that incremental writes during analysis stay coherent.
 */
export function getFeatureCacheClient(): FeatureCacheClient {
  if (_activeClient === undefined) {
    const isElectron =
      typeof window !== "undefined" && (window as { api?: unknown }).api !== undefined;
    _activeClient = isElectron ? createIpcFeatureCacheClient() : createInMemoryFeatureCacheClient();
  }
  return _activeClient;
}

/** Test-only override; resets the cached client. */
export function __setFeatureCacheClientForTests(client: FeatureCacheClient | undefined): void {
  _activeClient = client;
}

export function createIpcFeatureCacheClient(): FeatureCacheClient {
  return {
    load: function* (options = {}) {
      window.api.send(ClientEventChannel.LOAD_AUDIO_FEATURE_CACHE, options);
      const payload = yield* withTimeout(
        call(
          window.api.waitForResponse<LoadedAudioFeatureCacheEventPayload>(
            ServerEventChannel.LOADED_AUDIO_FEATURE_CACHE,
            FEATURE_CACHE_LOAD_TIMEOUT,
          ),
        ),
        FEATURE_CACHE_LOAD_TIMEOUT,
        "[client] timed out loading audio feature cache",
      );
      return payload.cache;
    },
    write: function* (options) {
      window.api.send(ClientEventChannel.WRITE_AUDIO_FEATURE_CACHE_ENTRIES, options);
      yield* withTimeout(
        call(
          window.api.waitForResponse(
            ServerEventChannel.WRITE_AUDIO_FEATURE_CACHE_COMPLETE,
            FEATURE_CACHE_WRITE_TIMEOUT,
          ),
        ),
        FEATURE_CACHE_WRITE_TIMEOUT,
        "[client] timed out writing audio feature cache",
      );
    },
  };
}
