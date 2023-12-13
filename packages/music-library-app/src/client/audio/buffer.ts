const SIMPLE_HTTP_SERVER_ROOT = "/Volumes/CZSSD/music/tracks";
const SIMPLE_HTTP_SERVER_PORT = 8000;

export async function loadAudioBuffer(fileLocation: string): Promise<AudioBuffer> {
    const fileUrl = fileLocationToServerUrl(fileLocation);
    // see https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques#loading_the_sample
    const response = await fetch(fileUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await new AudioContext().decodeAudioData(arrayBuffer);
    return audioBuffer;
}

function fileLocationToServerUrl(fileLocation: string): string {
    return fileLocation.replace(
        `file://${SIMPLE_HTTP_SERVER_ROOT}`,
        `http://localhost:${SIMPLE_HTTP_SERVER_PORT}`,
    );
}
