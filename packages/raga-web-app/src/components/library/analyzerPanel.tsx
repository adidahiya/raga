import {
  AUDIO_FEATURE_CACHE_VERSION,
  type TrackAudioFeatures,
} from "@adahiya/raga-types";
import {
  Badge,
  Button,
  Group,
  Progress,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import {
  IoAnalyticsOutline,
  IoCheckmarkCircle,
  IoStop,
  IoWarning,
} from "react-icons/io5";

import { useMasterPlaylist, useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";
import styles from "./analyzerPanel.module.scss";

interface AnalyzerPanelProps {
  selectedPlaylistId: string | undefined;
}

type Scope = "current" | "library";

export default function AnalyzerPanel({ selectedPlaylistId }: AnalyzerPanelProps) {
  const masterPlaylist = useMasterPlaylist();
  const masterPlaylistId = masterPlaylist?.["Playlist Persistent ID"];

  const libraryPlaylists = appStore.use.libraryPlaylists();
  const audioFeatureCache = appStore.use.audioFeatureCache();
  const audioFilesServerStatus = appStore.use.audioFilesServerStatus();
  const analyzerStatus = appStore.use.analyzerStatus();
  const analyzerProgress = appStore.use.analyzerProgress();
  const analyzerJobs = appStore.use.analyzerJobs();
  const analyzerCancelRequested = appStore.use.analyzerCancelRequested();
  const enqueueAnalysis = appStore.use.enqueueAnalysis();
  const runAnalysisQueue = appStore.use.runAnalysisQueue();
  const cancelAnalysisQueue = appStore.use.cancelAnalysisQueue();
  const clearAnalysisQueue = appStore.use.clearAnalysisQueue();
  const getTrackDef = appStore.use.getTrackDef();

  const isRunning = analyzerStatus === "busy" || analyzerProgress?.currentTrackId !== undefined;
  const hasFinishedRun =
    !isRunning &&
    analyzerProgress !== undefined &&
    analyzerProgress.completed + analyzerProgress.failed > 0;

  const initialScope: Scope =
    selectedPlaylistId !== undefined && selectedPlaylistId !== masterPlaylistId
      ? "current"
      : "library";
  const [scope, setScope] = useState<Scope>(initialScope);

  const targetPlaylistId =
    scope === "library" ? masterPlaylistId : (selectedPlaylistId ?? masterPlaylistId);

  const currentPlaylistName = useMemo(() => {
    if (libraryPlaylists === undefined || selectedPlaylistId === undefined) return undefined;
    return libraryPlaylists[selectedPlaylistId]?.Name;
  }, [libraryPlaylists, selectedPlaylistId]);

  const { counts, uncachedTrackIds } = useMemo(() => {
    if (libraryPlaylists === undefined || targetPlaylistId === undefined) {
      return { counts: { total: 0, cached: 0, uncached: 0 }, uncachedTrackIds: [] as number[] };
    }
    const def = libraryPlaylists[targetPlaylistId];
    if (def === undefined) {
      return { counts: { total: 0, cached: 0, uncached: 0 }, uncachedTrackIds: [] as number[] };
    }
    let cached = 0;
    const uncached: number[] = [];
    for (const item of def["Playlist Items"]) {
      const trackDef = getTrackDef(item["Track ID"]);
      if (trackDef === undefined) continue;
      const entry = audioFeatureCache.tracks[trackDef["Persistent ID"]] as
        | TrackAudioFeatures
        | undefined;
      if (entry?.version === AUDIO_FEATURE_CACHE_VERSION) {
        cached += 1;
      } else {
        uncached.push(item["Track ID"]);
      }
    }
    const total = def["Playlist Items"].length;
    return {
      counts: { total, cached, uncached: uncached.length },
      uncachedTrackIds: uncached,
    };
  }, [audioFeatureCache.tracks, getTrackDef, libraryPlaylists, targetPlaylistId]);

  const handleStart = useOperationCallback(
    function* () {
      if (uncachedTrackIds.length === 0) return;
      // Clear any leftover progress from a previous run so the panel reflects this new run, and
      // only enqueue tracks that actually need analysis so the displayed total matches the
      // "To analyze" count (cache hits would otherwise pad the total with no-op work).
      clearAnalysisQueue();
      enqueueAnalysis(uncachedTrackIds);
      yield* runAnalysisQueue();
    },
    [clearAnalysisQueue, enqueueAnalysis, runAnalysisQueue, uncachedTrackIds],
  );

  const handleCancel = useCallback(() => {
    cancelAnalysisQueue();
  }, [cancelAnalysisQueue]);

  const handleClear = useCallback(() => {
    clearAnalysisQueue();
  }, [clearAnalysisQueue]);

  const isServerReady = audioFilesServerStatus === "started";
  const startDisabled =
    isRunning ||
    !isServerReady ||
    targetPlaylistId === undefined ||
    uncachedTrackIds.length === 0;

  const progressValue =
    analyzerProgress !== undefined && analyzerProgress.total > 0
      ? ((analyzerProgress.completed + analyzerProgress.failed) / analyzerProgress.total) * 100
      : 0;

  const currentTrackName = useMemo(() => {
    const id = analyzerProgress?.currentTrackId;
    if (id === undefined) return undefined;
    const def = getTrackDef(id);
    if (def === undefined) return undefined;
    return def.Name ?? undefined;
  }, [analyzerProgress?.currentTrackId, getTrackDef]);

  const failedJobs = useMemo(
    () => analyzerJobs.filter((j) => j.status === "failed"),
    [analyzerJobs],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.inner}>
        <Stack gap="lg">
          <Group gap="sm" align="center">
            <IoAnalyticsOutline size={22} />
            <Title order={3} fw={600} m={0}>
              Analyzer
            </Title>
          </Group>

          <Text c="dimmed" size="sm">
            Extract BPM, musical key, energy, and other audio features for tracks in the
            selected scope. Analysis runs off the UI thread, so the rest of the app stays
            interactive while it works.
          </Text>

          <Stack gap="xs">
            <Text size="xs" c="dimmed" tt="uppercase" lts={0.5} fw={600}>
              Scope
            </Text>
            <SegmentedControl
              value={scope}
              onChange={(v) => {
                setScope(v as Scope);
              }}
              disabled={isRunning}
              data={[
                {
                  value: "current",
                  label:
                    currentPlaylistName !== undefined
                      ? `Current playlist (${currentPlaylistName})`
                      : "Current playlist",
                  disabled:
                    selectedPlaylistId === undefined ||
                    selectedPlaylistId === masterPlaylistId,
                },
                { value: "library", label: "Entire library" },
              ]}
            />
          </Stack>

          <Group gap="md" wrap="wrap">
            <Stat label="Tracks in scope" value={counts.total.toLocaleString()} />
            <Stat label="Already analyzed" value={counts.cached.toLocaleString()} accent="ok" />
            <Stat label="To analyze" value={counts.uncached.toLocaleString()} accent="info" />
          </Group>

          <Group gap="sm">
            {isRunning ? (
              <Button
                leftSection={<IoStop />}
                color="red"
                variant="light"
                onClick={handleCancel}
                disabled={analyzerCancelRequested}
              >
                {analyzerCancelRequested ? "Cancelling…" : "Cancel"}
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                disabled={startDisabled}
                leftSection={<IoAnalyticsOutline />}
              >
                Start analysis
              </Button>
            )}
            {hasFinishedRun && (
              <Button variant="subtle" color="gray" onClick={handleClear}>
                Clear results
              </Button>
            )}
          </Group>

          {!isServerReady && (
            <Group gap="xs" align="center">
              <IoWarning />
              <Text size="sm" c="dimmed">
                Audio files server is not connected. Start it from the status bar to enable
                analysis.
              </Text>
            </Group>
          )}

          {analyzerProgress !== undefined && (
            <Stack gap="xs" className={styles.progressBlock}>
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  {isRunning
                    ? "Analyzing…"
                    : analyzerCancelRequested
                      ? "Cancelled"
                      : "Last run"}
                </Text>
                <Text size="xs" c="dimmed">
                  {analyzerProgress.completed + analyzerProgress.failed} of{" "}
                  {analyzerProgress.total}
                  {analyzerProgress.failed > 0
                    ? ` · ${analyzerProgress.failed.toString()} failed`
                    : null}
                </Text>
              </Group>
              <Progress
                value={progressValue}
                animated={isRunning}
                color={analyzerProgress.failed > 0 ? "yellow" : "blue"}
              />
              <Group justify="space-between" align="center">
                <Text size="xs" c="dimmed" className={styles.currentTrack}>
                  {isRunning && currentTrackName !== undefined
                    ? `Current: ${currentTrackName}`
                    : isRunning
                      ? "Loading next track…"
                      : hasFinishedRun
                        ? `${analyzerProgress.completed.toString()} analyzed`
                        : ""}
                </Text>
                {isRunning && analyzerProgress.etaMs !== undefined && (
                  <Text size="xs" c="dimmed">
                    ETA {formatEta(analyzerProgress.etaMs)}
                  </Text>
                )}
              </Group>
            </Stack>
          )}

          {failedJobs.length > 0 && !isRunning && (
            <Stack gap={4}>
              <Group gap="xs" align="center">
                <IoWarning />
                <Text size="sm" fw={500}>
                  {failedJobs.length} track{failedJobs.length === 1 ? "" : "s"} failed
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                Click Start again to retry the queue, or open the track table to analyze
                individual tracks.
              </Text>
            </Stack>
          )}

          {hasFinishedRun && analyzerProgress.failed === 0 && (
            <Group gap="xs" align="center">
              <Badge
                color="green"
                variant="light"
                leftSection={<IoCheckmarkCircle />}
                radius="sm"
              >
                Done
              </Badge>
              <Text size="sm" c="dimmed">
                Analyzed {analyzerProgress.completed} track
                {analyzerProgress.completed === 1 ? "" : "s"}.
              </Text>
            </Group>
          )}
        </Stack>
      </div>
    </div>
  );
}
AnalyzerPanel.displayName = "AnalyzerPanel";

interface StatProps {
  label: string;
  value: string;
  accent?: "ok" | "info";
}

function Stat({ label, value, accent }: StatProps) {
  return (
    <div className={styles.stat} data-accent={accent}>
      <Text size="xs" c="dimmed" tt="uppercase" lts={0.5} fw={600}>
        {label}
      </Text>
      <Text size="xl" fw={600} className={styles.statValue}>
        {value}
      </Text>
    </div>
  );
}

function formatEta(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds.toString()}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString()}m ${s.toString().padStart(2, "0")}s`;
}
