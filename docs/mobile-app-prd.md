# Raga Mobile App — Product Requirements Document

> Status: Draft v1 · Documentation only (no visuals, no code)
> Audience: Designers and engineers picking up the mobile companion app

## 1. What & why

Raga is, today, a desktop-first toolkit for working DJs who maintain a large
curated music library on macOS. The desktop Electron app
(`packages/raga-app`) is where DJs **organize their library**, **analyze BPM**,
**rate and tag tracks**, **assemble playlists**, and ultimately **export to a
Rekordbox-compatible format for USB**, which is the medium they actually plug
into CDJs at a gig. Swinsian sits upstream as a watch-folder library manager;
Rekordbox sits downstream as the performance tool. Raga is the connective
tissue — and the place where most of the real curation work happens.

The Raga **mobile app** is a *companion* to that desktop workflow, not a
replacement. The DJ's laptop remains the place where audio files live, BPM is
analyzed, and the final USB is exported. The mobile app exists so that the
hours and days *before* a gig — on the train, in a cafe, between sets at
another DJ's gig — can also be spent meaningfully refining the library and
tonight's playlists. Edits made on the phone flow back to the desktop, where
they are picked up automatically the next time the laptop is opened.

In a later phase, the same cloud infrastructure that carries metadata also
carries the user's own audio files, so the DJ can actually *listen* to their
collection on their phone — without ever copying files to the device.

**Target user.** A working DJ, primarily on macOS, with a large
(~10k–50k+ track) personally-curated digital library. They already use
Swinsian + Raga + Rekordbox in some combination today and own their audio
files (purchased on Bandcamp, ripped from CDs, downloaded from promo pools,
etc.). They do not want their library at the mercy of a third-party streaming
service's catalog, takedowns, or recommendations.

**Core value proposition.**
- *Phase 1:* Refine your gig library and playlists from anywhere, with
  changes safely synced back to the desktop where the real export happens.
- *Phase 2:* Listen to your *own* library anywhere, on your phone, without
  having to copy files to the device — including offline, for venues with bad
  signal.

## 2. Foundational infrastructure assumption

**Raga owns and operates the cloud infrastructure** that backs the mobile app.
This is not a question, it is a precondition.

- In **Phase 1**, this means Raga-hosted account/auth, library metadata
  storage, and a sync API.
- In **Phase 2**, this *additionally* means Raga-hosted object storage for
  the user's personal audio files, and a Raga-operated streaming path from
  that storage to the mobile client.

The reason this is non-negotiable: DJs perform from files they own. Their
library is not the intersection of a streaming catalog — it is a personal,
curated collection of files acquired from Bandcamp, record stores, promo
pools, friends, and their own production. Those exact files have to end up on
a USB stick the DJ plugs into a CDJ. A third-party streaming service
(Spotify, Apple Music, Tidal, etc.) cannot satisfy this workflow at any
price, because the catalog is not the user's, the files cannot be exported,
and the metadata is not under the user's control.

This is a substantial engineering and operating-cost commitment, especially
in Phase 2. It is called out here as a foundational assumption and revisited
in §10 *Risks*.

## 3. Product phases

The mobile product is intentionally split into two phases. Each phase is
independently shippable and independently valuable.

### Phase 1 — Metadata sync (MVP)

- Library and playlist *metadata* sync between desktop and mobile via Raga's
  cloud: the track list, playlist contents and ordering, ratings, BPM, tags,
  and the rest of the fields modeled in `packages/raga-types`.
- Audio files **stay on the desktop**. They are not uploaded.
- The mobile app is a **browse + manage** tool: search the library, review
  tonight's playlist, reorder it, add candidates from the broader library,
  rate tracks, edit basic metadata.
- **No on-device audio playback** in this phase. The phone is a remote
  controller for the library, not a player.

Phase 1 is independently valuable. Pre-gig playlist tweaks while away from
the laptop is real, repeated utility for working DJs.

### Phase 2 — Audio streaming

- The desktop ingests the user's audio files into Raga-hosted cloud storage.
- The mobile app streams those files on demand at full quality.
- Selected playlists can be cached on-device for offline listening (subway,
  green rooms, venues with bad connectivity).
