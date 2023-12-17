import type { RoarrGlobalState } from "roarr";

declare global {
    // eslint-disable-next-line no-var
    var ROARR: RoarrGlobalState;

    type PartialRecord<K extends string, T> = {
        [P in K]?: T;
    };
}
