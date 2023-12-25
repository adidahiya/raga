import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { File as TaglibFile, Tag, TagTypes } from "node-taglib-sharp";
import { isString } from "radash";

import { ClientErrors } from "../common/errorMessages";
import { type WriteAudioFileTagOptions } from "../common/events";
import { log } from "./serverLogger";

/** @throws if unsuccessful */
export function writeAudioFileTag({ fileLocation, tagName, value }: WriteAudioFileTagOptions) {
  const filepath = fileLocation.includes("file://") ? fileURLToPath(fileLocation) : fileLocation;

  if (!existsSync(filepath)) {
    throw new Error(ClientErrors.libraryWriteTagFailedFileNotFound(filepath));
  }

  const file = TaglibFile.createFromPath(filepath);

  if (!hasId3v2Tag(file)) {
    log.warn(
      `Audio file ${filepath} does not have an ID3v2 tag, attempting to write '${tagName}' tag anyway`,
    );
  }

  switch (tagName) {
    case "BPM":
      file.tag.beatsPerMinute = isString(value) ? parseInt(value, 10) : value;
      break;
  }
  file.save();
  file.dispose();
}

function hasId3v2Tag(file: TaglibFile) {
  return Tag.tagTypeFlagsToArray(file.tagTypes).includes(TagTypes.Id3v2);
}
