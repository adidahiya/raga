// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// N.B. we must take care to not use any Node.js APIs or libraries in this file

import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import { ClientEventChannel, ServerEventChannel } from "./common/events";
import { type ContextBridgeApi } from "./contextBridgeApi";

const contextBridgeApi: ContextBridgeApi = {
  versions: process.versions,

  isReady: false,

  queue: [],

  send: <T extends object>(channel: ClientEventChannel, data?: T) => {
    if (contextBridgeApi.isReady) {
      console.debug(`[contextBridge] sending '${channel}' event`);
      ipcRenderer.send(channel, data);
    } else {
      console.debug(`[contextBridge] queueing '${channel}' event`);
      contextBridgeApi.queue.push([channel, data]);
      // in case we have reloaded the page, send a ping to the server to make sure it's still listening
      ipcRenderer.send(ClientEventChannel.APP_SERVER_PING);
    }
  },

  handle: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    console.debug(`[contextBridge] attaching '${channel}' event handler`);
    return ipcRenderer.on(channel, callback);
  },

  handleOnce: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    console.debug(`[contextBridge] attaching one-time '${channel}' event handler`);
    return ipcRenderer.once(channel, callback);
  },

  waitForResponse: <T extends object>(channel: ServerEventChannel, timeoutMs?: number) => {
    console.debug(`[contextBridge] waiting for '${channel}' event with timeout ${timeoutMs}ms`);
    return new Promise<T | undefined>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`timed out waiting for ${channel} response`));
      }, timeoutMs);
      contextBridgeApi.handleOnce<T>(channel, (_event, data) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
  },

  removeHandler: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    console.debug(`[contextBridge] removing '${channel}' event handler`);
    return ipcRenderer.removeListener(channel, callback);
  },
};

contextBridgeApi.handleOnce(ServerEventChannel.APP_SERVER_READY, () => {
  console.debug("[contextBridge] app server ready");
  contextBridgeApi.isReady = true;
  contextBridgeApi.queue.forEach(([channel, data]) => {
    console.debug(`[contextBridge] sending queued '${channel}' event`);
    ipcRenderer.send(channel, data);
  });
  contextBridgeApi.queue = [];
});

contextBridge.exposeInMainWorld("api", contextBridgeApi);
