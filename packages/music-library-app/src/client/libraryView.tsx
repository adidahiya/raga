import { Card, NonIdealState } from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import { formatStatNumber } from "../common/format";
import type { ContextBridgeApi } from "../contextBridgeApi";
import LibraryHeaderSection from "./library/libraryHeaderSection";
import styles from "./libraryView.module.scss";
import PlaylistTable from "./playlistTable";
import ResizeHandle from "./resizeHandle";
import { appStore } from "./store/appStore";
import TrackTable from "./trackTable";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

export default function LibraryView() {
    const libraryState = appStore.use.libraryLoadingState();
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    // automatically load the library from disk on client startup
    useEffect(() => {
        void loadLibrary();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <Library />
                </div>
            )}
        </Card>
    );
}

function Library() {
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
                <LibraryHeaderSection className={styles.libraryHeaderSection} />
            </div>
            <PanelGroup direction="horizontal">
                <Panel
                    className={classNames("flex-column", styles.librarySidebar)}
                    defaultSize={20}
                    minSize={20}
                >
                    <PlaylistTable headerHeight={headerHeight} />
                    <LibrarySidebarFooter />
                </Panel>
                <ResizeHandle />
                <Panel minSize={30}>
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

function LibrarySidebarFooter() {
    const library = appStore.use.library();
    const masterPlaylist = useMemo(
        () => library?.Playlists.find((playlist) => playlist.Master),
        [library],
    );

    if (masterPlaylist === undefined) {
        return undefined;
    }

    return (
        <div className={styles.librarySidebarFooter}>
            Total # tracks: {formatStatNumber(masterPlaylist["Playlist Items"].length)}
        </div>
    );
}
