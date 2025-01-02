import { call, type Operation } from "effection";

export interface LoadAudioBufferOptions {
  /**
   * The URL of an audio file, either as a file URL (e.g. `file:///path/to/file.mp3`) or
   * a web resource URL (e.g. `http://localhost:3000/file.mp3`).
   */
  fileOrResourceURL: string;
  serverPort: number;
  serverRootFolder: string;
  signal?: AbortSignal;
}

export function* loadAudioBuffer(options: LoadAudioBufferOptions): Operation<AudioBuffer> {
  const fileUrl = getAudioFileURL(options);
  // see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#loading_the_sample
  const response = yield* call(() => fetch(fileUrl, { signal: options.signal }));
  const arrayBuffer = yield* call(() => response.arrayBuffer());
  const audioBuffer = yield* call(() => new AudioContext().decodeAudioData(arrayBuffer));
  return audioBuffer;
}

export function getAudioFileURL({
  fileOrResourceURL,
  serverPort,
  serverRootFolder,
}: LoadAudioBufferOptions): string {
  if (fileOrResourceURL.startsWith("file://")) {
    // serverRootFolder is expected to have a trailing slash
    return fileOrResourceURL.replace(
      `file://${serverRootFolder}`,
      `http://localhost:${serverPort.toString()}/`,
    );
  }
  return fileOrResourceURL;
}
