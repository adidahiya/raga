import { AUDIO_FEATURE_CACHE_VERSION, type TrackAudioFeatures } from "@adahiya/raga-types";
import { run } from "effection";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AnalyzerWorkerRequest, AnalyzerWorkerResponse } from "./analyzerWorker";
import { extractTrackFeatures } from "./features";

function makeMonoSineAudioBuffer(opts: {
  freq: number;
  durationSec: number;
  sampleRate: number;
}): AudioBuffer {
  const { freq, durationSec, sampleRate } = opts;
  const length = Math.floor(durationSec * sampleRate);
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate)) * 0.5;
  }
  return {
    sampleRate,
    length,
    numberOfChannels: 1,
    duration: length / sampleRate,
    getChannelData: () => data,
  } as unknown as AudioBuffer;
}

/**
 * Replica of the private `mixdown` helper duplicated by both `audio/features.ts` and
 * `audio/analyzerWorkerClient.ts`. The worker side only sees the post-mixdown samples, so the
 * equivalence test has to perform the same downsample to feed both code paths identically.
 */
function mixdown(audioBuffer: AudioBuffer): Float32Array {
  const channels: Float32Array[] = [];
  for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }
  const length = channels[0].length;
  const targetRate = 22_050;
  const decim = Math.max(1, Math.floor(audioBuffer.sampleRate / targetRate));
  const out = new Float32Array(Math.floor(length / decim));
  for (let i = 0, j = 0; j < out.length; i += decim, j++) {
    let sum = 0;
    for (const ch of channels) sum += ch[i];
    out[j] = sum / channels.length;
  }
  return out;
}

interface FakeWorkerScope {
  onmessage: ((event: MessageEvent<AnalyzerWorkerRequest>) => void) | undefined;
  postMessage: (msg: AnalyzerWorkerResponse) => void;
}

describe("analyzerWorker", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("produces the same TrackAudioFeatures as extractTrackFeatures for a synthetic signal", async () => {
    const audioBuffer = makeMonoSineAudioBuffer({
      freq: 261.63,
      durationSec: 1.5,
      sampleRate: 44_100,
    });

    // Reference path: the existing audio/features.ts implementation that the worker was
    // copied from. With knownBpm provided neither path triggers the BPM analyzer, so the
    // remaining math (chromagram, key, energy, brightness, dynamics, vector) is exactly
    // what we want to lock in.
    const reference = await run(() =>
      extractTrackFeatures(audioBuffer, { knownBpm: 120 }),
    );

    // Worker path: stub `self` (referenced at module scope by analyzerWorker.ts) and then
    // dynamically import the worker so its `self.onmessage = ...` registration runs against
    // our fake scope. Posting a request through that handler exercises the same code that
    // would run inside a real DedicatedWorkerGlobalScope.
    const responses: AnalyzerWorkerResponse[] = [];
    const fakeSelf: FakeWorkerScope = {
      onmessage: undefined,
      postMessage: (msg) => responses.push(msg),
    };
    vi.stubGlobal("self", fakeSelf);
    await import("./analyzerWorker");
    expect(typeof fakeSelf.onmessage).toBe("function");

    const samples = mixdown(audioBuffer);
    fakeSelf.onmessage!({
      data: {
        id: 42,
        samples,
        sampleRate: audioBuffer.sampleRate,
        bpm: 120,
      },
    } as MessageEvent<AnalyzerWorkerRequest>);

    expect(responses).toHaveLength(1);
    const resp = responses[0];
    expect(resp.ok).toBe(true);
    expect(resp.id).toBe(42);
    if (!resp.ok) throw new Error("expected success response");

    expect(resp.features.bpm).toBe(reference.bpm);
    expect(resp.features.key).toBe(reference.key);
    expect(resp.features.energy).toBeCloseTo(reference.energy, 10);
    expect(resp.features.vector).toEqual(reference.vector);
    expect(resp.features.version).toBe(AUDIO_FEATURE_CACHE_VERSION);
  });

  it("posts a structured failure response when the worker math throws", async () => {
    const responses: AnalyzerWorkerResponse[] = [];
    const fakeSelf: FakeWorkerScope = {
      onmessage: undefined,
      postMessage: (msg) => responses.push(msg),
    };
    vi.stubGlobal("self", fakeSelf);
    await import("./analyzerWorker");

    // Passing a non-Float32Array `samples` makes computeRMS throw, which is the kind of
    // failure mode a refactor could introduce silently if there were no failure-path test.
    fakeSelf.onmessage!({
      data: {
        id: 7,
        samples: undefined as unknown as Float32Array,
        sampleRate: 44_100,
        bpm: 120,
      },
    } as MessageEvent<AnalyzerWorkerRequest>);

    expect(responses).toHaveLength(1);
    const resp = responses[0];
    expect(resp.id).toBe(7);
    expect(resp.ok).toBe(false);
    if (resp.ok) throw new Error("expected failure response");
    expect(typeof resp.error).toBe("string");
    expect(resp.error.length).toBeGreaterThan(0);
  });
});

