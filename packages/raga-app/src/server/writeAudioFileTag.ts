import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  File as TaglibFile,
  Id3v2FrameClassType,
  Id3v2PopularimeterFrame,
  type Id3v2Tag,
  TagTypes,
} from "node-taglib-sharp";
import { isString } from "radash";

import { DEFAULT_ID3_TAG_USER_EMAIL } from "../common/constants";
import { ClientErrors } from "../common/errorMessages";
import { type WriteAudioFileTagOptions } from "../common/events";

/** @throws if unsuccessful */
export function writeAudioFileTag({
  fileLocation,
  tagName,
  userEmail,
  value,
}: WriteAudioFileTagOptions) {
  const filepath = fileLocation.includes("file://") ? fileURLToPath(fileLocation) : fileLocation;

  if (!existsSync(filepath)) {
    throw new Error(ClientErrors.libraryWriteTagFailedFileNotFound(filepath));
  }

  const file = TaglibFile.createFromPath(filepath);
  const numericValue = isString(value) ? parseInt(value, 10) : value;

  switch (tagName) {
    case "BPM":
      file.tag.beatsPerMinute = numericValue ?? 0;
      break;
    case "Rating":
      writeRatingTag(file, numericValue ?? 0, userEmail);
      break;
    case "Title":
      if (!isString(value)) {
        throw new Error(`Invalid value for '${tagName}' tag: ${value?.toString() ?? "undefined"}`);
      }
      file.tag.title = value;
      break;
    case "Album":
      if (!isString(value)) {
        throw new Error(`Invalid value for '${tagName}' tag: ${value?.toString() ?? "undefined"}`);
      }
      file.tag.album = value;
      break;
    case "Artist":
      if (!isString(value)) {
        throw new Error(`Invalid value for '${tagName}' tag: ${value?.toString() ?? "undefined"}`);
      }
      file.tag.performers = [value];
      break;
    case "Genre":
      if (!isString(value)) {
        throw new Error(`Invalid value for '${tagName}' tag: ${value?.toString() ?? "undefined"}`);
      }
      file.tag.genres = value.split(",").map((genre) => genre.trim());
      break;
  }

  file.save();
  file.dispose();
}

/**
 * Ratings are stored as "popularimeter" frames, which are not exposed via the standardized
 * `Tag` API from TagLib#, so we need to write to the frame directly, see
 * https://github.com/benrr101/node-taglib-sharp/issues/61#issuecomment-1236182761
 */
function writeRatingTag(
  file: TaglibFile,
  ratingOutOf100: number,
  userEmail = DEFAULT_ID3_TAG_USER_EMAIL,
) {
  const id3v2Tag = file.getTag(TagTypes.Id3v2, true) as Id3v2Tag;

  let popularimeterFrame = id3v2Tag
    .getFramesByClassType<Id3v2PopularimeterFrame>(Id3v2FrameClassType.PopularimeterFrame)
    .shift();

  if (popularimeterFrame === undefined) {
    // ID3v2 Spec says it should be an email
    const newFrame = Id3v2PopularimeterFrame.fromUser(userEmail);
    id3v2Tag.addFrame(newFrame);
    popularimeterFrame = newFrame;
  }

  // byte value between 0 and 255
  popularimeterFrame.rating = convertRatingOutOf100ToByteValue(ratingOutOf100);
}

/**
 * Given a rating out of 100, convert it to a safe, positive, 8-bit integer (up to 255).
 */
function convertRatingOutOf100ToByteValue(ratingOutOf100: number): number {
  return Math.ceil((ratingOutOf100 / 100) * 255);
}
