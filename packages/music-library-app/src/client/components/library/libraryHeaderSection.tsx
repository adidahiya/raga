import { Props, Section } from "@blueprintjs/core";

import LibraryIOActions from "./libraryIOActions";
import LibraryLastModifiedText from "./libraryLastModifiedText";

export type LibraryHeaderSectionProps = Props;

export default function LibraryHeaderSection(props: LibraryHeaderSectionProps) {
    return (
        <Section
            className={props.className}
            compact={true}
            title="Library"
            subtitle={<LibraryLastModifiedText />}
            rightElement={<LibraryIOActions />}
        />
    );
}
