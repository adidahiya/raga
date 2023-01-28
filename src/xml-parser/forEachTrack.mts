import { isEqual } from "lodash-es";

import {
    BasicTrackDefinition,
    BasicTrackProperty,
    isBasicTrackDefinition,
    MusicAppTrackProperty,
    SwinsianTrackProperty,
    TrackDefinition,
    TrackProperty,
} from "../tracks.mjs";
import { MusicLibraryXml } from "./xml.mjs";
import { traverse } from "../utils/traverse.mjs";

type TrackDefinitionVisitor = (
    track: BasicTrackDefinition,
    addTrackProperty: (
        property: MusicAppTrackProperty | SwinsianTrackProperty,
        type: "string" | "integer",
        value: any,
    ) => void,
    updateTrackProperty: (property: BasicTrackProperty, value: any) => boolean,
) => void;

/**
 * Iterate through every track definition in the parsed plist XML, calling the given
 * visitor with the computed definition.
 *
 * plist XML files (used by iTunes / Music / Swinsian) set up dictionaries/records with tags
 * rather than attributes, so they're a bit awkward to parse.
 *
 * A track will be defined like this:
 *
 * ```xml
 * <key>38517</key>
 * <dict>
 *   <key>Track ID</key><integer>38517</integer>
 *   <key>Album Artist</key><string>Tim Reaper</string>
 *   <key>Album</key><string>Teletext</string>
 *   <key>Artist</key><string>Tim Reaper</string>
 *   <key>Bit Rate</key><integer>128</integer>
 *   <key>Date Added</key><date>2021-02-26T23:00:18Z</date>
 *   <key>Date Modified</key><date>2022-12-30T22:15:10Z</date>
 *   <key>Location</key><string>file:///Volumes/CZSSD/music/tracks/soulseek/lossless/Tim%20Reaper%20&amp;%20Devnull%20-%20Teletext%20(2021)%20%5BAIFF%5D/02%20-%20Who%↪20Run%20It.aif</string>
 *   <key>Name</key><string>Who Run It</string>
 *   <key>Persistent ID</key><string>38517</string>
 *   <key>Play Count</key><integer>0</integer>
 *   <key>Rating</key><integer>60</integer>
 *   <key>Sample Rate</key><integer>44100</integer>
 *   <key>Size</key><integer>67857872</integer>
 *   <key>Total Time</key><integer>384273</integer>
 *   <key>Track Number</key><integer>2</integer>
 *   <key>Track Type</key><string>File</string>
 *   <key>Volume Adjustment</key><integer>0</integer>
 *   <key>Year</key><integer>2021</integer>
 * </dict>
 * ```
 *
 * which gets parsed into a JS by any standard XML parser as:
 *
 * ```json
 * {
 *   "key": [
 *     { #text": 38517 }
 *   ]
 * },
 * {
 *   "dict": [
 *     {
 *       "key": [
 *         { "#text": "Track ID" }
 *       ]
 *     },
 *     {
 *       "integer": [
 *         { "#text": 38517 }
 *       ]
 *     },
 *     ...
 *   ]
 * }
 * ```
 *
 * To edit any values in a track's dictionary, we must iterate through "dict" arrays two elements at a time
 * so that we keep track of both the key and value.
 */
export function forEachTrackInLibrary(library: MusicLibraryXml, visitor: TrackDefinitionVisitor) {
    for (const [key, value, _path, _parent] of traverse(library)) {
        if (key === "dict") {
            // Note 1: the "#text" bit is specific to how fast-xml-parser parses text inside tags, see:
            // https://github.com/NaturalIntelligence/fast-xml-parser/blob/master/docs/v4/2.XMLparseOptions.md

            // Note 2: skip dicts of that contain just two elements (track ID key-value pair), as these are used in
            // playlist definitions, which we do not currently distinguish from track definitions. They look like this:
            //
            // <key>Playlist Items</key>
            // <array>
            //     <dict>
            //         <key>Track ID</key><integer>34990</integer>
            //     </dict>
            //     <dict>
            //         <key>Track ID</key><integer>34989</integer>
            //     </dict>
            // </array>

            const isTrackDict =
                Array.isArray(value) &&
                value.length > 2 &&
                isEqual(value[0], { key: [{ "#text": "Track ID" }] });

            if (isTrackDict) {
                visitTrackDict(value, visitor);
            }
        }
    }
}

/**
 * Visit a plist track dictionary, gather its properties as "track definition" object,
 * and call the visitor callback with this computed info + callbacks to edit the definition.
 */
function visitTrackDict(trackDict: any[], visitor: TrackDefinitionVisitor) {
    const trackDefinition = generateTrackDefinition(trackDict);

    // exclude any tracks that did not have all expected fields defined (for whatever reason)
    if (!isBasicTrackDefinition(trackDefinition)) {
        return;
    }

    // Note: user is responsible for ensuring this property doesn't exist already, otherwise
    // we will produce a broken track definition with duplicate properties
    const addTrackProperty = (
        propertyToAdd: MusicAppTrackProperty | SwinsianTrackProperty,
        type: "string" | "integer",
        newValue: any,
    ) => {
        trackDict.push({ key: [{ "#text": propertyToAdd }] }, { [type]: [{ "#text": newValue }] });
    };

    // updates the value in-place in the MusicLibrary
    const updateTrackProperty = (propertyToChange: BasicTrackProperty, newValue: any) => {
        // traverse the track dictionary, two elements at a time
        for (let i = 0; i <= trackDict.length - 2; i += 2) {
            const trackPropertyName = trackDict[i].key[0]["#text"] as BasicTrackProperty;
            if (trackPropertyName === propertyToChange) {
                const trackPropertyType = Object.keys(trackDict[i + 1])[0];
                trackDict[i + 1] = {
                    [trackPropertyType]: [{ "#text": newValue }],
                };
                return true;
            }
        }
        return false;
    };

    visitor(trackDefinition, addTrackProperty, updateTrackProperty);
}

/**
 * Iterate through a track dictionary plist and generate a record for it.
 */
function generateTrackDefinition(trackDict: any[]): Partial<TrackDefinition> {
    // traverse the track dictionary, two elements at a time
    const trackDefinition: Partial<TrackDefinition> = {};

    for (let i = 0; i <= trackDict.length - 2; i += 2) {
        const trackPropertyName = trackDict[i].key[0]["#text"] as TrackProperty;
        // value "key" (a.k.a. its type) is the first and only key in the object, for example:
        // { "integer": [ { "#text": 2021 } ] }
        // { "string": [ { "#text": "File" } ] }
        const trackPropertyType = Object.keys(trackDict[i + 1])[0];

        // this will be true for properties like "Purchased", which just have a self-closing <true /> tag
        const valueHasUnpairedTag = typeof trackDict[i + 1][trackPropertyType][0] !== "object";
        // console.log(
        //     `name: ${trackPropertyName}, type: ${trackPropertyType}, hasUnpairdTag: ${valueHasUnpairedTag}`,
        // );
        if (valueHasUnpairedTag) {
            // skip this tag, we don't need it in Swinsian library
            continue;
        }

        const trackPropertyValue = trackDict[i + 1][trackPropertyType][0]["#text"];
        trackDefinition[trackPropertyName] = trackPropertyValue;
    }

    return trackDefinition;
}
