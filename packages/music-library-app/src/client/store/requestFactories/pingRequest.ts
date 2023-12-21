import { AudioFilesServerRoutes as Routes } from "../../../common/audioFilesServerRoutes";

export default function pingRequest(serverBaseURL: string) {
  return fetch(`${serverBaseURL}${Routes.GET_PING}`);
}
