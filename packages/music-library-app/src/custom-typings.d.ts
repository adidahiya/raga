import type { RoarrGlobalState } from "roarr";

declare module "*.scss" {
    const styles: Record<string, string>;
    export default styles;
}

declare global {
    // eslint-disable-next-line no-var
    var ROARR: RoarrGlobalState;

    type PartialRecord<K extends string, T> = {
        [P in K]?: T;
    };
}
