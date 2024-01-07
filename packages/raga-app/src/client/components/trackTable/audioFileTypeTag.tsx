import type { AudioFileType } from "../../../../../raga-lib/lib";
import { Tag, type TagProps, Tooltip } from "@blueprintjs/core";

export interface AudioFileTypeTagProps extends TagProps {
  isReadyForAnalysis: boolean;
  fileType: AudioFileType | undefined;
}

export default function AudioFileTypeTag({
  fileType,
  isReadyForAnalysis,
  ...props
}: AudioFileTypeTagProps) {
  return (
    <Tooltip
      compact={true}
      content={isReadyForAnalysis ? undefined : "Track will be converted to MP3 before analysis"}
      fill={true}
      hoverOpenDelay={500}
    >
      <Tag
        fill={true}
        intent={isReadyForAnalysis ? "none" : "warning"}
        minimal={true}
        style={{ textAlign: "center" }}
        {...props}
      >
        {fileType ?? "unknown"}
      </Tag>
    </Tooltip>
  );
}
