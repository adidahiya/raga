import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";

export async function startAudioFilesServer(
    audioFilesRootFolder: string,
): Promise<ChildProcessWithoutNullStreams> {
    return spawn("python3", ["-m", "http.server", "8000"], {
        cwd: audioFilesRootFolder,
    });
}