- Metadata sync from Phase 1 continues unchanged.

Phase 2 is the headline experience — *"my whole library, on my phone,
without copying files"* — and is what most DJs will eventually pay for.

### Always out / not in scope for either phase

- Performance-time DJ features on mobile (cue points, mixing, key-locked
  tempo adjust, looping). DJs perform on CDJs, not phones.
- Social / sharing features (sharing playlists with other DJs, follower
  graphs, public profiles).
- AI-assisted set suggestions or auto-curation.
- Replacing the desktop app's role in BPM analysis, Rekordbox export, or
  USB preparation.

## 4. Tier premise

Cloud sync is a **paid service from Phase 1 onward**. Even metadata sync
requires Raga to operate accounts, storage, and a sync API on behalf of the
user — there is no free version of that infrastructure to ride on.

- **Free tier.** Local-only desktop use, as today: import a Swinsian library,
  analyze BPM, export to Rekordbox. No cloud. The mobile app is either
  unavailable on the free tier or offers, at most, a one-time read-only
  snapshot of the desktop library so a prospective user can see what the
  experience would feel like. (Exact shape of the free mobile experience is
  TBD — see §10.)
- **Paid tier (Phase 1 launch).** Cloud account, metadata sync, full mobile
  browse & manage experience.
- **Paid tier (Phase 2).** Adds audio ingestion, streaming, and offline
  cache. May be the same tier as Phase 1 paid, or a higher tier — TBD,
  largely a function of storage cost per user.

Concrete pricing is **out of scope** for this PRD. The paid tier is used
here as a scoping device, not a commitment.

## 5. Feature scope by phase

### Phase 1 — In

- Account creation and authentication (Raga account).
- Linking the mobile app to the same account as the desktop app.
- Initial metadata sync from desktop → cloud → mobile after linking.
- Browse the full library (track list with metadata).
- Browse playlists, including playlist contents and ordering.
- View detailed track metadata (artist, album, genre, BPM, key, rating,
  tags, file format, etc.).
- Search and filter the library (by text, BPM range, key, rating, tag,
  genre — same axes the desktop supports).
- Rate tracks (1–5 stars).
- Edit basic track metadata (rating, tags, and other safe-to-edit fields).
- Create, rename, and delete playlists.
- Add tracks to a playlist, remove tracks from a playlist, reorder tracks
  within a playlist.
- Per-item and global sync status indicators.
- Surfacing of sync conflicts (see §9).

### Phase 1 — Explicitly out

- Any audio playback on mobile.
- Any audio file upload from desktop into cloud storage.
- Any offline cache of audio.
- Initiating BPM analysis from mobile (analysis still runs on the desktop;
  mobile only displays results once the desktop has computed and synced
  them).
- Exporting to Rekordbox from mobile.

### Phase 2 — In

- Desktop-side ingestion of audio files into Raga cloud storage, with clear
  per-track and library-wide progress.
- Streaming playback on mobile of any track that has been ingested,
  delivered at the original quality the user uploaded.
- On-device offline cache of selected playlists (user opts in per playlist).
- Simple playback controls (play, pause, skip within a playlist, scrub,
  volume, basic queue) — *not* DJ controls.
- Visibility into which tracks are currently streamable vs not yet ingested.

### Phase 2 — Explicitly out

- DJ performance features (see §3).
- Mobile-initiated re-encoding or transcoding choices beyond what's needed
  to stream (specific codec/bitrate strategy is an implementation choice).

### Future / not now

See §11.

## 6. Core user flows

Each flow is written as a short numbered narrative — no diagrams, but
detailed enough that a designer can turn each into a screen sequence.

### 6.1 Phase 1 flows

**First-time setup.**
1. DJ installs the Raga mobile app from the App Store / Play Store.
2. Opens the app and either signs in to an existing Raga account or signs up
   for one.
3. Is told that the mobile app needs to be paired with a desktop install to
   be useful, and is shown a clear "open Raga on your laptop and sign in
   with the same account" instruction.
4. On the desktop, the DJ opens Raga, signs in to the same account, and
   confirms "yes, sync this library to the cloud."
