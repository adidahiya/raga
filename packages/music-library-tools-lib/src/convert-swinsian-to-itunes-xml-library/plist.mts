import plist from "plist";
import { readFileSync } from "node:fs";
import { collapsePropertiesIntoSingleLine } from "../utils/xmlUtils.mjs";
import { MusicLibraryPlist } from "../models/library.mjs";

export function loadPlistFile(path: string): MusicLibraryPlist {
    console.info(`Loading library at ${path}`);
    console.time(`loadPlistFile`);
    const plistContents = readFileSync(path, { encoding: "utf8" });
    const parsedPlist = plist.parse(plistContents) as plist.PlistObject;
    console.timeEnd(`loadPlistFile`);
    return parsedPlist as unknown as MusicLibraryPlist;
}

export function buildPlistOutput(library: MusicLibraryPlist): string {
    console.time(`buildPlistOutput`);
    let output = plist.build(library as unknown as plist.PlistObject, {
        pretty: true,
        indent: "	",
    });
    output = collapsePropertiesIntoSingleLine(output);
    output = fixDoctype(output);
    console.timeEnd(`buildPlistOutput`);
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
