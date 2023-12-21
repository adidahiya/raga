export interface LoadAudioBufferOptions {
  /**
   * The URL of an audio file, either as a file URL (e.g. `file:///path/to/file.mp3`) or
   * a web resource URL (e.g. `http://localhost:3000/file.mp3`).
   */
  fileOrResourceURL: string;
  serverPort: number;
  serverRootFolder: string;
}

export async function loadAudioBuffer(options: LoadAudioBufferOptions): Promise<AudioBuffer> {
  const fileUrl = getAudioFileURL(options);
  // see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#loading_the_sample
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
  return audioBuffer;
}

export function getAudioFileURL({
  fileOrResourceURL,
  serverPort,
  serverRootFolder,
}: LoadAudioBufferOptions): string {
  if (fileOrResourceURL.startsWith("file://")) {
    return fileOrResourceURL.replace(
      `file://${serverRootFolder}`,
      `http://localhost:${serverPort}`,
    );
  }
  return fileOrResourceURL;
}
