import type { TrackDefinition } from "@adahiya/raga-lib";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";
import EditableOnHover from "../common/editableOnHover";

interface EditableTrackBPMProps {
  /** @default true */
  editable?: boolean;
  /** Track definition */
  trackDef: TrackDefinition;
}

const EditableTrackBPM: React.FC<EditableTrackBPMProps> = ({ editable = true, trackDef }) => {
  const writeAudioFileTag = appStore.use.writeAudioFileTag();

  const handleChangeOperation = useCallback(
    (newBPM: number | undefined) => writeAudioFileTag(trackDef, "BPM", newBPM),
    [trackDef, writeAudioFileTag],
  );

  return (
    <div>
      {editable ? (
        <EditableOnHover value={trackDef.BPM} onChangeOperation={handleChangeOperation} />
      ) : (
        trackDef.BPM
      )}
    </div>
  );
};

export default EditableTrackBPM;
