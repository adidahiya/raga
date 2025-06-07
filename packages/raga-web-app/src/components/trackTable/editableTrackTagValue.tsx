import type { SupportedTagName, TrackDefinition } from "@adahiya/raga-types";
import { useCallback, useMemo } from "react";

import { appStore } from "../../store/appStore";
import EditableOnHover from "../common/editableOnHover";
import styles from "./editableTrackTagValue.module.scss";

interface EditableTrackTagValueProps {
  /** @default true */
  editable?: boolean;
  /** @default undefined */
  placeholder?: string;
  /** Which tag name this value corresponds to */
  tagName: SupportedTagName;
  /** Track definition */
  trackDef: TrackDefinition;
}

const EditableTrackTagValue: React.FC<EditableTrackTagValueProps> = ({
  editable = true,
  placeholder,
  tagName,
  trackDef,
}) => {
  const writeAudioFileTag = appStore.use.writeAudioFileTag();

  const handleChangeOperation = useCallback(
    (newBPM: string | number | undefined) => writeAudioFileTag(trackDef, tagName, newBPM),
    [tagName, trackDef, writeAudioFileTag],
  );

  const value = useMemo(() => {
    switch (tagName) {
      case "Title":
        return trackDef.Name;
      default:
        return trackDef[tagName];
    }
  }, [tagName, trackDef]);

  return (
    <div className={styles.editableTrackTagValue}>
      {editable ? (
        <EditableOnHover
          textAlign={tagName === "BPM" ? "right" : "left"}
          value={value}
          onChangeOperation={handleChangeOperation}
          placeholder={placeholder}
          showGradient={tagName === "BPM" ? false : true}
        />
      ) : (
        value
      )}
    </div>
  );
};

export default EditableTrackTagValue;
