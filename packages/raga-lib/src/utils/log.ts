import { blue, cyan, gray, magenta, red, yellow } from "ansis";

/**
 * Simple wrapper around `console` to add a named prefix to all messages, as well as a color-highlighted
 * identifier of the log level.
 */
export const log = {
  debug: (msg: string) => {
    console.debug(`${magenta.inverse` debug `} ${cyan.faint`[lib]`} ${msg}`);
  },
  info: (msg: string) => {
    console.debug(`${blue.inverse` info  `} ${cyan.faint`[lib]`} ${msg}`);
  },
  warn: (msg: string) => {
    console.debug(`${yellow.inverse` warn  `} ${cyan.faint`[lib]`} ${msg}`);
  },
  error: (msg: string) => {
    console.debug(`${red.inverse` error `} ${cyan.faint`[lib]`} ${msg}`);
  },
  trace: (msg: string) => {
    console.debug(`${gray.inverse` trace `} ${cyan.faint`[lib]`} ${msg}`);
  },
  time: (label: string) => {
    console.time(`${gray.inverse` time  `} ${cyan.faint`[lib]`} ${label}`);
  },
  timeEnd: (label: string) => {
    console.timeEnd(`${gray.inverse` time  `} ${cyan.faint`[lib]`} ${label}`);
  },
};
