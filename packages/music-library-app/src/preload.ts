// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { blueBright } from "ansis";
import { action, suspend } from "effection";
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import { withTimeout } from "./common/asyncUtils";
import { ClientErrors } from "./common/errorMessages";
import { type ClientEventChannel, ServerEventChannel } from "./common/events";
import { createScopedLogger } from "./common/logUtils";
import { type ContextBridgeApi } from "./contextBridgeApi";

const log = createScopedLogger("contextBridge", blueBright);
const contextBridgeApi: ContextBridgeApi = {
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

  waitForResponse: <T extends object>(channel: ServerEventChannel, timeoutMs: number) =>
    withTimeout(
      action<T | undefined>(function* (resolve) {
        contextBridgeApi.handleOnce<T>(channel, (_event, data) => {
          resolve(data);
        });
        log.debug(`waiting for '${channel}' event with timeout ${timeoutMs}ms`);
        yield* suspend();
      }),
      timeoutMs,
      ClientErrors.contextBridgeResponseTimeout(channel),
    ),

  removeHandler: <T extends object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => {
    log.debug(`removing '${channel}' event handler`);
    return ipcRenderer.removeListener(channel, callback);
  },
};

contextBridgeApi.handle(ServerEventChannel.APP_SERVER_READY, () => {
  log.debug("app server ready");
  contextBridgeApi.isReady = true;
  contextBridgeApi.queue.forEach(([channel, data]) => {
    log.debug(`sending queued '${channel}' event`);
    ipcRenderer.send(channel, data);
  });
  contextBridgeApi.queue = [];
});

contextBridge.exposeInMainWorld("api", contextBridgeApi);
