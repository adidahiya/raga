import { AudioFilesServerRoutes as Routes } from "../../../common/api/audioFilesServerAPI";

export default function pingRequest(serverBaseURL: string) {
  return fetch(`${serverBaseURL}${Routes.GET_PING}`);
}
