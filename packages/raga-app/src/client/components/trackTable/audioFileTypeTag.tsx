import type { AudioFileType } from "@adahiya/raga-lib";
import { Badge, type BadgeProps, Tooltip } from "@mantine/core";

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
      label={isReadyForAnalysis ? undefined : "Track will be converted to MP3 before analysis"}
      disabled={isReadyForAnalysis}
      position="top"
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
