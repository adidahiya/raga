/**
 * Web-compatible API implementation that provides the same interface as the Electron API
 * but works in a standard web browser environment.
 */

import type { ClientEventChannel, ServerEventChannel } from "@adahiya/raga-types";

export interface WebContextBridgeApi {
  platform: "darwin" | "win32" | "linux" | "web";

  // Mock IPC methods
  send: (channel: ClientEventChannel, ...args: unknown[]) => void;
  handleOnce: <T = unknown>(channel: ServerEventChannel, callback: (payload: T) => void) => void;
  waitForResponse: <T = unknown>(
    channel: ServerEventChannel,
    timeoutMs?: number,
  ) => () => Promise<T>;

  // File operations
  getFilePath: (file: File | null | undefined) => string | undefined;
}

class WebApi implements WebContextBridgeApi {
  platform: "darwin" | "win32" | "linux" | "web" = "web";

  private pendingCallbacks = new Map<string, ((payload: unknown) => void)[]>();

  send(channel: ClientEventChannel, ...args: unknown[]): void {
    console.warn(`[WebApi] IPC send called with channel: ${channel}`, args);
    // In a real implementation, this could send requests to a backend API
  }

  handleOnce<T = unknown>(channel: ServerEventChannel, callback: (payload: T) => void): void {
    console.warn(`[WebApi] IPC handleOnce called with channel: ${channel}`);
    const callbacks = this.pendingCallbacks.get(channel) ?? [];
    callbacks.push(callback as (payload: unknown) => void);
    this.pendingCallbacks.set(channel, callbacks);
  }

  waitForResponse<T = unknown>(channel: ServerEventChannel, _timeoutMs = 0): () => Promise<T> {
    console.warn(`[WebApi] IPC waitForResponse called with channel: ${channel}`);
    // Return a function that returns a rejected promise for now - in a real implementation this would wait for backend response
    return () => Promise.reject(new Error(`Web API does not support IPC channel: ${channel}`));
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
if (
  typeof window !== "undefined" &&
  typeof (window as Window & { api: WebContextBridgeApi }).api === "undefined"
) {
  (window as Window & { api: WebContextBridgeApi }).api = webApi;
}
