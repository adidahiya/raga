import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import {
    AnchorButton,
    Button,
    ButtonGroup,
    Card,
    FormGroup,
    InputGroup,
    NonIdealState,
    Section,
    SectionCard,
    Tooltip,
} from "@blueprintjs/core";
import { format } from "date-fns";
import type { IpcRendererEvent } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelGroup, Panel } from "react-resizable-panels";

import type { ContextBridgeApi } from "../contextBridgeApi";
import { AUTO_LOAD_LIBRARY, DEBUG } from "../common/constants";
import { formatStatNumber } from "../common/format";
import type { LoadedSwinsianLibraryEventPayload } from "../events";

import PlaylistTable from "./playlistTable";
import TrackTable from "./trackTable";
import ResizeHandle from "./resizeHandle";
import { appStore } from "./store/appStore";

import styles from "./libraryView.module.scss";
import classNames from "classnames";

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
    const [libraryFilepath, setLibraryFilepath] = useState<string | undefined>(undefined);

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
                        filepath={libraryFilepath}
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
    filepath: string | undefined;
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

    const masterPlaylist = getMasterPlaylist(props.library);

    return (
        <div className={classNames("flex-column", styles.library)}>
            <div className={styles.libraryHeader} ref={headerRef}>
                <Section className={styles.statsSection} compact={true} title="Stats">
                    <SectionCard>
                        <p>Date created: {format(props.library.Date, "Pp")}</p>
                        {props.filepath && <p>Location: {props.filepath}</p>}
                        {masterPlaylist && (
                            <p>
                                # tracks:{" "}
                                {formatStatNumber(masterPlaylist["Playlist Items"].length)}
                            </p>
                        )}
                    </SectionCard>
                </Section>
                <Section className={styles.libraryOptions} compact={true} title="Options">
                    <SectionCard>
                        <AudioFilesServerForm />
                    </SectionCard>
                </Section>
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

function AudioFilesServerButton() {
    const audioFilesServerState = appStore.use.audioFilesServerState();
    const startAudioFilesServer = appStore.use.startAudioFilesServer();

    return (
        <Tooltip
            placement="top"
            content={
                audioFilesServerState === "started"
                    ? "Restart audio files server"
                    : audioFilesServerState === "failed"
                      ? "Failed to start audio files server"
                      : audioFilesServerState === "stopped"
                        ? "Start audio files server"
                        : "Starting audio files server..."
            }
        >
            <AnchorButton
                minimal={true}
                icon={
                    audioFilesServerState === "started"
                        ? "refresh"
                        : audioFilesServerState === "failed"
                          ? "cross"
                          : "play"
                }
                loading={audioFilesServerState === "starting"}
                onClick={startAudioFilesServer}
            />
        </Tooltip>
    );
}

function AudioFilesServerForm() {
    const audioFilesServerState = appStore.use.audioFilesServerState();
    const audioFilesRootFolder = appStore.use.audioFilesRootFolder();
    const setAudioFilesRootFolder = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        appStore.use.setAudioTracksRootFolder()(event.target.value);
    }, []);

    const label = `Audio files server${
        audioFilesServerState === "started"
            ? ": running"
            : audioFilesServerState === "failed"
              ? ": error"
              : ""
    }`;

    return (
        <FormGroup label={label}>
            <InputGroup
                value={audioFilesRootFolder}
                onChange={setAudioFilesRootFolder}
                intent={
                    audioFilesServerState === "failed"
                        ? "danger"
                        : audioFilesServerState === "started"
                          ? "success"
                          : undefined
                }
                rightElement={<AudioFilesServerButton />}
            />
        </FormGroup>
    );
}

function getMasterPlaylist(library: MusicLibraryPlist) {
    return library.Playlists.find((playlist) => playlist.Master);
}