5. The desktop performs the initial metadata sync (library + playlists)
   into Raga cloud.
6. The mobile app shows initial-sync progress, then transitions into the
   browse experience once metadata is available.

**Pre-gig prep on the train.**
1. DJ is on the train an hour before tonight's gig and opens the mobile app.
2. Navigates into "tonight's playlist."
3. Reviews the track list — sees BPM, key, rating, genre, tags.
4. Reorders a few tracks to better shape the set.
5. Searches the broader library for a couple of candidate tracks
   (filtered by BPM range and tag) and adds them to the playlist.
6. Bumps the rating on one track from 4 to 5 stars after re-listening
   mentally to it (Phase 1 has no playback — they're working from memory,
   metadata, and notes).
7. Sees a clear "synced" indicator confirming the changes are safely in the
   cloud.

**Returning home / pre-gig finalization on the desktop.**
1. DJ gets home, opens Raga on the laptop.
2. The desktop pulls down the mobile-side changes; the playlist now reflects
   the new ordering and the candidate tracks.
3. The desktop notices that two of the newly-added candidate tracks have no
   BPM yet, and offers to run BPM analysis on them.
4. DJ runs analysis; results are written to the audio file ID3 tags and
   synced back to the cloud (so mobile shows them next time).
5. DJ exports the updated playlist to the Rekordbox-compatible format.
6. DJ copies the export to USB and heads to the gig.

**Offline / spotty connectivity in Phase 1.**
1. DJ is in a tunnel or a basement with no signal.
2. The mobile app continues to work for browsing already-synced metadata.
3. Edits made offline (rating a track, reordering a playlist, adding a
   tag) are queued locally and the UI clearly shows them as "pending sync."
4. When connectivity returns, queued edits are pushed to the cloud and the
   "pending" badge clears. If a conflict is detected (§9), the user is
   surfaced an explicit resolution prompt.

**Discovering and upgrading to the paid tier.**
1. A free-tier desktop user discovers the mobile app exists (via in-app
   marketing in the desktop app, or by installing the mobile app directly).
2. On the mobile app's first launch, the user is shown what the paid tier
   unlocks (full mobile sync + management) with an honest framing of the
   pricing premise.
3. User upgrades from inside the desktop app or the mobile app; sync is
   enabled within the same session.

### 6.2 Phase 2 flows (forward-looking)

**First-time enabling cloud audio.**
1. On the desktop, DJ opts in to cloud audio for their library (or for a
   selected subset of playlists, if we want to scope ingestion).
2. Desktop begins uploading audio files to Raga cloud storage in the
   background, showing per-track and overall progress and an honest ETA.
3. Ingestion is acknowledged as a one-time-per-track cost. It may take
   hours or days for very large libraries; the UX must make it clear the
   user can continue using the desktop normally during ingestion.
4. As tracks finish ingesting, they become streamable on mobile.

**Pre-gig prep with streaming.**
1. Same as the Phase 1 train flow, but now the DJ can actually preview
   tracks via streaming.
2. Hearing a candidate track in their headphones changes their mind about a
   selection — they swap it for a better one.
3. Streaming respects a "cellular data" preference (see §7), so the DJ
   isn't accidentally burning gigabytes on a metered connection.

**Listening on the subway with no signal.**
1. Earlier in the day, DJ marked one or two playlists as "available
   offline."
2. The mobile app cached those playlists' audio on-device in the background.
3. On the subway with no signal, DJ opens a cached playlist and listens
   uninterrupted.
4. A clear visual indicator shows which playlists / tracks are cached vs
   stream-only.

## 7. Functional requirements

Each requirement is tagged **[P1]** (Phase 1) or **[P2]** (Phase 2). The
system *must*:

**Auth & accounts**
- [P1] Allow account creation and sign-in via a Raga-owned identity system.
- [P1] Allow the mobile app to be paired with a desktop install via the
  shared account.
- [P1] Support sign-out on either device without destroying the user's
  cloud library state.
- [P1] Allow account deletion, with a clear statement of what gets removed
  from Raga cloud storage and what (if anything) the user must clean up
  themselves on their devices.

