// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, IpcRendererEvent, MessagePortMain } from "electron";
import { ContextBridgeApi } from "./contextBridgeApi";
import { DEBUG } from "./common/constants";

const contextBridgeApi: ContextBridgeApi = {
    versions: process.versions,
    send: (channel: string, data?: any) => {
        if (DEBUG) {
            console.info("[contextBridge] sending event", channel, data);
        }
        return ipcRenderer.send(channel, data);
    },
    handle: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        if (DEBUG) {
            console.info("[contextBridge] attaching event handler", channel, callback);
        }
        return ipcRenderer.on(channel, callback);
    },
    handleOnce: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        if (DEBUG) {
            console.info("[contextBridge] attaching one-time event handler", channel, callback);
        }
        return ipcRenderer.once(channel, callback);
    },
    removeHandler: (channel: string, callback: (event: IpcRendererEvent, data?: any) => void) => {
        if (DEBUG) {
            console.info("[contextBridge] removing event handler", channel, callback);
        }
        return ipcRenderer.removeListener(channel, callback);
    },
};

contextBridge.exposeInMainWorld("api", contextBridgeApi);
