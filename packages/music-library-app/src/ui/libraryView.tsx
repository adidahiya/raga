import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Button, Card, Divider, H5, HTMLTable, NonIdealState } from "@blueprintjs/core";
import { format } from "date-fns";
import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useState } from "react";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY, DEBUG } from "../common/constants";
import type { LoadedSwinsianLibraryEventPayload } from "../events";
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
    return (
        <div>
            <div className={styles.libraryHeader}>
                <H5>Stats</H5>
                <p>Date created: {format(props.library.Date, "Pp")}</p>
                <p># playlists: {props.library.Playlists.length}</p>
            </div>
            <Divider />
            <div className={styles.tableScrollContainer}>
                <HTMLTable
                    className={styles.table}
                    compact={true}
                    interactive={true}
                    striped={true}
                >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th># tracks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.library.Playlists.map((playlist) => (
                            <tr key={playlist["Playlist ID"]}>
                                <td>{playlist.Name}</td>
                                <td>{playlist["Playlist Items"].length}</td>
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
        </div>
    );
}
