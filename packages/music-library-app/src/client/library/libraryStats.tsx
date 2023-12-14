import { MusicLibraryPlist } from "@adahiya/music-library-tools-lib";
import { Classes, Section, SectionCard, Props } from "@blueprintjs/core";
import classNames from "classnames";
import { format, parseISO } from "date-fns";

import { formatStatNumber } from "../../common/format";
import { appStore } from "../store/appStore";

export type LibraryStatsProps = Props;

export default function LibraryStats(props: LibraryStatsProps) {
    const library = appStore.use.library();
    const libraryFilepath = appStore.use.libraryFilepath();
    const dateCreated = getDateCreated(library);
    const masterPlaylist = getMasterPlaylist(library);
    const skeltonClasses = classNames({ [Classes.SKELETON]: !library });

    return (
        <Section className={props.className} compact={true} title="Stats">
            <SectionCard>
                <p className={skeltonClasses}>Date created: {format(dateCreated, "Pp")}</p>
                <p className={skeltonClasses}>Location: {libraryFilepath}</p>
                {masterPlaylist && (
                    <>
                        <p># tracks: {formatStatNumber(masterPlaylist["Playlist Items"].length)}</p>
                    </>
                )}
                {library && (
                    <>
                        <p># playlists: {formatStatNumber(library.Playlists.length)}</p>
                    </>
                )}
            </SectionCard>
        </Section>
    );
}

function getDateCreated(library: MusicLibraryPlist | undefined) {
    if (library === undefined) {
        return new Date();
    }

    if (typeof library.Date === "string") {
        return parseISO(library.Date);
    }

    return library.Date;
}

function getMasterPlaylist(library: MusicLibraryPlist | undefined) {
    return library?.Playlists.find((playlist) => playlist.Master);
}
