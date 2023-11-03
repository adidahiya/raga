import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Button, Card, H5, NonIdealState } from "@blueprintjs/core";
import { format } from "date-fns";
import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY, DEBUG } from "../common/constants";
import type { LoadedSwinsianLibraryEventPayload } from "../events";

import PlaylistTable from "./playlistTable";
import TrackTable from "./trackTable";
import ResizeHandle from "./resizeHandle";
import { useAppStore } from "./store";

import styles from "./libraryView.module.scss";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

type LibraryState = "none" | "loading" | "loaded" | "error";

export default function LibraryView() {
    const [libraryState, setLibraryState] = useState<LibraryState>("none");
    const { libraryPlist, setLibraryPlist } = useAppStore();

    const loadLibrary = useCallback(() => {
        window.api.send("loadSwinsianLibrary");
        setLibraryState("loading");
    }, []);

    useEffect(() => {
        if (AUTO_LOAD_LIBRARY) {
            loadLibrary();
        }

        window.api.handle(
            "loadedSwinsianLibrary",
            (event: IpcRendererEvent, data: LoadedSwinsianLibraryEventPayload) => {
                if (DEBUG) {
                    console.log("[renderer] got loaded library", event, data);
                }

                if (data.library != null) {
                    setLibraryState("loaded");
                    setLibraryPlist(data.library);
                }
            },
        );
    }, []);

    const loadLibraryButton = (
        <Button
            className={styles.loadLibraryButton}
            text={`${libraryState === "none" ? "Load" : "Reload"} Swinsian library`}
            onClick={loadLibrary}
        />
    );

    return (
        <Card className={styles.container}>
            {libraryState === "none" ? (
                <NonIdealState title="No library loaded" icon="music" action={loadLibraryButton} />
            ) : libraryState === "loading" ? (
                <NonIdealState title="Loading library..." icon="refresh" />
            ) : libraryState === "error" ? (
                <NonIdealState title="Error loading library" icon="error" />
            ) : (
                <div className={styles.libraryLoaded}>
                    {loadLibraryButton}
                    <Library library={libraryPlist!} />
                </div>
            )}
        </Card>
    );
}

function Library(props: { library: MusicLibraryPlist }) {
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const headerRef = useRef<HTMLDivElement>(null);
    const { selectedPlaylistId } = useAppStore();

    useEffect(() => {
        if (headerRef.current != null) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
    }, []);

    const masterPlaylist = getMasterPlaylist(props.library);

    return (
        <div>
            <div className={styles.libraryHeader} ref={headerRef}>
                <H5>Stats</H5>
                <p>Date created: {format(props.library.Date, "Pp")}</p>
                {masterPlaylist && (
                    <p># tracks: {formatStatNumber(masterPlaylist["Playlist Items"].length)}</p>
                )}
                <p># playlists: {formatStatNumber(props.library.Playlists.length)}</p>
            </div>
            <PanelGroup direction="horizontal">
                <Panel defaultSize={20} minSize={20}>
                    <PlaylistTable headerHeight={headerHeight} library={props.library} />
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
                        <TrackTable playlistId={selectedPlaylistId} />
                    )}
                </Panel>
            </PanelGroup>
        </div>
    );
}
LibraryView.displayName = "LibraryView";

function getMasterPlaylist(library: MusicLibraryPlist) {
    return library.Playlists.find((playlist) => playlist.Master);
}

function formatStatNumber(n: number) {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
    }).format(n);
}
