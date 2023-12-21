import type { ContextBridgeApi } from "../contextBridgeApi";

declare global {
  interface Window {
    api: ContextBridgeApi;
  }
}
