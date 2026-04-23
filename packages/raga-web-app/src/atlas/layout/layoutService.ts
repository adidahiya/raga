import { hashFeatureSet } from "./hash";
import type {
  LayoutWorkerErrorResponse,
  LayoutWorkerRequest,
  LayoutWorkerResponse,
} from "./layoutWorker";
import { layout as runLayoutSync,type LayoutInput, type LayoutResult } from "./strategies";

/**
 * Cached layout entry. The cache key is a {@link hashFeatureSet} of the input matrix + algo +
 * params, so two requests with the same content reuse the same coordinates instantly.
 */
export interface LayoutCacheEntry {
  hash: string;
  result: LayoutResult;
}

export class LayoutService {
  private worker: Worker | undefined;
  private nextRequestId = 0;
  private pending = new Map<
    string,
    { resolve: (r: LayoutResult) => void; reject: (e: Error) => void }
  >();
  private cache = new Map<string, LayoutCacheEntry>();
  private cacheLimit: number;

  constructor(options: { worker?: Worker; cacheLimit?: number } = {}) {
    this.worker = options.worker;
    this.cacheLimit = options.cacheLimit ?? 16;

    if (this.worker !== undefined) {
      this.worker.addEventListener(
        "message",
        (event: MessageEvent<LayoutWorkerResponse | LayoutWorkerErrorResponse>) => {
          const id = event.data.requestId;
          const callbacks = this.pending.get(id);
          if (callbacks === undefined) return;
          this.pending.delete(id);
          if ("error" in event.data) {
            callbacks.reject(new Error(event.data.error));
          } else {
            callbacks.resolve(event.data.result);
          }
        },
      );
    }
  }

  computeHash(input: LayoutInput): string {
    return hashFeatureSet({
      matrix: input.matrix,
      ids: input.ids,
      algo: input.algo,
      params: input.params as Record<string, unknown> | undefined,
    });
  }

  /** Look up a cached layout without computing one. */
  getCached(input: LayoutInput): LayoutCacheEntry | undefined {
    return this.cache.get(this.computeHash(input));
  }

  async compute(input: LayoutInput): Promise<LayoutCacheEntry> {
    const hash = this.computeHash(input);
    const cached = this.cache.get(hash);
    if (cached !== undefined) return cached;

    const result = await this.runOnce(input);
    const entry: LayoutCacheEntry = { hash, result };
    this.cache.set(hash, entry);
    if (this.cache.size > this.cacheLimit) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) this.cache.delete(firstKey);
    }
    return entry;
  }

  private runOnce(input: LayoutInput): Promise<LayoutResult> {
    if (this.worker === undefined) {
      // Synchronous fallback (tests, environments without Workers)
      return Promise.resolve(runLayoutSync(input));
    }
    const requestId = (this.nextRequestId++).toString();
    return new Promise<LayoutResult>((resolve, reject) => {
      this.pending.set(requestId, { resolve, reject });
      const request: LayoutWorkerRequest = { requestId, input };
      this.worker!.postMessage(request);
    });
  }

  dispose() {
    this.worker?.terminate();
    this.pending.clear();
    this.cache.clear();
  }
}

/**
 * Construct a {@link LayoutService} backed by a real Web Worker. Falls back to a synchronous
 * service when called in an environment without `Worker` (e.g. SSR / tests).
 */
export function createDefaultLayoutService(): LayoutService {
  if (typeof Worker === "undefined") {
    return new LayoutService();
  }
  // Vite resolves the worker URL at build time via this constructor pattern.
  const worker = new Worker(new URL("./layoutWorker.ts", import.meta.url), {
    type: "module",
  });
  return new LayoutService({ worker });
}
