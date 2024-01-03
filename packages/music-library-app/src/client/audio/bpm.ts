import { call, type Operation } from "effection";
import { analyze } from "web-audio-beat-detector";

export function* analyzeBPM(audioBuffer: AudioBuffer): Operation<number> {
  return yield* call(analyze(audioBuffer));
}