**Metadata sync**
- [P1] Sync the library track list and per-track metadata fields modeled in
  `packages/raga-types/src/models/tracks.ts`.
- [P1] Sync the playlist definitions modeled in
  `packages/raga-types/src/models/playlists.ts`, including ordering.
- [P1] Round-trip metadata losslessly between mobile, cloud, and the
  desktop's Swinsian/Rekordbox-compatible plist representation, so editing
  on mobile does not degrade fields the desktop cares about.
- [P1] Apply edits made on either side incrementally (no full re-sync per
  change).
- [P1] Reflect sync state visibly in the UI (per-item and globally —
  see §9).

**Audio ingestion** *(Phase 2)*
- [P2] Allow the desktop to ingest audio files into Raga cloud storage,
  scoped to the entire library or to selected playlists.
- [P2] Show ingestion progress per track and overall.
- [P2] Survive ingestion interruptions (network drop, laptop sleep) without
  re-uploading already-uploaded data.
- [P2] Report which tracks are ingested and streamable so the mobile UI can
  reflect it.

**Streaming playback** *(Phase 2)*
- [P2] Stream any ingested track to mobile at the original quality the user
  uploaded.
- [P2] Provide simple playback controls: play, pause, skip, scrub, volume,
  per-playlist queue.
- [P2] Respect a user setting for whether streaming is allowed on cellular
  data.

**Offline cache** *(Phase 2)*
- [P2] Allow the user to mark individual playlists for offline cache.
- [P2] Download cached playlists in the background when on Wi-Fi (or
  cellular, if the user has explicitly allowed it).
- [P2] Clearly indicate which tracks are cached and play them locally with
  no network dependency.
- [P2] Allow the user to remove cached playlists to free up device storage,
  and surface current device storage usage.

**Playlist management**
- [P1] Create, rename, and delete playlists.
- [P1] Add tracks to a playlist, remove tracks from a playlist, reorder
  tracks within a playlist.

**Track metadata edits**
- [P1] Edit rating (1–5 stars) and tags from mobile.
- [P1] Edit other safe-to-edit fields (e.g. genre, comments) where the
  shared model permits.
- [P1] Make clear which fields are read-only on mobile because they are
  derived (e.g. BPM, which comes from desktop analysis).

**Search & filter**
- [P1] Free-text search across track title, artist, album.
- [P1] Filter by BPM range, key, rating, tag, genre.
- [P1] Combine filters with search.

**Settings**
- [P1] Account settings, sign-out, account deletion.
- [P1] Sync settings (pause/resume sync; show last successful sync time).
- [P2] Streaming/cellular settings, offline cache management, device
  storage usage.

**Notifications**
- [P1] In-app surfacing of sync conflicts requiring user input.
- [P1] Optional push notifications for "your desktop has finished a long
  background task" (e.g. BPM analysis on a batch of tracks the user added
  from mobile).

**Sync status visibility**
- [P1] A global indicator (e.g. in the chrome / nav) showing overall sync
  health: synced, syncing, offline / queued, conflict, error.
- [P1] Per-item indicators on tracks and playlists that have pending or
  failed local edits.

## 8. Non-functional requirements

- **Library scale.** Browsing and searching a 12k–50k+ track library must
  remain smooth on mobile (no jank when scrolling, sub-200ms search
  feedback for typical queries).
- **Bandwidth & data usage.**
  - [P1] Metadata sync should be incremental and small enough to be
    inconsequential on cellular. A library-wide sync should be the
    exception, not the rule.
  - [P2] Streaming on cellular must be opt-in and visibly governed by a
    setting. Cache pre-fetching defaults to Wi-Fi only.
- **Battery.** [P2] Streaming playback should not be meaningfully worse for
  battery than playing local audio in a typical mobile audio app.
- **Accessibility.** Meet platform accessibility baselines: Dynamic Type
  / system font scaling, sufficient contrast (the desktop's dark + light
  theme distinction in `@adahiya/raga-design-system` should map to a
  matching mobile theme), VoiceOver / TalkBack labels for all interactive
  elements, large-enough tap targets.
