import { Ansis, gray, magentaBright, redBright, yellowBright } from "ansis";

/**
 * Creates a simple wrapper around `console` to add a named prefix to all messages, as well as a color-highlighted
 * identifier of the log level.
 *
 * Ideally we would be able to use `roarr` on the server too, but its output doesn't seem to be streaming
 * to stdout / stderr correctly 🤷‍♂️
 */
export function createScopedLogger(scope: string, scopeColor: Ansis) {
    return {
        debug: (msg: string) => {
            console.debug(`${scopeColor`[${scope}]`} ${magentaBright.inverse` debug `} ${msg}`);
        },
        info: (msg: string) => {
            console.debug(`${scopeColor`[${scope}]`} ${gray.inverse` info `} ${msg}`);
        },
        warn: (msg: string) => {
            console.debug(`${scopeColor`[${scope}]`} ${yellowBright.inverse` warn `} ${msg}`);
        },
        error: (msg: string) => {
            console.debug(`${scopeColor`[${scope}]`} ${redBright.inverse` error `} ${msg}`);
        },
    };
}
