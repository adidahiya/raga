// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { Roarr as log } from "roarr";

import { ContextBridgeApi } from "./contextBridgeApi";

const contextBridgeApi: ContextBridgeApi = {
    versions: process.versions,
    send: (channel: string, data?: any) => {
        console.debug(`[contextBridge] sending '${channel}' event`);
        return ipcRenderer.send(channel, data);
    },
    handle: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        console.debug(`[contextBridge] attaching '${channel}' event handler`);
        return ipcRenderer.on(channel, callback);
    },
    handleOnce: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        console.debug(`[contextBridge] attaching one-time '${channel}' event handler`);
        return ipcRenderer.once(channel, callback);
    },
    removeHandler: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        console.debug(`[contextBridge] removing '${channel}' event handler`);
        return ipcRenderer.removeListener(channel, callback);
    },
};

contextBridge.exposeInMainWorld("api", contextBridgeApi);
