// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { ClientEventChannel, ServerEventChannel } from "@adahiya/raga-types";
import { blueBright } from "ansis";
import { contextBridge, ipcRenderer, type IpcRendererEvent, webUtils } from "electron";
import { platform } from "os";

import { createScopedLogger } from "./common/logUtils";
import { type ContextBridgeApi } from "./contextBridgeApi";

const log = createScopedLogger("contextBridge", blueBright);
const contextBridgeApi: ContextBridgeApi = {
  platform: platform(),

  versions: process.versions,

  isReady: false,

  queue: [],

  send: <T extends object>(channel: ClientEventChannel, data?: T) => {
    if (contextBridgeApi.isReady) {
      log.debug(`sending '${channel}' event`);
      ipcRenderer.send(channel, data);
    } else {
      log.debug(`queueing '${channel}' event`);
      contextBridgeApi.queue.push([channel, data]);
      // in case we have reloaded the page, send a ping to the server to make sure it's still listening
      ipcRenderer.send(ClientEventChannel.APP_SERVER_PING);
    }
  },

  handle: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    log.debug(`attaching '${channel}' event handler`);
    return ipcRenderer.on(channel, callback);
  },

  handleOnce: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    log.debug(`attaching one-time '${channel}' event handler`);
    return ipcRenderer.once(channel, callback);
  },

  waitForResponse:
    <T extends object>(channel: ServerEventChannel, timeoutMs = 0) =>
    () => {
      log.debug(`waiting for '${channel}' event with timeout ${timeoutMs.toString()}ms`);
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
    log.debug(`removing '${channel}' event handler`);
    return ipcRenderer.removeListener(channel, callback);
  },

  getFilePath: (file: File) => {
    // Electron previously used to add a `path` property automatically to File objects in the client
    // but it no longer does so, so we need to expose a function to do it.
    // See https://www.electronjs.org/docs/latest/api/web-utils
    return webUtils.getPathForFile(file);
  },
};

contextBridgeApi.handleOnce(ServerEventChannel.APP_SERVER_READY, () => {
  log.debug("app server ready");
  contextBridgeApi.isReady = true;
  contextBridgeApi.queue.forEach(([channel, data]) => {
    log.debug(`sending queued '${channel}' event`);
    ipcRenderer.send(channel, data);
  });
  contextBridgeApi.queue = [];
});

contextBridge.exposeInMainWorld("api", contextBridgeApi);
