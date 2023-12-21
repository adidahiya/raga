import { MusicLibraryPlist } from "..";
import { buildPlistOutput } from "../utils/plistUtils";
import { reEncodeHtmlEntities } from "../utils/xmlUtils";

export default function serializeLibraryPlist(plist: MusicLibraryPlist): string {
  const outputPlist = buildPlistOutput(plist);
  return reEncodeHtmlEntities(outputPlist);
}
