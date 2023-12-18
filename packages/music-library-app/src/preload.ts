// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { magenta } from "ansis";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

import { createScopedLogger } from "./common/logUtils";
import { ContextBridgeApi } from "./contextBridgeApi";

const log = createScopedLogger("contextBridge", magenta);

const contextBridgeApi: ContextBridgeApi = {
    versions: process.versions,
    send: <T>(channel: string, data?: T) => {
        log.debug(`sending '${channel}' event`);
        ipcRenderer.send(channel, data);
    },
    handle: <T>(channel: string, callback: (event: IpcRendererEvent, data?: T) => void) => {
        log.debug(`attaching '${channel}' event handler`);
        return ipcRenderer.on(channel, callback);
    },
    handleOnce: <T>(channel: string, callback: (event: IpcRendererEvent, data?: T) => void) => {
        log.debug(`attaching one-time '${channel}' event handler`);
        return ipcRenderer.once(channel, callback);
    },
    removeHandler: <T>(channel: string, callback: (event: IpcRendererEvent, data?: T) => void) => {
        log.debug(`removing '${channel}' event handler`);
        return ipcRenderer.removeListener(channel, callback);
    },
};

contextBridge.exposeInMainWorld("api", contextBridgeApi);
