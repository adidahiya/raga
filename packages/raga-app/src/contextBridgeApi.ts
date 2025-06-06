import type { ClientEventChannel, ServerEventChannel } from "@adahiya/raga-types";
import type { IpcRendererEvent } from "electron";

/**
 * N.B. Effection generators were tricky to get working in the preload script, so this API uses
 * Promises for async operations.
 */
export interface ContextBridgeApi {
  /** OS platform */
  platform: NodeJS.Platform;

  /** Node.js process version info */
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

  /** Returns a function which waits for a server event with an optional timeout and event payload */
  waitForResponse: <T extends object = object>(
    channel: ServerEventChannel,
    timeoutMs?: number,
  ) => () => Promise<T | undefined>;

  /** Get the full path for a File object */
  getFilePath: (file: File) => string;
}
