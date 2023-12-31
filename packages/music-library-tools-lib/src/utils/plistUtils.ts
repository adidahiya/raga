import { readFileSync } from "node:fs";

import { build, parse, type PlistObject } from "plist";

import { log } from "../utils/log.js";
import { collapsePropertiesIntoSingleLine } from "./xmlUtils.js";

export function loadPlistFile(path: string): PlistObject {
  log.info(`Loading library at ${path}`);
  log.time(`loadPlistFile`);
  const plistContents = readFileSync(path, { encoding: "utf8" });
  const parsedPlist = parse(plistContents) as PlistObject;
  log.timeEnd(`loadPlistFile`);
  return parsedPlist;
}

export function buildPlistOutput(library: object): string {
  log.time(`buildPlistOutput`);
  let output = build(library as PlistObject, {
    pretty: true,
    indent: "	",
  });
  output = collapsePropertiesIntoSingleLine(output);
  output = fixDoctype(output);
  log.timeEnd(`buildPlistOutput`);
  return output;
}

/**
 * The 'plist' library doesn't parse the doctype string, it just injects its own which happens
 * to be slightly different from the one used by Music.app/iTunes. Rekordbox is not happy about
 * that doctype, so we need to go in there and edit it to match its expectations.
 */
function fixDoctype(xmlString: string): string {
  return xmlString.replace("//Apple//DTD PLIST", "//Apple Computer//DTD PLIST");
}
