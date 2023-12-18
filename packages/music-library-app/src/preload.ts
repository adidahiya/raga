// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { blueBright } from "ansis";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

import { ClientEventChannel, ServerEventChannel } from "./common/events";
import { createScopedLogger } from "./common/logUtils";
import { ContextBridgeApi } from "./contextBridgeApi";

const log = createScopedLogger("contextBridge", blueBright);

const contextBridgeApi: ContextBridgeApi = {
    versions: process.versions,

    send: <T>(channel: ClientEventChannel, data?: T) => {
        log.debug(`sending '${channel}' event`);
        ipcRenderer.send(channel, data);
    },

    handle: <T>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => {
        log.debug(`attaching '${channel}' event handler`);
        return ipcRenderer.on(channel, callback);
    },

    handleOnce: <T>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => {
        log.debug(`attaching one-time '${channel}' event handler`);
        return ipcRenderer.once(channel, callback);
    },

    waitForResponse: <T>(channel: ServerEventChannel, timeoutMs: number) => {
        log.debug(`waiting for '${channel}' event with timeout ${timeoutMs}ms`);
        return new Promise<T | undefined>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(`timed out waiting for ${channel} response`);
            }, timeoutMs);
            contextBridgeApi.handleOnce<T>(channel, (_event, data) => {
                clearTimeout(timeout);
                resolve(data);
            });
        });
    },

    removeHandler: <T>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => {
        log.debug(`removing '${channel}' event handler`);
        return ipcRenderer.removeListener(channel, callback);
    },
};

contextBridge.exposeInMainWorld("api", contextBridgeApi);
