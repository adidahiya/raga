import { useMemo } from "react";
import { useAppStore } from "./store";

import styles from "./trackTable.module.scss";
import { PlaylistDefinition } from "@adahiya/music-library-tools-lib";

export interface TrackTableProps {
    playlistId: string;
}

export default function TrackTable({ playlistId }: TrackTableProps) {
    const { libraryPlist } = useAppStore();

    if (libraryPlist === undefined) {
        // TODO: implement invariant
        return null;
    }

    const playlistsByPersistentId = useMemo<Record<string, PlaylistDefinition>>(
        () =>
            libraryPlist.Playlists.reduce<Record<string, PlaylistDefinition>>((acc, playlist) => {
                acc[playlist["Playlist Persistent ID"]] = playlist;
                return acc;
            }, {}),
        [libraryPlist.Playlists],
    );
    const selectedPlaylist = playlistsByPersistentId[playlistId];

    if (selectedPlaylist === undefined) {
        // TODO: implement invariant
        return null;
    }

    const trackIds = useMemo(
        () => selectedPlaylist["Playlist Items"].map((item) => item["Track ID"]),
        [playlistsByPersistentId, playlistId],
    );
    const trackDefs = Object.fromEntries(
        trackIds.map((trackId) => [trackId, libraryPlist.Tracks[trackId]]),
    );

    return (
        <div className={styles.container}>
            <p>Selected playlist: {selectedPlaylist.Name}</p>
            <p># tracks: {selectedPlaylist["Playlist Items"].length}</p>
        </div>
    );
}
TrackTable.displayName = "TrackTable";
