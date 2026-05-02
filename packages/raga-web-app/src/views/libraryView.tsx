import { Separator } from "@adahiya/raga-design-system";
import { spotlight } from "@mantine/spotlight";
import classNames from "classnames";
import { useCallback, useState } from "react";
import {
  IoAnalyticsOutline,
  IoFolderOpenOutline,
  IoHelpCircleOutline,
  IoLibraryOutline,
  IoList,
  IoSettingsOutline,
} from "react-icons/io5";
import { Panel, PanelGroup } from "react-resizable-panels";

import { formatStatNumber } from "../common/format";
import { AudioPlayer } from "../components/audioPlayer/audioPlayer";
import { AudioPlayerControls } from "../components/audioPlayer/audioPlayerControls";
import { AudioPlayerNowPlaying } from "../components/audioPlayer/audioPlayerNowPlaying";
import { ResizeHandle } from "../components/common";
import EmptyState from "../components/common/emptyState";
import SimpleTooltip from "../components/common/SimpleTooltip";
import AnalyzerPanel from "../components/library/analyzerPanel";
import StatusBar from "../components/library/statusBar";
import PlaylistTable from "../components/playlistTable/playlistTable";
import TrackTable from "../components/trackTable/trackTable";
import { useMasterPlaylist } from "../hooks";
import { appStore } from "../store/appStore";
import styles from "./libraryView.module.scss";

type RailItemKey = "all-tracks" | "playlists" | "analyzer" | "settings" | "help";

