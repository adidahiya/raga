/// <reference lib="webworker" />
import { layout,type LayoutInput, type LayoutResult } from "./strategies";

export interface LayoutWorkerRequest {
  requestId: string;
  input: LayoutInput;
}

export interface LayoutWorkerResponse {
  requestId: string;
  result: LayoutResult;
}

export interface LayoutWorkerErrorResponse {
  requestId: string;
  error: string;
}

self.addEventListener("message", (event: MessageEvent<LayoutWorkerRequest>) => {
  const { requestId, input } = event.data;
  try {
    const result = layout(input);
    const response: LayoutWorkerResponse = { requestId, result };
    (self as unknown as Worker).postMessage(response);
  } catch (e) {
    const response: LayoutWorkerErrorResponse = {
      requestId,
      error: e instanceof Error ? e.message : String(e),
    };
    (self as unknown as Worker).postMessage(response);
  }
});