describe("analyzerWorkerClient cancel path", () => {
  let workerInstances: MockWorker[] = [];

  class MockWorker {
    onmessage: ((event: MessageEvent<AnalyzerWorkerResponse>) => void) | null = null;
    onerror: ((event: ErrorEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent<unknown>) => void) | null = null;
    terminated = false;
    posted: { msg: AnalyzerWorkerRequest; transfer?: Transferable[] }[] = [];

    constructor(
      public url: URL | string,
      public opts?: WorkerOptions,
    ) {
      workerInstances.push(this);
    }

    postMessage(msg: AnalyzerWorkerRequest, transfer?: Transferable[]) {
      this.posted.push({ msg, transfer });
    }

    terminate() {
      this.terminated = true;
    }
  }

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    workerInstances = [];
    vi.stubGlobal("Worker", MockWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Yield enough microtasks for Effection to step through `useAbortSignal` + `call(...)`
  // until the worker is created and the message is posted.
  async function flushMicrotasks(times = 10): Promise<void> {
    for (let i = 0; i < times; i++) await Promise.resolve();
  }

  it("terminates the worker, rejects pending jobs, and leaves no leftover handlers", async () => {
    const { extractTrackFeaturesViaWorker, cancelInFlightAnalyzerJob } = await import(
      "./analyzerWorkerClient"
    );

    const audioBuffer = makeMonoSineAudioBuffer({
      freq: 440,
      durationSec: 0.2,
      sampleRate: 44_100,
    });

    // Spy on AbortSignal listeners to verify the per-job abort listener registered by
    // runWorkerJob is removed when the cancel path runs (i.e. cleanup() fires through the
    // pending job's reject callback).
    const addSpy = vi.spyOn(AbortSignal.prototype, "addEventListener");
    const removeSpy = vi.spyOn(AbortSignal.prototype, "removeEventListener");

    const task = run(() => extractTrackFeaturesViaWorker({ audioBuffer, knownBpm: 120 }));

    await flushMicrotasks();

    expect(workerInstances).toHaveLength(1);
    const worker = workerInstances[0];
    expect(worker.posted).toHaveLength(1);
    expect(worker.posted[0].msg.bpm).toBe(120);
    expect(worker.terminated).toBe(false);

    const abortAddCount = addSpy.mock.calls.filter((c) => c[0] === "abort").length;
    expect(abortAddCount).toBeGreaterThanOrEqual(1);

    cancelInFlightAnalyzerJob();

    expect(worker.terminated).toBe(true);
    await expect(task).rejects.toThrow(/cancelled/i);

    // The abort listener registered for this job must have been removed by cleanup().
    const abortRemoveCount = removeSpy.mock.calls.filter((c) => c[0] === "abort").length;
    expect(abortRemoveCount).toBeGreaterThanOrEqual(abortAddCount);

    // A second cancel is a no-op: pending was cleared and the worker handle was dropped.
    expect(() => {
      cancelInFlightAnalyzerJob();
    }).not.toThrow();
    expect(workerInstances).toHaveLength(1);

    // Issuing a fresh job after cancel must spin up a brand-new worker, proving the
    // singleton was actually released rather than re-using the terminated one.
    const task2 = run(() =>
      extractTrackFeaturesViaWorker({ audioBuffer, knownBpm: 120 }),
    );
    await flushMicrotasks();
    expect(workerInstances).toHaveLength(2);
    const worker2 = workerInstances[1];
    expect(worker2).not.toBe(worker);
    expect(worker2.terminated).toBe(false);
    expect(worker2.posted).toHaveLength(1);

    // Resolve the second job so the test's Effection task settles cleanly.
    const features: TrackAudioFeatures = {
      bpm: 120,
      key: "8B",
      energy: 0.5,
      vector: [0, 0, 0, 0, 0, 0, 0, 0],
      version: AUDIO_FEATURE_CACHE_VERSION,
      extractedAt: Date.now(),
    };
    worker2.onmessage!({
      data: { id: worker2.posted[0].msg.id, ok: true, features },
    } as MessageEvent<AnalyzerWorkerResponse>);
    await expect(task2).resolves.toMatchObject({ key: "8B", bpm: 120 });
  });
});
