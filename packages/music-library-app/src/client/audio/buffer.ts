export interface LoadAudioBufferOptions {
    fileLocation: string;
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
    fileLocation,
    serverPort,
    serverRootFolder,
}: LoadAudioBufferOptions): string {
    return fileLocation.replace(`file://${serverRootFolder}`, `http://localhost:${serverPort}`);
}
