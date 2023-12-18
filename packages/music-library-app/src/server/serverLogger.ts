import { gray, green, magentaBright, redBright, yellowBright } from "ansis";

/**
 * Simple wrapper around `console` to add a ansis-highlighted prefix to all messages.
 *
 * Ideally we would be able to use `roarr` on the server too, but its output doesn't seem to be streaming
 * to stdout / stderr correctly 🤷‍♂️
 */
export const log = {
    debug: (msg: string) => {
        console.debug(`${green`[server]`} ${magentaBright.inverse` debug `} ${msg}`);
    },
    info: (msg: string) => {
        console.debug(`${green`[server]`} ${gray.inverse` info `} ${msg}`);
    },
    warn: (msg: string) => {
        console.debug(`${green`[server]`} ${yellowBright.inverse` warn `} ${msg}`);
    },
    error: (msg: string) => {
        console.debug(`${green`[server]`} ${redBright.inverse` error `} ${msg}`);
    },
};
