/**
 * Web-compatible API implementation that provides the same interface as the Electron API
 * but works in a standard web browser environment.
 */

import type { ClientEventChannel } from "./common/events/clientEvents";
import type { ServerEventChannel } from "./common/events/serverEvents";

export interface WebContextBridgeApi {
  platform: "darwin" | "win32" | "linux" | "web";

  // Mock IPC methods
  send: (channel: ClientEventChannel, ...args: unknown[]) => void;
  handleOnce: <T = unknown>(channel: ServerEventChannel, callback: (payload: T) => void) => void;
  waitForResponse: <T = unknown>(channel: ServerEventChannel) => Promise<T>;

  // File operations
  getFilePath: (file: File | null | undefined) => string | undefined;
}

class WebApi implements WebContextBridgeApi {
  platform: "darwin" | "win32" | "linux" | "web" = "web";

  private pendingCallbacks = new Map<string, ((payload: unknown) => void)[]>();

  constructor() {
    // Detect actual platform if possible
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac")) {
      this.platform = "darwin";
    } else if (userAgent.includes("win")) {
      this.platform = "win32";
    } else if (userAgent.includes("linux")) {
      this.platform = "linux";
    }
  }

  send(channel: ClientEventChannel, ...args: unknown[]): void {
    console.warn(`[WebApi] IPC send called with channel: ${String(channel)}`, args);
    // In a real implementation, this could send requests to a backend API
  }

  handleOnce<T = unknown>(channel: ServerEventChannel, callback: (payload: T) => void): void {
    console.warn(`[WebApi] IPC handleOnce called with channel: ${String(channel)}`);
    const channelKey = String(channel);
    const callbacks = this.pendingCallbacks.get(channelKey) ?? [];
    callbacks.push(callback as (payload: unknown) => void);
    this.pendingCallbacks.set(channelKey, callbacks);
  }

  async waitForResponse<T = unknown>(channel: ServerEventChannel): Promise<T> {
    console.warn(`[WebApi] IPC waitForResponse called with channel: ${String(channel)}`);
    // Return a rejected promise for now - in a real implementation this would wait for backend response
    return Promise.reject(new Error(`Web API does not support IPC channel: ${String(channel)}`));
  }

  getFilePath(file: File | null | undefined): string | undefined {
    if (!file) return undefined;
    // In web environment, we can only get the file name, not the full path
    return file.name;
  }
}

// Create and export the web API instance
export const webApi = new WebApi();

// Install it on the window object for compatibility
if (typeof window !== "undefined") {
  (window as Window & { api: WebContextBridgeApi }).api = webApi;
}
