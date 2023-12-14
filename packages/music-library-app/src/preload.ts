// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

import { ContextBridgeApi } from "./contextBridgeApi";

const contextBridgeApi: ContextBridgeApi = {
    versions: process.versions,
    send: (channel: string, data?: object) => {
        console.debug(`[contextBridge] sending '${channel}' event`);
        ipcRenderer.send(channel, data);
    },
    handle: (channel: string, callback: (event: IpcRendererEvent, data?: object) => void) => {
        console.debug(`[contextBridge] attaching '${channel}' event handler`);
        return ipcRenderer.on(channel, callback);
    },
    handleOnce: (channel: string, callback: (event: IpcRendererEvent, data?: object) => void) => {
        console.debug(`[contextBridge] attaching one-time '${channel}' event handler`);
        return ipcRenderer.once(channel, callback);
    },
    removeHandler: (
        channel: string,
        callback: (event: IpcRendererEvent, data?: object) => void,
    ) => {
        console.debug(`[contextBridge] removing '${channel}' event handler`);
        return ipcRenderer.removeListener(channel, callback);
    },
};

contextBridge.exposeInMainWorld("api", contextBridgeApi);
