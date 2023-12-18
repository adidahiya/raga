import {
    Button,
    ButtonGroup,
    Classes,
    Menu,
    MenuItem,
    Popover,
    Props,
    Section,
    SectionCard,
} from "@blueprintjs/core";
import classNames from "classnames";

import { useVoidCallback } from "../common/hooks";
import { appStore } from "../store/appStore";
import { AnalyzerSettings } from "./components/analyzerSettings";
import { AudioFilesServerForm } from "./components/audioFilesServerForm";
import { LibraryLastModifiedText } from "./components/libraryLastModifiedText";
import { WriteModifiedLibraryButton } from "./components/writeModifiedLibraryButton";

export type LibraryHeaderSectionProps = Props;

export default function LibraryHeaderSection(props: LibraryHeaderSectionProps) {
    const library = appStore.use.library();
    const libraryFilepath = appStore.use.libraryFilepath();
    const skeltonClasses = classNames({ [Classes.SKELETON]: !library });

    return (
        <Section
            className={props.className}
            compact={true}
            title="Library"
            subtitle={<LibraryLastModifiedText />}
            rightElement={<LibraryIOActions />}
        >
            <SectionCard>
                <span className={skeltonClasses}>Location: {libraryFilepath}</span>
            </SectionCard>
            <SectionCard>
                <AudioFilesServerForm />
            </SectionCard>
            <SectionCard>
                <AnalyzerSettings />
            </SectionCard>
        </Section>
    );
}

function LibraryIOActions() {
    const isLibraryLoaded = appStore.use.libraryLoadingState() !== "none";
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    const handleLoad = useVoidCallback(loadLibrary);
    const handleLoadFromDisk = useVoidCallback(() => loadLibrary({ reloadFromDisk: true }));

    const menu = (
        <Menu>
            <MenuItem
                text={`${isLibraryLoaded ? "Reload" : "Load"} library`}
                onClick={handleLoad}
            />
            <MenuItem text="Reload from disk" onClick={handleLoadFromDisk} />
        </Menu>
    );

    return (
        <ButtonGroup>
            <WriteModifiedLibraryButton />
            <Popover minimal={true} content={menu} placement="bottom-end">
                <Button outlined={true} icon="caret-down" />
            </Popover>
        </ButtonGroup>
    );
}
