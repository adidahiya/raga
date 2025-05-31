import type { WebContextBridgeApi } from "./webApi";

declare global {
  interface Window {
    api: WebContextBridgeApi;
  }
}
