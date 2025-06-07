import { AudioFilesServerRoutes as Routes } from "@adahiya/raga-types";
import { call, type Operation } from "effection";

export default function* pingRequest(
  serverBaseURL: string,
  init?: RequestInit,
): Operation<Response> {
  return yield* call(() => fetch(`${serverBaseURL}${Routes.GET_PING}`, init));
}
