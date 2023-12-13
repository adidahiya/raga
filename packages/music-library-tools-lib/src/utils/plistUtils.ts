import plist from "plist";
import { readFileSync } from "node:fs";
import { collapsePropertiesIntoSingleLine } from "./xmlUtils.js";

export function loadPlistFile(path: string): plist.PlistObject {
    console.info(`[lib] Loading library at ${path}`);
    console.time(`[lib] loadPlistFile`);
    const plistContents = readFileSync(path, { encoding: "utf8" });
    const parsedPlist = plist.parse(plistContents) as plist.PlistObject;
    console.timeEnd(`[lib] loadPlistFile`);
    return parsedPlist;
}

export function buildPlistOutput(library: object): string {
    console.time(`[lib] buildPlistOutput`);
    let output = plist.build(library as plist.PlistObject, {
        pretty: true,
        indent: "	",
    });
    output = collapsePropertiesIntoSingleLine(output);
    output = fixDoctype(output);
    console.timeEnd(`[lib] buildPlistOutput`);
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
