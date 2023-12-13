import { IpcRendererEvent } from "electron";
import { ClientEventChannel, ServerEventChannel } from "./common/events.js";

export interface ContextBridgeApi {
    versions: Record<string, string | undefined>;
    send: (channel: ClientEventChannel, data?: any) => void;
    handle: (
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: any) => void,
    ) => void;
    handleOnce: (
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: any) => void,
    ) => void;
    removeHandler: (
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: any) => void,
    ) => void;
}
