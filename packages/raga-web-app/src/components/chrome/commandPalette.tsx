import { Kbd } from "@adahiya/raga-design-system";
import { useHotkeys } from "@mantine/hooks";
import {
  Spotlight,
  spotlight,
  type SpotlightActionData,
  type SpotlightActionGroupData,
} from "@mantine/spotlight";
import { run } from "effection";
import { useMemo } from "react";
import {
  IoAnalyticsOutline,
  IoFolderOpenOutline,
  IoHelpCircleOutline,
  IoMusicalNotesOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoSwapHorizontalOutline,
} from "react-icons/io5";

import { useMasterPlaylist } from "../../hooks";
import { appStore } from "../../store/appStore";

type SpotlightActions = SpotlightActionData | SpotlightActionGroupData;

const TRACK_RESULT_LIMIT = 50;

// Track results are produced lazily via the Spotlight `filter` callback so we
// never materialize an action object per track in the library.
export default function CommandPalette() {
  const libraryPlaylists = appStore.use.libraryPlaylists();
  const library = appStore.use.library();
  const setSelectedPlaylistId = appStore.use.setSelectedPlaylistId();
  const setSelectedTrackId = appStore.use.setSelectedTrackId();
  const setWorkspaceMode = appStore.use.setWorkspaceMode();
  const workspaceMode = appStore.use.workspaceMode();
  const analyzePlaylist = appStore.use.analyzePlaylist();
  const analyzeTrack = appStore.use.analyzeTrack();
  const selectedPlaylistId = appStore.use.selectedPlaylistId();
  const selectedTrackId = appStore.use.selectedTrackId();
  const loadLibrary = appStore.use.loadSwinsianLibrary();
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const masterPlaylist = useMasterPlaylist();
  const masterPlaylistId = masterPlaylist?.["Playlist Persistent ID"];

  useHotkeys([["mod+K", () => { spotlight.open(); }]]);

  const focusSelectedTrackInTable = () => {
    requestAnimationFrame(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "l", metaKey: true, ctrlKey: true, bubbles: true }),
      );
    });
  };

  const baseGroups = useMemo<SpotlightActions[]>(() => {
    const actions: SpotlightActionData[] = [
      {
        id: "switch-tracks",
        label: workspaceMode === "tracks" ? "Tracks mode (active)" : "Switch to Tracks mode",
        description: "Browse playlists and the track table",
        leftSection: <IoSwapHorizontalOutline size={16} />,
        keywords: ["mode", "tracks"],
        onClick: () => { setWorkspaceMode("tracks"); },
      },
      {
        id: "switch-export",
        label: workspaceMode === "export" ? "Export mode (active)" : "Switch to Export mode",
        description: "Configure library export to other apps",
        leftSection: <IoSwapHorizontalOutline size={16} />,
        keywords: ["mode", "export", "rekordbox"],
        onClick: () => { setWorkspaceMode("export"); },
      },
      {
        id: "reload-library",
        label: "Reload library from Swinsian",
        description: "Re-read the library XML from disk",
        leftSection: <IoRefreshOutline size={16} />,
        keywords: ["reload", "refresh", "library"],
        onClick: () => {
          if (libraryInputFilepath !== undefined) {
            void run(() => loadLibrary({ filepath: libraryInputFilepath, reloadFromDisk: true }));
          }
        },
      },
      {
        id: "analyze-current-playlist",
        label: "Analyze BPM for current playlist",
        description: "Run BPM analysis on every track in the selected playlist",
        leftSection: <IoAnalyticsOutline size={16} />,
        keywords: ["analyze", "bpm", "playlist"],
        rightSection: <Kbd>⌘⇧A</Kbd>,
        disabled: selectedPlaylistId === undefined,
        onClick: () => {
          if (selectedPlaylistId !== undefined) {
            void run(() => analyzePlaylist(selectedPlaylistId));
          }
        },
      },
      {
        id: "analyze-current-track",
        label: "Analyze BPM for selected track",
        description: "Run BPM analysis on the currently selected track",
        leftSection: <IoAnalyticsOutline size={16} />,
        keywords: ["analyze", "bpm", "track"],
        disabled: selectedTrackId === undefined,
        onClick: () => {
          if (selectedTrackId !== undefined) {
            void run(() => analyzeTrack(selectedTrackId));
          }
        },
      },
      {
        id: "open-hotkeys",
        label: "Show keyboard shortcuts",
        description: "Open the global hotkeys dialog",
        leftSection: <IoHelpCircleOutline size={16} />,
        keywords: ["help", "hotkeys", "keyboard"],
        rightSection: <Kbd>⌘I</Kbd>,
        onClick: () => {
          window.dispatchEvent(
            new KeyboardEvent("keydown", { key: "i", metaKey: true, ctrlKey: true, bubbles: true }),
          );
        },
      },
      {
        id: "open-settings",
        label: "Open settings",
        description: "User preferences and analyzer options",
        leftSection: <IoSettingsOutline size={16} />,
        keywords: ["settings", "preferences"],
        onClick: () => {
          const trigger = document.querySelector<HTMLButtonElement>(
            "[data-raga-settings-trigger]",
          );
          trigger?.click();
        },
      },
    ];

    const playlistActions: SpotlightActionData[] = [];
    if (libraryPlaylists !== undefined) {
      for (const id of Object.keys(libraryPlaylists)) {
        const def = libraryPlaylists[id];
        if (def === undefined) continue;
        if (def.Master) continue;
        if (def.Name === "Music") continue;
        playlistActions.push({
          id: `playlist-${id}`,
          label: def.Name,
          description: `${def["Playlist Items"].length.toString()} tracks`,
          leftSection: <IoFolderOpenOutline size={16} />,
          keywords: ["playlist", def.Name.toLowerCase()],
          onClick: () => {
            setWorkspaceMode("tracks");
            setSelectedPlaylistId(id);
          },
        });
      }
    }

    const groups: SpotlightActions[] = [{ group: "Actions", actions }];
    if (playlistActions.length > 0) {
      groups.push({ group: "Playlists", actions: playlistActions });
    }
    return groups;
  }, [
    workspaceMode,
    libraryInputFilepath,
    libraryPlaylists,
    selectedPlaylistId,
    selectedTrackId,
    setWorkspaceMode,
    setSelectedPlaylistId,
    loadLibrary,
    analyzePlaylist,
    analyzeTrack,
  ]);

  const buildTrackActions = useMemo(
    () =>
      (query: string): SpotlightActionData[] => {
        if (library === undefined) return [];
        const trimmed = query.trim().toLowerCase();
        if (trimmed.length < 2) return [];
        const out: SpotlightActionData[] = [];
        for (const idStr of Object.keys(library.Tracks)) {
          const trackId = Number(idStr);
          const def = library.Tracks[trackId];
          const name = def.Name ?? "Untitled";
          const artist = def.Artist ?? "Unknown";
          const haystack = `${artist} ${name}`.toLowerCase();
          if (!haystack.includes(trimmed)) continue;
          out.push({
            id: `track-${idStr}`,
            label: `${artist} — ${name}`,
            description: def.BPM !== undefined ? `BPM ${def.BPM.toString()}` : "Not analyzed",
            leftSection: <IoMusicalNotesOutline size={16} />,
            onClick: () => {
              setWorkspaceMode("tracks");
              if (masterPlaylistId !== undefined) {
                setSelectedPlaylistId(masterPlaylistId);
              }
              setSelectedTrackId(trackId);
              focusSelectedTrackInTable();
            },
          });
          if (out.length >= TRACK_RESULT_LIMIT) break;
        }
        return out;
      },
    [library, masterPlaylistId, setWorkspaceMode, setSelectedPlaylistId, setSelectedTrackId],
  );

  const filterFn = useMemo(
    () =>
      (query: string, actions: SpotlightActions[]): SpotlightActions[] => {
        const q = query.trim().toLowerCase();
        const isGroup = (entry: SpotlightActions): entry is SpotlightActionGroupData =>
          "actions" in entry && Array.isArray((entry).actions);
        const filteredBase: SpotlightActions[] = [];
        for (const entry of actions) {
          if (!isGroup(entry)) {
            filteredBase.push(entry);
            continue;
          }
          if (q === "") {
            filteredBase.push(entry);
            continue;
          }
          const matches = entry.actions.filter((a) => {
            const label = typeof a.label === "string" ? a.label.toLowerCase() : "";
            const desc =
              typeof a.description === "string" ? a.description.toLowerCase() : "";
            const kwArr = a.keywords;
            const kw = Array.isArray(kwArr)
              ? kwArr.join(" ").toLowerCase()
              : (kwArr ?? "").toLowerCase();
            return label.includes(q) || desc.includes(q) || kw.includes(q);
          });
          if (matches.length > 0) {
            filteredBase.push({ ...entry, actions: matches });
          }
        }

        const trackActions = buildTrackActions(query);
        if (trackActions.length > 0) {
          filteredBase.push({ group: "Tracks", actions: trackActions });
        }
        return filteredBase;
      },
    [buildTrackActions],
  );

  return (
    <Spotlight
      shortcut={["mod + k"]}
      actions={baseGroups}
      filter={filterFn}
      nothingFound="No matching commands"
      highlightQuery
      limit={20}
      scrollAreaProps={{ scrollbarSize: 6 }}
      searchProps={{
        leftSection: <IoSearchOutline size={16} />,
        placeholder: "Search playlists, tracks, or run a command…",
      }}
    />
  );
}
CommandPalette.displayName = "CommandPalette";
