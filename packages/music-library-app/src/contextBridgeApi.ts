import { IpcRendererEvent } from "electron";
import { ClientEventChannel, ServerEventChannel } from "./events.js";

export interface ContextBridgeApi {
    versions: Record<string, string | undefined>;
    send: (channel: ClientEventChannel, data?: any) => void;
    handle: (
        channel: ServerEventChannel,
        callback: (event: IpcRendererEvent, data?: any) => void,
    ) => void;
}
