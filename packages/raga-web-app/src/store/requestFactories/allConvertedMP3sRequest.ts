import { AudioFilesServerRoutes as Routes } from "@adahiya/raga-lib";
import { call, type Operation } from "effection";

export default function* getAllConvertedMP3sRequest(serverBaseURL: string): Operation<Response> {
  return yield* call(() => fetch(`${serverBaseURL}${Routes.GET_ALL_CONVERTED_MP3S}`));
}
