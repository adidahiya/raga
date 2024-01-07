import type { RoarrGlobalState } from "roarr";

// N.B. this must live in a separate file from `declare module "*.scss"` because of a TypeScript limitation
// see https://github.com/microsoft/TypeScript/issues/28097
declare global {
  // eslint-disable-next-line no-var
  var ROARR: RoarrGlobalState;

  type PartialRecord<K extends string | number, T> = {
    [P in K]?: T;
  };
}
