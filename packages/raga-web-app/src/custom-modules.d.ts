/// <reference types="vite/client" />

declare module "*.module.scss" {
  const classes: Record<string, string>;
  export default classes;
}

interface Window {
  ROARR: {
    write: (message: string) => void;
  };
}

declare const globalThis: {
  ROARR: {
    write: (message: string) => void;
  };
} & typeof global;
