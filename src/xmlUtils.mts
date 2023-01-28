import { decodeEntity } from "html-entities";

// HACKHACK
export function replaceUnpairedTagsWithSelfClosingTags(xmlString: string): string {
    return xmlString.replace(/<(true|false)>/g, "<$1/>");
}

// primarily for aesthetics, this shouldn't affect functionality
export function collapsePropertiesIntoSingleLine(xmlString: string): string {
    // only inline simple types, not dicts or arrays
    return xmlString.replace(
        /(<\/key>)\n(\t| )+<(string|integer|date|true\/?|false\/?)>/g,
        "$1<$3>",
    );
}

// HACKHACK: also primarily for aesthetics, just to match Music.app library XML
export function reEncodeHtmlEntities(xmlString: string): string {
    return xmlString.replace(/(&\w*;)/g, (entity) => {
        if (entity === "&apos;") {
            // special case: just use a regular apostrophe
            return "'";
        }
        const charCode = decodeEntity(entity).charCodeAt(0);
        return `&#${charCode};`;
        // return encode(decodedEntity, { mode: "nonAscii", level: "xml", numeric: "hexadecimal" });
    });
}
