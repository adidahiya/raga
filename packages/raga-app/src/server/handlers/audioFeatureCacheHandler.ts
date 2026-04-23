import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  AUDIO_FEATURE_CACHE_VERSION,
  type AudioFeatureCache,
  type LoadAudioFeatureCacheOptions,
  type LoadedAudioFeatureCacheEventPayload,
  ServerEventChannel,
  type WriteAudioFeatureCacheEntriesOptions,
} from "@adahiya/raga-types";

import { log } from "../common/serverLogger";

const DEFAULT_CACHE_FILENAME = "ragaAudioFeatures.json";

function resolveCachePath(options: { cachePath?: string; libraryFilepath?: string }): string {
  if (options.cachePath !== undefined) return options.cachePath;
  const dir = options.libraryFilepath !== undefined
    ? dirname(options.libraryFilepath)
    : process.cwd();
  return join(dir, DEFAULT_CACHE_FILENAME);
}

export function handleLoadAudioFeatureCache(
  options: LoadAudioFeatureCacheOptions,
  context: { libraryFilepath?: string } = {},
): void {
  const path = resolveCachePath({ cachePath: options.cachePath, libraryFilepath: context.libraryFilepath });
  let cache: AudioFeatureCache;
  if (existsSync(path)) {
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw) as Partial<AudioFeatureCache>;
      cache = normalizeCache(parsed, options.libraryPersistentId);
    } catch (e) {
      log.error(`Failed to read audio feature cache at ${path}: ${(e as Error).message}`);
      cache = emptyCache(options.libraryPersistentId);
    }
  } else {
    cache = emptyCache(options.libraryPersistentId);
  }

  const payload: LoadedAudioFeatureCacheEventPayload = { cache, cachePath: path };
  process.parentPort.postMessage({
    channel: ServerEventChannel.LOADED_AUDIO_FEATURE_CACHE,
    data: payload,
  });
}

export function handleWriteAudioFeatureCacheEntries(
  options: WriteAudioFeatureCacheEntriesOptions,
  context: { libraryFilepath?: string } = {},
): void {
  const path = resolveCachePath({ cachePath: options.cachePath, libraryFilepath: context.libraryFilepath });
  let current: AudioFeatureCache;
  if (existsSync(path)) {
    try {
      const raw = readFileSync(path, "utf8");
      const parsed = JSON.parse(raw) as Partial<AudioFeatureCache>;
      current = normalizeCache(parsed, options.libraryPersistentId);
    } catch {
      current = emptyCache(options.libraryPersistentId);
    }
  } else {
    current = emptyCache(options.libraryPersistentId);
  }

  const next: AudioFeatureCache = {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId: options.libraryPersistentId ?? current.libraryPersistentId,
    tracks: { ...current.tracks, ...options.entries },
  };

  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(next, null, 2));
  } catch (e) {
    log.error(`Failed to write audio feature cache at ${path}: ${(e as Error).message}`);
  }

  process.parentPort.postMessage({
    channel: ServerEventChannel.WRITE_AUDIO_FEATURE_CACHE_COMPLETE,
  });
}

function normalizeCache(
  parsed: Partial<AudioFeatureCache>,
  libraryPersistentId: string | undefined,
): AudioFeatureCache {
  const tracks = parsed.tracks ?? {};
  return {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId: libraryPersistentId ?? parsed.libraryPersistentId,
    tracks,
  };
}

function emptyCache(libraryPersistentId?: string): AudioFeatureCache {
  return {
    version: AUDIO_FEATURE_CACHE_VERSION,
    libraryPersistentId,
    tracks: {},
  };
}
