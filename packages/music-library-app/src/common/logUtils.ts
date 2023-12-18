import { Ansis, blue, gray, magenta, red, yellow } from "ansis";

/**
 * Creates a simple wrapper around `console` to add a named prefix to all messages, as well as a color-highlighted
 * identifier of the log level.
 *
 * Ideally we would be able to use `roarr` on the server too, but its output doesn't seem to be streaming
 * to stdout / stderr correctly 🤷‍♂️
 */
export function createScopedLogger(scope: string, scopeColor: Ansis) {
    // N.B. pad log level identifiers to make them take up a fixed width
    return {
        debug: (msg: string) => {
            console.debug(`${magenta.inverse` debug `} ${scopeColor`[${scope}]`} ${msg}`);
        },
        info: (msg: string) => {
            console.debug(`${blue.inverse` info  `} ${scopeColor`[${scope}]`} ${msg}`);
        },
        warn: (msg: string) => {
            console.debug(`${yellow.inverse` warn  `} ${scopeColor`[${scope}]`} ${msg}`);
        },
        error: (msg: string) => {
            console.debug(`${red.inverse` error `} ${scopeColor`[${scope}]`} ${msg}`);
        },
        trace: (msg: string) => {
            console.debug(`${gray.inverse` trace `} ${scopeColor`[${scope}]`} ${msg}`);
        },
    };
}
