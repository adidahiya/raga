import { call, type Operation } from "effection";

import { AudioFilesServerRoutes as Routes } from "../../common/api/audioFilesServerAPI";

export default function* pingRequest(
  serverBaseURL: string,
  init?: RequestInit,
): Operation<Response> {
  return yield* call(() => fetch(`${serverBaseURL}${Routes.GET_PING}`, init));
}
