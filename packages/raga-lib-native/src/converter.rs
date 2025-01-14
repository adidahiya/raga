use std::path::Path;

use napi::bindgen_prelude::*;
use napi_derive::napi;

use crate::models::{MusicAppTrackDefinition, TrackDefinition};

#[napi]
pub fn convert_swinsian_track_to_music_app_track(track: TrackDefinition) -> Result<MusicAppTrackDefinition> {
    let extension = Path::new(&track.location)
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("");

    let kind = match extension {
        "aif" | "aiff" => "AIFF",
        "flac" => "FLAC",
        "wav" => "WAV",
        _ => "MPEG",
    };

    // Convert persistent ID from decimal to hex, padded to 16 characters
    let persistent_id = format!(
        "{:016x}",
        u64::from_str_radix(&track.persistent_id, 10).unwrap_or(0)
    );

    Ok(MusicAppTrackDefinition {
        base: TrackDefinition {
            persistent_id,
            ..track
        },
        artwork_count: Some(1),
        file_folder_count: Some(-1),
        library_folder_count: Some(-1),
        kind: Some(format!("{} audio file", kind)),
        normalization: Some(0),
        loved: Some(false),
    })
}
