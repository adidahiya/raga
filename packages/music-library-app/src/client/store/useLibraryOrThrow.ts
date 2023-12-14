import { SwinsianLibraryPlist } from "@adahiya/music-library-tools-lib";
import { appStore } from "./appStore";

export function useLibraryOrThrow(): SwinsianLibraryPlist {
    const library = appStore.use.library();

    if (library === undefined) {
        throw new Error(`[client] Library is not loaded`);
    }

    return library;
}
