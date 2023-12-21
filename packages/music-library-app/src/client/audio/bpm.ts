import { analyze } from "web-audio-beat-detector";

export async function analyzeBPM(audioBuffer: AudioBuffer) {
  return analyze(audioBuffer);
}
