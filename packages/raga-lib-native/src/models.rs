use napi::bindgen_prelude::*;
use napi_derive::napi;
use serde::{Deserialize, Serialize};

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BasicTrackDefinition {
    #[serde(rename = "Track ID")]
    pub track_id: i32,
    #[serde(rename = "Persistent ID")]
    pub persistent_id: String,
    #[serde(rename = "Location")]
    pub location: String,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrackDefinition {
    // Basic properties
    #[serde(rename = "Track ID")]
    pub track_id: i32,
    #[serde(rename = "Persistent ID")]
    pub persistent_id: String,
    #[serde(rename = "Location")]
    pub location: String,

    // Numeric properties
    #[serde(rename = "Bit Rate")]
    pub bit_rate: Option<i32>,
    #[serde(rename = "BPM")]
    pub bpm: Option<i32>,
    #[serde(rename = "Play Count")]
    pub play_count: Option<i32>,
    #[serde(rename = "Rating")]
    pub rating: Option<i32>,
    #[serde(rename = "Sample Rate")]
    pub sample_rate: Option<i32>,
    #[serde(rename = "Size")]
    pub size: Option<i32>,
    #[serde(rename = "Total Time")]
    pub total_time: Option<i32>,
    #[serde(rename = "Track Number")]
    pub track_number: Option<i32>,
    #[serde(rename = "Volume Adjustment")]
    pub volume_adjustment: Option<i32>,
    #[serde(rename = "Year")]
    pub year: Option<i32>,

    // String properties
    #[serde(rename = "Album Artist")]
    pub album_artist: Option<String>,
    #[serde(rename = "Album")]
    pub album: Option<String>,
    #[serde(rename = "Artist")]
    pub artist: Option<String>,
    #[serde(rename = "Genre")]
    pub genre: Option<String>,
    #[serde(rename = "Grouping")]
    pub grouping: Option<String>,
    #[serde(rename = "Name")]
    pub name: Option<String>,
    #[serde(rename = "Track Type")]
    pub track_type: Option<String>,

    // Date properties (stored as ISO strings)
    #[serde(rename = "Date Added")]
    pub date_added: Option<String>,
    #[serde(rename = "Date Modified")]
    pub date_modified: Option<String>,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicAppTrackDefinition {
    #[serde(flatten)]
    pub base: TrackDefinition,
    #[serde(rename = "Artwork Count")]
    pub artwork_count: Option<i32>,
    #[serde(rename = "File Folder Count")]
    pub file_folder_count: Option<i32>,
    #[serde(rename = "Library Folder Count")]
    pub library_folder_count: Option<i32>,
    #[serde(rename = "Kind")]
    pub kind: Option<String>,
    #[serde(rename = "Normalization")]
    pub normalization: Option<i32>,
    #[serde(rename = "Loved")]
    pub loved: Option<bool>,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaylistItem {
    #[serde(rename = "Track ID")]
    pub track_id: i32,
}

#[napi(object)]
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlaylistDefinition {
    #[serde(rename = "All Items")]
    pub all_items: Option<bool>,
    pub description: Option<String>,
    pub master: Option<bool>,
    pub name: String,
    #[serde(rename = "Parent Persistent ID")]
    pub parent_persistent_id: Option<String>,
    #[serde(rename = "Playlist ID")]
    pub playlist_id: String,
    #[serde(rename = "Playlist Items")]
    pub playlist_items: Vec<PlaylistItem>,
    #[serde(rename = "Playlist Persistent ID")]
    pub playlist_persistent_id: String,
    pub visible: Option<bool>,
}
