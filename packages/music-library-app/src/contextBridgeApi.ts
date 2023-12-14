import { IpcRendererEvent } from "electron";
import { ClientEventChannel, ServerEventChannel } from "./common/events.js";

export interface ContextBridgeApi {
    versions: Record<string, string | undefined>;
    send: <T = object>(channel: ClientEventChannel, data?: T) => void;
    handle: <T = object>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => void;
    handleOnce: <T = object>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => void;
    removeHandler: <T = object>(
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: T) => void,
    ) => void;
}
