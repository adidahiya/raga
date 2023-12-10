import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Button, ButtonGroup, Card, NonIdealState } from "@blueprintjs/core";
import classNames from "classnames";
import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY, DEBUG } from "../common/constants";
import type { LoadedSwinsianLibraryEventPayload } from "../events";

import PlaylistTable from "./playlistTable";
import TrackTable from "./trackTable";
import ResizeHandle from "./resizeHandle";
import { appStore } from "./store/appStore";
import LibraryOptions from "./library/libraryOptions";

import styles from "./libraryView.module.scss";
import LibraryStats from "./library/libraryStats";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

type LibraryState = "none" | "loading" | "loaded" | "error";

export default function LibraryView() {
    const [libraryState, setLibraryState] = useState<LibraryState>("none");
    const libraryPlist = appStore.use.libraryPlist();
    const setLibraryPlist = appStore.use.setLibraryPlist();
    const setLibraryFilepath = appStore.use.setLibraryFilepath();

    const loadLibrary = useCallback(() => {
        window.api.send("loadSwinsianLibrary");
        setLibraryState("loading");
    }, []);

    const loadLibraryFromDisk = useCallback(() => {
        window.api.send("loadSwinsianLibrary", { reloadFromDisk: true });
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
                    setLibraryFilepath(data.filepath);
                }
            },
        );
    }, []);

    const loadLibraryButton = (
        <LoadLibraryButton libraryState={libraryState} loadLibrary={loadLibrary} />
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
                    <Library
                        library={libraryPlist!}
                        loadLibrary={loadLibrary}
                        loadLibraryFromDisk={loadLibraryFromDisk}
                    />
                </div>
            )}
        </Card>
    );
}

interface LibraryProps {
    library: MusicLibraryPlist;
    loadLibrary: () => void;
    loadLibraryFromDisk: () => void;
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
                <div className={styles.libraryActions}>
                    <ButtonGroup>
                        <LoadLibraryButton libraryState="loaded" loadLibrary={props.loadLibrary} />
                        <Button text="Reload from disk" onClick={props.loadLibraryFromDisk} />
                    </ButtonGroup>
                </div>
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

function LoadLibraryButton(props: { libraryState: LibraryState; loadLibrary: () => void }) {
    return (
        <Button
            text={`${props.libraryState === "none" ? "Load" : "Reload"} library`}
            onClick={props.loadLibrary}
        />
    );
}
