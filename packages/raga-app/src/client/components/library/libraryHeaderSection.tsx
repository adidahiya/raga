import { type Props, Section } from "@blueprintjs/core";

import { AudioPlayerControls } from "../audioPlayer/audioPlayerControls";
import { AudioPlayerNowPlaying } from "../audioPlayer/audioPlayerNowPlaying";

export type LibraryHeaderSectionProps = Props;

export default function LibraryHeaderSection(props: LibraryHeaderSectionProps) {
  return (
    <Section
      className={props.className}
      compact={true}
      title={<AudioPlayerNowPlaying />}
      rightElement={<AudioPlayerControls />}
    />
  );
}
