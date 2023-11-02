import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Button, Card, Divider, H5, NonIdealState } from "@blueprintjs/core";
import { format } from "date-fns";
import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY, DEBUG } from "../common/constants";
import type { LoadedSwinsianLibraryEventPayload } from "../events";

import PlaylistTable from "./playlistTable";
import styles from "./libraryView.module.scss";

declare global {
    interface Window {
        api: ContextBridgeApi;
    }
}

type LibraryState = "none" | "loading" | "loaded" | "error";

export default function () {
    const [libraryState, setLibraryState] = useState<LibraryState>("none");
    const [library, setLibrary] = useState<MusicLibraryPlist | undefined>(undefined);

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
                    setLibrary(data.library);
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
                    <Library library={library!} />
                </div>
            )}
        </Card>
    );
}

function Library(props: { library: MusicLibraryPlist }) {
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const headerRef = useRef<HTMLDivElement>(null);

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
            <PlaylistTable headerHeight={headerHeight} library={props.library} />
        </div>
    );
}

function getMasterPlaylist(library: MusicLibraryPlist) {
    return library.Playlists.find((playlist) => playlist.Master);
}

function formatStatNumber(n: number) {
    return new Intl.NumberFormat("en-US", {
        style: "decimal",
    }).format(n);
}