- **Supported platforms.** **Open question** — iOS first or iOS + Android
  simultaneously. iOS-first is the working assumption given the macOS-heavy
  target user, but this should be confirmed before design starts. (See
  §10.)
- **Data model compatibility.** The mobile client must remain compatible
  with the shared types in `packages/raga-types` (notably
  `models/library.ts`, `models/tracks.ts`, `models/playlists.ts`) so that
  any edit round-trips losslessly between mobile, cloud, and the desktop's
  Swinsian/Rekordbox-compatible plist format. Any field the mobile client
  does not understand must be preserved verbatim, not dropped.
- **Reliability.** The user must never silently lose an edit. Failures must
  be surfaced. The cloud is the canonical source for metadata once sync is
  enabled (see §9), so any "lost" edit is a serious bug, not a UX nit.

## 9. Cloud sync model (requirements level)

This section describes *what* the sync model must do, not *how* to build it.

### 9.1 What syncs in Phase 1
- Library track list and per-track metadata (artist, title, album, genre,
  rating, BPM, key, tags, comments, file format, persistent IDs, etc.).
- Playlist definitions, including ordering of tracks within each playlist.
- Account / pairing state.

Audio files do **not** leave the desktop in Phase 1. The mobile client never
sees an audio file in Phase 1.

### 9.2 What syncs in Phase 2
- Everything in Phase 1, plus:
- Audio files, ingested from desktop into Raga cloud storage.
- Per-track ingestion status (not yet ingested / ingesting / ingested /
  ingestion failed).
- Per-playlist offline-cache preference, per device.

### 9.3 Direction of sync
- The flow is **desktop ↔ Raga cloud ↔ mobile**.
- Once cloud sync is enabled, **the cloud is the canonical source for
  metadata**. Both desktop and mobile read from and write to the cloud.
- For audio files: the **desktop file remains the master** (it is what gets
  exported to USB). In Phase 2, after a track has been ingested, the cloud
  copy is the canonical *streaming* source for mobile, but the desktop file
  is still the canonical source for export. If they diverge (e.g. the user
  re-tags the file locally), the desktop is responsible for re-ingesting.

### 9.4 Conflict resolution
At a requirements level (not an algorithm):
- Per-field metadata edits use **last-writer-wins**. Two devices editing
  rating on the same track converge on whichever edit happened later, by a
  monotonically-correct clock the system maintains.
- **Structural edits** to a playlist (reorder, add, remove) are higher-risk
  and must be **surfaced to the user** when they conflict — for example,
  if mobile reordered a playlist while desktop simultaneously removed
  tracks from it. The user picks which version to keep, or merges
  manually.
- A conflict surfaced to the user must be persistent (it does not disappear
  on app reload) and resolvable from either device.
- The system must never silently drop a user edit. If automatic resolution
  is unsafe, prefer surfacing a conflict over guessing.

### 9.5 What "safely synced" means to the user
- A clear sync indicator on every track and playlist that has unsynced
  local edits, plus a global indicator in the chrome.
- States to model in the UI, at minimum: **synced**, **syncing**,
  **offline / queued**, **conflict — needs resolution**, **error**.
- "Last successful sync" timestamp visible in settings.
- After a successful sync, the user should never have to wonder whether an
  edit made it. The default state is "everything is synced and you don't
  have to think about it."

## 10. Risks, assumptions, and open questions

### Risks
- **Infrastructure scale & cost (major).** Raga must build and operate
  cloud storage and, in Phase 2, audio streaming for users' personal
  collections. Even Phase 1's metadata-only footprint requires accounts +
  durable storage + a sync API. Phase 2 multiplies this dramatically:
  ingesting and serving multi-terabyte personal libraries per user is
  expensive, and pricing must be sized to cover it.
- **Legal / licensing.** Even though the user owns their files, hosting
  and streaming a personally-owned audio collection back to that user has
  to be evaluated for DMCA / safe-harbor / regional copyright implications.
  Per-user, single-user playback of user-owned files is the standard
  "personal cloud locker" pattern, but this needs proper legal review
  before Phase 2 launches.
