import { useEffect, useState } from "react";

export function useWaveSurferModule() {
    const [waveSurferModule, setWaveSurferModule] = useState<typeof import("wavesurfer.js") | null>(
        null,
    );

    useEffect(() => {
        void import("wavesurfer.js").then(setWaveSurferModule);
    }, []);

    return waveSurferModule;
}
