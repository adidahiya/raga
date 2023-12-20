import { Card, NonIdealState, ProgressBar } from "@blueprintjs/core";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { useEffectOnce } from "usehooks-ts";

import { formatStatNumber } from "../common/format";
import type { ContextBridgeApi } from "../contextBridgeApi";
import { AudioPlayer } from "./components/audioPlayer/audioPlayer";
import LoadLibraryForm from "./components/library/loadLibraryForm";
import LibraryHeaderSection from "./components/libraryHeaderSection";
import TrackTable from "./components/trackTable/trackTable";
import styles from "./libraryView.module.scss";
import PlaylistTable from "./playlistTable";
import ResizeHandle from "./resizeHandle";
import { appStore } from "./store/appStore";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

export default function LibraryView() {
    const libraryInputFilepath = appStore.use.libraryInputFilepath();
    const libraryState = appStore.use.libraryLoadingState();
    const loadLibrary = appStore.use.loadSwinsianLibrary();

    useEffect(() => {
        if (libraryInputFilepath !== undefined) {
            void loadLibrary({ filepath: libraryInputFilepath });
        }
    }, [libraryInputFilepath, loadLibrary]);

    return (
        <Card className={styles.container}>
            {libraryState === "none" ? (
                <NonIdealState
                    title="Select a Swinsian library"
                    icon="music"
                    action={<LoadLibraryForm />}
                />
            ) : libraryState === "loading" ? (
                <NonIdealState
                    title="Loading Swinsian library..."
                    icon="music"
                    action={<ProgressBar intent="primary" />}
                />
            ) : libraryState === "error" ? (
                <NonIdealState title="Error loading Swinsian library" icon="error" />
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

    useEffectOnce(() => {
        if (headerRef.current != null) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
    });

    return (
        <div className={classNames("flex-column", styles.library)}>
            <div className={styles.libraryHeader} ref={headerRef}>
                <LibraryHeaderSection className={styles.libraryHeaderSection} />
            </div>
            <div className={styles.audioPlayer}>
                <AudioPlayer />
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