export default function LibraryView() {
  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const getSelectedTrackDef = appStore.use.getSelectedTrackDef();
  const selectedTrack = getSelectedTrackDef();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();
  const masterPlaylist = useMasterPlaylist();

  const [activeRailItem, setActiveRailItem] = useState<RailItemKey>("all-tracks");
  const [isPlaylistPanelOpen, setIsPlaylistPanelOpen] = useState(false);

  const handlePlaylistSelect = useCallback(
    (playlistIds: string[]) => {
      if (playlistIds.length === 0) {
        setSelectedPlaylistId(undefined);
      } else {
        setSelectedPlaylistId(playlistIds[0]);
      }
    },
    [setSelectedPlaylistId],
  );

  const masterPlaylistId = masterPlaylist?.["Playlist Persistent ID"];

  const handleRailClick = useCallback(
    (key: RailItemKey) => {
      setActiveRailItem(key);
      if (key === "all-tracks") {
        setIsPlaylistPanelOpen(false);
        if (masterPlaylistId !== undefined) {
          setSelectedPlaylistId(masterPlaylistId);
        }
      } else if (key === "playlists") {
        setIsPlaylistPanelOpen(true);
      } else if (key === "analyzer") {
        // The Analyzer rail item opens a control panel; analysis must be started explicitly.
        setIsPlaylistPanelOpen(false);
      } else if (key === "settings") {
        const trigger = document.querySelector<HTMLButtonElement>(
          "[data-raga-settings-trigger]",
        );
        trigger?.click();
      } else {
        // key === "help"
        spotlight.open();
      }
    },
    [masterPlaylistId, setSelectedPlaylistId],
  );

  return (
    <div className={styles.library}>
      <div className={`${styles.libraryStack} flex flex-col gap-0`}>
        <PanelGroup direction="horizontal">
          <Panel
            id="sidebar"
            order={1}
            defaultSize={isPlaylistPanelOpen ? 22 : 4}
            minSize={isPlaylistPanelOpen ? 18 : 4}
            maxSize={isPlaylistPanelOpen ? 40 : 4}
            className={styles.sidebarPanel}
          >
            <div className={styles.sidebarLayout}>
              <IconRail
                activeItem={activeRailItem}
                onItemClick={handleRailClick}
                isPlaylistPanelOpen={isPlaylistPanelOpen}
              />
              {isPlaylistPanelOpen && (
                <div className={styles.playlistPanel}>
                  <div className={styles.playlistPanelHeader}>
                    <span className="text-caption font-semibold uppercase tracking-label text-text-muted">
                      Playlists
                    </span>
                  </div>
                  <Separator />
                  <PlaylistTable
                    selectionMode="single"
                    onSelect={handlePlaylistSelect}
                    showHeader={false}
                  />
                </div>
              )}
            </div>
          </Panel>
          {isPlaylistPanelOpen && <ResizeHandle />}
          <Panel id="main" order={2} minSize={30}>
            <div className="flex h-full flex-col gap-0">
              <div
                className={`${styles.playerBar} flex items-center justify-between flex-nowrap gap-4 px-3 py-1.5`}
              >
                <div className={styles.playerNowPlaying}>
                  {selectedTrack === undefined ? (
                    <span className="text-caption font-mono uppercase tracking-header text-text-muted">
                      Now playing — none
                    </span>
                  ) : (
                    <AudioPlayerNowPlaying selectedTrack={selectedTrack} />
                  )}
                </div>
                <AudioPlayerControls />
              </div>
              <Separator />
              <AudioPlayer />
              <Separator />
              <div className={styles.tableContainer}>
                {activeRailItem === "analyzer" ? (
                  <AnalyzerPanel selectedPlaylistId={selectedPlaylistId} />
                ) : selectedPlaylistId === undefined ? (
                  <EmptyState
                    className={styles.emptyState}
                    title="Playlist tracks"
                    description="Select a playlist to view tracks"
                    icon={<IoList size={48} />}
                  />
                ) : (
                  <TrackTable playlistId={selectedPlaylistId} />
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
        <StatusBar
          totalTracks={
            masterPlaylist === undefined
              ? undefined
              : formatStatNumber(masterPlaylist["Playlist Items"].length)
          }
        />
      </div>
    </div>
  );
}
LibraryView.displayName = "LibraryView";

interface IconRailProps {
  activeItem: RailItemKey;
  isPlaylistPanelOpen: boolean;
  onItemClick: (key: RailItemKey) => void;
}

interface RailItem {
  key: RailItemKey;
  icon: React.ReactNode;
  label: string;
  hint: string;
  group: "primary" | "secondary";
}

const RAIL_ITEMS: RailItem[] = [
  {
    key: "all-tracks",
    icon: <IoLibraryOutline size={18} />,
    label: "All Tracks",
    hint: "1",
    group: "primary",
  },
  {
    key: "playlists",
    icon: <IoFolderOpenOutline size={18} />,
    label: "Playlists",
    hint: "2",
    group: "primary",
  },
  {
    key: "analyzer",
    icon: <IoAnalyticsOutline size={18} />,
    label: "Analyzer",
    hint: "4",
    group: "primary",
  },
  {
    key: "settings",
    icon: <IoSettingsOutline size={18} />,
    label: "Settings",
    hint: ",",
    group: "secondary",
  },
  {
    key: "help",
    icon: <IoHelpCircleOutline size={18} />,
    label: "Help",
    hint: "?",
    group: "secondary",
  },
];

function IconRail({ activeItem, isPlaylistPanelOpen, onItemClick }: IconRailProps) {
  const renderItem = (item: RailItem) => {
    const isActive =
      activeItem === item.key && (!isPlaylistPanelOpen || item.key === "playlists");
    return (
      <SimpleTooltip key={item.key} label={item.label} side="right" sideOffset={6}>
        <button
          type="button"
          className={classNames(styles.railItem, { [styles.railItemActive]: isActive })}
          onClick={() => {
            onItemClick(item.key);
          }}
        >
          {isActive && <span className={styles.railAccent} />}
          {item.icon}
        </button>
      </SimpleTooltip>
    );
  };

  return (
    <div className={styles.iconRail}>
      <div className={styles.railSection}>
        {RAIL_ITEMS.filter((i) => i.group === "primary").map(renderItem)}
      </div>
      <div className={styles.railSpacer} />
      <div className={styles.railSection}>
        {RAIL_ITEMS.filter((i) => i.group === "secondary").map(renderItem)}
      </div>
    </div>
  );
}
