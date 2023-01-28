import plist from "plist";
import { readFileSync } from "node:fs";
import { BasicTrackDefinition } from "../tracks.mjs";
import { PlaylistDefinition } from "../playlists.mjs";
import { collapsePropertiesIntoSingleLine } from "../xmlUtils.mjs";

export type SimplePlistValue = string | number | boolean | Date;

// export type MusicLibraryPlist = plist.PlistObject;
export interface MusicLibraryPlist {
    "Application Version": string;
    Date: Date;
    Features: number;
    "Library Persistent ID": string;
    "Major Version": number;
    "Minor Version": number;
    "Music Folder": string;
    Playlists: PlaylistDefinition[];
    "Show Content Ratings": boolean;
    Tracks: Record<number, BasicTrackDefinition>;
}

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
    // HACKHACK: for some reson this un-identation doesn't work
    // output = unIndentOneLevel(output);
    output = collapsePropertiesIntoSingleLine(output);
    output = fixDoctype(output);
    console.timeEnd(`buildPlistOutput`);
    return output;
}

// just for aesthetics, ease of diffing
function unIndentOneLevel(xmlString: string): string {
    return xmlString.replace(/^\t/g, "");
}

// HACKHACK: wtf?
// the 'plist' library generated a different doctype than what's expected by rekordbox/Music.app
function fixDoctype(xmlString: string): string {
    return xmlString.replace("//Apple//DTD PLIST", "//Apple Computer//DTD PLIST");
    // HACKHACK: why does this not work??
    // return xmlString.replace(
    //     /^<\!DOCTYPE.*$/,
    //     `<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">`,
    // );
}
