import { AudioFileType } from "@adahiya/music-library-tools-lib";
import { Tag, TagProps } from "@blueprintjs/core";
import { useMemo } from "react";

import { isSupportedWebAudioFileFormat } from "../../../common/webAudioUtils";

export interface AudioFileTypeTagProps extends TagProps {
    fileType: AudioFileType | undefined;
}

export default function AudioFileTypeTag({ fileType, ...props }: AudioFileTypeTagProps) {
    const isUnsupportedFileFormat = useMemo(
        () => fileType === undefined || !isSupportedWebAudioFileFormat(fileType),
        [fileType],
    );

    return (
        <Tag
            minimal={true}
            fill={true}
            intent={isUnsupportedFileFormat ? "warning" : "none"}
            style={{ textAlign: "center" }}
            {...props}
        >
            {fileType ?? "unknown"}
        </Tag>
    );
}
