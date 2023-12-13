import { App } from "@tinyhttp/app";
import sirv from "sirv";

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";

let audioFilesServer: AudioFilesServer | undefined;

export interface AudioFilesServerOptions {
    audioFilesRootFolder: string;
    onReady?: () => void;
    onError?: (error: Error) => void;
}

export interface AudioFilesServer {
    /** @internal */
    _app: App;
    stop: () => void;
}

export async function startAudioFilesServer(
    options: AudioFilesServerOptions,
): Promise<AudioFilesServer> {
    if (audioFilesServer !== undefined) {
        console.info(`[server] audio files server is already running`);
        options.onReady?.();
        return audioFilesServer;
    }

    console.debug(`[server] starting audio files server at ${options.audioFilesRootFolder}...`);

    const app = new App();
    const staticServerMiddleware = sirv(options.audioFilesRootFolder, { dev: true });
    app.use(staticServerMiddleware).listen(DEFAULT_AUDIO_FILES_SERVER_PORT, () => {
        options.onReady?.();
    });

    audioFilesServer = {
        _app: app,
        stop: () => {
            // TODO: unsure how to implement this, app.close() isn't available like with Express
            audioFilesServer = undefined;
        },
    };
    return audioFilesServer;
}
