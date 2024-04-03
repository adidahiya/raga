import { blue, cyan, gray, magenta, red, yellow } from "ansis";

/**
 * Simple wrapper around `console` to add a named prefix to all messages, as well as a color-highlighted
 * identifier of the log level.
 */
export const log = {
  debug: (msg: string) => {
    console.debug(`${magenta.inverse` debug `} ${cyan.dim`[lib]`} ${msg}`);
  },
  info: (msg: string) => {
    console.debug(`${blue.inverse` info  `} ${cyan.dim`[lib]`} ${msg}`);
  },
  warn: (msg: string) => {
    console.debug(`${yellow.inverse` warn  `} ${cyan.dim`[lib]`} ${msg}`);
  },
  error: (msg: string) => {
    console.debug(`${red.inverse` error `} ${cyan.dim`[lib]`} ${msg}`);
  },
  trace: (msg: string) => {
    console.debug(`${gray.inverse` trace `} ${cyan.dim`[lib]`} ${msg}`);
  },
  time: (label: string) => {
    console.time(`${gray.inverse` time  `} ${cyan.dim`[lib]`} ${label}`);
  },
  timeEnd: (label: string) => {
    console.timeEnd(`${gray.inverse` time  `} ${cyan.dim`[lib]`} ${label}`);
  },
};
