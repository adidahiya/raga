import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Card, NonIdealState } from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY } from "../common/constants";

import PlaylistTable from "./playlistTable";
import TrackTable from "./trackTable";
import ResizeHandle from "./resizeHandle";
import { appStore } from "./store/appStore";
import LibraryOptions from "./library/libraryOptions";

import styles from "./libraryView.module.scss";
import LibraryStats from "./library/libraryStats";
import LibraryActions from "./library/libraryActions";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

export default function LibraryView() {
    const libraryState = appStore.use.libraryLoadingState();
    const libraryPlist = appStore.use.libraryPlist();
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    useEffect(() => {
        if (AUTO_LOAD_LIBRARY) {
            loadLibrary();
        }
    }, []);

    return (
        <Card className={styles.container}>
            {libraryState === "none" ? (
                <NonIdealState title="No library loaded" icon="music" />
            ) : libraryState === "loading" ? (
                <NonIdealState title="Loading library..." icon="refresh" />
            ) : libraryState === "error" ? (
                <NonIdealState title="Error loading library" icon="error" />
            ) : (
                <div className={styles.libraryLoaded}>
                    <Library library={libraryPlist!} />
                </div>
            )}
        </Card>
    );
}

interface LibraryProps {
    library: MusicLibraryPlist;
}

function Library(props: LibraryProps) {
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const headerRef = useRef<HTMLDivElement>(null);
    const selectedPlaylistId = appStore.use.selectedPlaylistId();

    useEffect(() => {
        if (headerRef.current != null) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
    }, []);

    return (
        <div className={classNames("flex-column", styles.library)}>
            <div className={styles.libraryHeader} ref={headerRef}>
                <LibraryStats className={styles.statsSection} />
                <LibraryOptions className={styles.libraryOptions} />
                <LibraryActions className={styles.libraryActions} />
            </div>
            <PanelGroup direction="horizontal">
                <Panel defaultSizePercentage={20} minSizePercentage={20}>
                    <PlaylistTable headerHeight={headerHeight} library={props.library} />
                </Panel>
                <ResizeHandle />
                <Panel minSizePercentage={30}>
                    {selectedPlaylistId === undefined ? (
                        <NonIdealState
                            title="Playlist tracks"
                            description="Select a playlist to view tracks"
                            icon="list-detail-view"
                        />
                    ) : (
                        <TrackTable headerHeight={headerHeight} playlistId={selectedPlaylistId} />
                    )}
                </Panel>
            </PanelGroup>
        </div>
    );
}
LibraryView.displayName = "LibraryView";
