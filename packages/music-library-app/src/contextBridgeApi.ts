import { IpcRendererEvent } from "electron";

import { ClientEventChannel, ServerEventChannel } from "./common/events.js";

export interface ContextBridgeApi {
  versions: Record<string, string | undefined>;

  /** Send a client event */
  send: <T = object>(channel: ClientEventChannel, data?: T) => void;

  /** Handle a server event */
  handle: <T = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Handle a server event once, and remove the handler after it's called once */
  handleOnce: <T = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Remove a server event handler */
  removeHandler: <T = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Wait for a server event with a given timeout and event payload */
  waitForResponse: <T = object>(
    channel: ServerEventChannel,
    timeoutMs: number,
  ) => Promise<T | undefined>;
}