- **Storage cost per user scales with library size.** DJs commonly have
  10k–50k+ track libraries. Pricing must account for the long tail of
  very large libraries without making the median user subsidize them
  unreasonably.
- **Ingestion bandwidth from the user's home connection (Phase 2).**
  Uploading a large library may take days. The UX must handle this
  gracefully: resumable uploads, accurate progress, clear ETA, and no
  pressure on the user to "leave the laptop on overnight" without saying
  so explicitly.
- **Drift if the user does not keep the desktop reasonably in sync.**
  The desktop is where new audio files actually land (via Swinsian's
  watch-folder), where BPM is computed, and where Rekordbox export
  happens. If the user goes weeks without opening the desktop app, the
  cloud (and therefore mobile) will not reflect new acquisitions or new
  analysis. This is acceptable, but the mobile UI should make it
  discoverable — e.g. "your desktop hasn't synced in 14 days."

### Assumptions
- The DJ uses macOS and runs the Raga desktop app there. (Cross-platform
  desktop is not in scope here.)
- The user owns their audio files and is willing to ingest them into Raga
  cloud storage in Phase 2.
- The shared data model in `packages/raga-types` is the right foundation
  for what mobile + cloud need to exchange. Any new fields required for
  sync (per-record sync state, conflict markers, ingestion state) are
  added there, not invented mobile-side.
- The desktop app remains the source of truth for BPM analysis and final
  Rekordbox export. The mobile app never tries to take over those jobs.

### Open questions
- **iOS first, or iOS + Android together?** Working assumption: iOS first,
  given the target user base. Confirm before design.
- **Does the free tier include any cloud functionality at all** (e.g. a
  one-time read-only mobile snapshot), or is the free tier strictly local
  desktop with no mobile app at all?
- **Does Phase 1 ship before Phase 2 infrastructure even exists in
  prototype**, or do we build Phase 2 in parallel and gate it behind a
  flag?
- **Are Phase 1 paid and Phase 2 paid the same tier**, or does Phase 2
  command a higher price because of storage cost? This is mostly an
  economic question that depends on real ingestion + storage cost data.
- **What is the canonical clock** used to order edits for last-writer-wins
  per-field merging? (Posed here as a requirement-level question; the
  exact mechanism is an implementation choice.)

## 11. Future / not now

Ideas worth not losing, explicitly deferred:

- **Performance features on mobile.** Cue points, mixing, key-locked
  tempo, looping. Mobile is for prep, not performance — but an extremely
  lightweight "preview with cue point markers" view could be interesting
  far down the line.
- **Sharing playlists with other DJs.** A DJ-to-DJ playlist exchange is a
  real workflow today (over AirDrop, Dropbox, USB), and a Raga-native
  version could be valuable — but it has its own product, legal, and
  UX surface area and is deferred.
- **AI-assisted set suggestions.** "Given this opener and this closer,
  suggest a path" is interesting; it is also a different product. Not
  now.
- **Multi-device / multi-laptop sync.** A DJ with both a studio Mac and a
  travel laptop syncing through the same Raga cloud account is a natural
  extension of the same infrastructure. Worth considering once Phase 1 is
  stable.
- **Collaborative library curation** (e.g. a resident DJ team sharing a
  library). Same infrastructure, very different permissions and conflict
  story. Not now.
- **Web client** that mirrors the mobile experience for browsing /
  managing from any browser. Plausible reuse of much of the same cloud
  surface area. Not now.

## 12. References

- Project README: [`README.md`](../README.md)
- Implementation notes: [`docs/NOTES.md`](./NOTES.md)
- Project memory: [`replit.md`](../replit.md)
- Desktop app README: [`packages/raga-app/README.md`](../packages/raga-app/README.md)
- Web app README: [`packages/raga-web-app/README.md`](../packages/raga-web-app/README.md)
- Shared data types: [`packages/raga-types`](../packages/raga-types)
- Shared library code: [`packages/raga-lib`](../packages/raga-lib)
- Design language inspiration (desktop chrome): [`artifacts/mockup-sandbox/src/components/mockups/raga-app/CommandBarDocked.tsx`](../artifacts/mockup-sandbox/src/components/mockups/raga-app/CommandBarDocked.tsx)
