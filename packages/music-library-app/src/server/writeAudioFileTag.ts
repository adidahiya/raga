import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  File as TaglibFile,
  Id3v2FrameClassType,
  type Id3v2PopularimeterFrame,
  type Id3v2Tag,
  TagTypes,
} from "node-taglib-sharp";
import { isString } from "radash";

import { ClientErrors } from "../common/errorMessages";
import { type WriteAudioFileTagOptions } from "../common/events";

/** @throws if unsuccessful */
export function writeAudioFileTag({ fileLocation, tagName, value }: WriteAudioFileTagOptions) {
  const filepath = fileLocation.includes("file://") ? fileURLToPath(fileLocation) : fileLocation;

  if (!existsSync(filepath)) {
    throw new Error(ClientErrors.libraryWriteTagFailedFileNotFound(filepath));
  }

  const file = TaglibFile.createFromPath(filepath);
  const id3v2Tag = file.getTag(TagTypes.Id3v2, true) as Id3v2Tag;
  const numericValue = isString(value) ? parseInt(value, 10) : value;

  switch (tagName) {
    case "BPM":
      file.tag.beatsPerMinute = numericValue;
      break;
    case "Rating":
      // ratings are stored as "popularimeter" frames, which are not exposed via the standardized
      // `Tag` API from TagLib#, so we need to write to the frame directly, see
      // https://github.com/benrr101/node-taglib-sharp/issues/61#issuecomment-1236182761
      // eslint-disable-next-line no-case-declarations
      const popularimeterFrames = id3v2Tag.getFramesByClassType<Id3v2PopularimeterFrame>(
        Id3v2FrameClassType.PopularimeterFrame,
      );
      // ID3v2 Spec says it should be an email
      popularimeterFrames[0].user = "abc@123.com";
      // byte value between 0 and 255
      popularimeterFrames[0].rating = convertRatingOutOf100ToByteValue(numericValue);
  }

  file.save();
  file.dispose();
}

/**
 * Given a rating out of 100, convert it to a safe, positive, 8-bit integer (up to 255).
 */
function convertRatingOutOf100ToByteValue(ratingOutOf100: number): number {
  return Math.ceil((ratingOutOf100 / 100) * 255);
}
