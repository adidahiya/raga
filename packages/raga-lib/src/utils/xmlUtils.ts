import { decodeEntity } from "html-entities";

// primarily for aesthetics, this shouldn't affect functionality
/**
 * Purely for aesthetic/stylistic purposes; this change doesn't affect functionality of the script.

 * Without this transform, property lists will be output with keys & values on two lines instead of one,
 * which wastes a lot of vertical space when you are trying to debug XML files.
 */
export function collapsePropertiesIntoSingleLine(xmlString: string): string {
  // only inline simple types, not dicts or arrays
  return xmlString.replace(/(<\/key>)\n(\t| )+<(string|integer|date|true\/?|false\/?)>/g, "$1<$3>");
}

/**
 * Music.app/iTunes XML libraries seem to encode HTML entities in a slightly non-standard way...
 * we've reimplemented that encoding here, for consistency (this may not affect functionality).
 */
export function reEncodeHtmlEntities(xmlString: string): string {
  return xmlString.replace(/(&\w*;)/g, (entity) => {
    if (entity === "&apos;") {
      // special case: just use a regular apostrophe
      return "'";
    }
    const charCode = decodeEntity(entity).charCodeAt(0);
    return `&#${charCode};`;
  });
}
