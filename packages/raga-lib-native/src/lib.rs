#![deny(clippy::all)]

use napi::bindgen_prelude::*;
use napi_derive::napi;

mod converter;
mod models;
mod xml;

#[napi]
pub fn convert_swinsian_to_itunes_xml(
    tracks: Array,
    playlists: Array,
) -> Result<String> {
    // Convert tracks from JS array to Vec<TrackDefinition>
    let mut tracks_vec = Vec::new();
    for i in 0..tracks.len() {
        let track = tracks.get::<models::TrackDefinition>(i)
            .map_err(|e| Error::from_reason(format!("Failed to get track at index {}: {}", i, e)))?
            .ok_or_else(|| Error::from_reason(format!("Track at index {} is undefined", i)))?;
        tracks_vec.push(track);
    }

    // Convert playlists from JS array to Vec<PlaylistDefinition>
    let mut playlists_vec = Vec::new();
    for i in 0..playlists.len() {
        let playlist = playlists.get::<models::PlaylistDefinition>(i)
            .map_err(|e| Error::from_reason(format!("Failed to get playlist at index {}: {}", i, e)))?
            .ok_or_else(|| Error::from_reason(format!("Playlist at index {} is undefined", i)))?;
        playlists_vec.push(playlist);
    }

    // Convert all tracks to Music.app format
    let music_app_tracks: Result<Vec<_>> = tracks_vec
        .into_iter()
        .map(converter::convert_swinsian_track_to_music_app_track)
        .collect();
    let music_app_tracks = music_app_tracks?;

    // Serialize to XML
    xml::serialize_library_plist(&music_app_tracks, &playlists_vec)
        .map_err(|e| Error::from_reason(e.to_string()))
}
