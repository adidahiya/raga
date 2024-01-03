// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { blueBright } from "ansis";
import { action, suspend } from "effection";
import { contextBridge, ipcRenderer, type IpcRendererEvent } from "electron";

import { withTimeout } from "./common/asyncUtils";
import { ClientErrors } from "./common/errorMessages";
import { ClientEventChannel, ServerEventChannel } from "./common/events";
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

  /**
   * WARNING: this does not work as expected; presumably it needs to be called inside an effection
   * `main()` call stack, but I can't figure out the right syntax for that at the moment.
   */
  waitForResponse: <T extends object>(channel: ServerEventChannel, timeoutMs: number) =>
    withTimeout(
      action<T | undefined>(function* (resolve) {
        const handler = (_event: IpcRendererEvent, data: T | undefined) => {
          resolve(data);
        };

        try {
          contextBridgeApi.handleOnce<T>(channel, handler);
          log.debug(`waiting for '${channel}' event with timeout ${timeoutMs}ms`);
          yield* suspend();
        } finally {
          contextBridgeApi.removeHandler(channel, handler);
        }
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
