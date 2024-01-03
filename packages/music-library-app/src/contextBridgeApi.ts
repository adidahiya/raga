import type { Operation } from "effection";
import type { IpcRendererEvent } from "electron";

import type { ClientEventChannel, ServerEventChannel } from "./common/events";

export interface ContextBridgeApi {
  versions: Record<string, string | undefined>;

  /**
   * Whether the server is ready to receive events via the context bridge.
   * Events sent before this is toggled to `true` will be queued.
   */
  isReady: boolean;

  /** Queue of client events to send after the server reports that it is ready */
  queue: [ClientEventChannel, object | undefined][];

  /** Send a client event */
  send: <T extends object = object>(channel: ClientEventChannel, data?: T) => void;

  /** Handle a server event */
  handle: <T extends object = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Handle a server event once, and remove the handler after it's called once */
  handleOnce: <T extends object = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Remove a server event handler */
  removeHandler: <T extends object = object>(
    channel: ServerEventChannel,
    callback: (event: IpcRendererEvent, data?: T) => void,
  ) => void;

  /** Wait for a server event with an optional timeout and event payload */
  waitForResponse: <T extends object = object>(
    channel: ServerEventChannel,
    timeoutMs?: number,
  ) => Operation<T | undefined>;
}
