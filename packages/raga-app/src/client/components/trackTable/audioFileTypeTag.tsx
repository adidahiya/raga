import type { AudioFileType } from "@adahiya/raga-lib";
import { Tooltip } from "@blueprintjs/core";
import { Badge, type BadgeProps } from "@mantine/core";

export interface AudioFileTypeTagProps extends BadgeProps {
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
      <Badge
        size="sm"
        radius="sm"
        fullWidth={true}
        color={isReadyForAnalysis ? undefined : "yellow"}
        variant="light"
        {...props}
      >
        {fileType ?? "unknown"}
      </Badge>
    </Tooltip>
  );
}
