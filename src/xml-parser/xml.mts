import dedent from "dedent";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { readFileSync } from "node:fs";

/** JSON representation of XML library as parsed by fast-xml-parser */
export type MusicLibraryXml = Record<any, any>;

const commonXmlParserOptions = {
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    preserveOrder: true,
    unpairedTags: ["true", "false"],
};

export function loadXmlFile(path: string): MusicLibraryXml {
    console.info(`Loading library at ${path}`);
    console.time(`loadXmlFile`);
    const inputXml = readFileSync(path, { encoding: "utf8" });
    const parser = new XMLParser({
        ...commonXmlParserOptions,
    });
    const parsedXml = parser.parse(inputXml);
    console.timeEnd(`loadXmlFile`);
    return parsedXml;
}

export function buildXmlOutput(library: MusicLibraryXml): string {
    console.time(`buildXml`);
    const builder = new XMLBuilder({
        ...commonXmlParserOptions,
        format: true,
        indentBy: "	",
    });
    console.timeEnd(`buildXml`);
    return builder.build(library);
}

// HACKHACK: fast-xml-parser skips the doctype declaration, and apparently rekordbox needs it, so we need to inject it
export function injectDoctypeIntoXmlString(xmlString: string): string {
    return xmlString.replace(
        `<?xml version="1.0" encoding="UTF-8"?>`,
        dedent`
        <?xml version="1.0" encoding="UTF-8"?>
        <!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">`,
    );
}
