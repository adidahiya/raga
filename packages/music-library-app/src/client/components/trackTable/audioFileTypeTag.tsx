import { Tag, TagProps } from "@blueprintjs/core";
import { useMemo } from "react";

import { AudioFileType } from "../../../common/audioFileType";
import { isSupportedWebAudioFileFormat } from "../../audio/webAudioUtils";

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
