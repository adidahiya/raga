import { type MusicLibraryPlist } from "../models/library.js";
import { buildPlistOutput } from "../utils/plistUtils.js";
import { reEncodeHtmlEntities } from "../utils/xmlUtils.js";

export default function serializeLibraryPlist(plist: MusicLibraryPlist): string {
  const outputPlist = buildPlistOutput(plist);
  return reEncodeHtmlEntities(outputPlist);
}
