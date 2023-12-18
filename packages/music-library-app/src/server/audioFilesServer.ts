import { existsSync, readdirSync } from "node:fs";

import { App } from "@tinyhttp/app";
import sirv from "sirv";

import { DEFAULT_AUDIO_FILES_SERVER_PORT } from "../common/constants";
import { log } from "./serverLogger";

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
    return new Promise((resolve, _reject) => {
        try {
            if (audioFilesServer !== undefined) {
                log.info(`audio files server is already running`);
                options.onReady?.();
                resolve(audioFilesServer);
                return;
            }

            const rootFolderExists =
                existsSync(options.audioFilesRootFolder) &&
                readdirSync(options.audioFilesRootFolder).length > 0;

            if (!rootFolderExists) {
                throw new Error(
                    `[server] audio files root folder ${options.audioFilesRootFolder} does not exist or is empty`,
                );
            }

            log.debug(`starting audio files server at ${options.audioFilesRootFolder}...`);

            const app = new App();
            const staticServerMiddleware = sirv(options.audioFilesRootFolder, { dev: true });

            audioFilesServer = {
                _app: app,
                stop: () => {
                    // TODO: unsure how to implement this, app.close() isn't available like with Express
                    audioFilesServer = undefined;
                },
            };

            app.use(staticServerMiddleware).listen(DEFAULT_AUDIO_FILES_SERVER_PORT, () => {
                options.onReady?.();
                if (audioFilesServer === undefined) {
                    throw new Error(
                        "[server] Unknown error occured attempting to start audio files server",
                    );
                } else {
                    resolve(audioFilesServer);
                }
            });
        } catch (e) {
            const err = e as Error;
            options.onError?.(err);
        }
    });
}
