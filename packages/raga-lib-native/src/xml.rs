use quick_xml::events::{BytesEnd, BytesStart, BytesText, Event};
use quick_xml::Writer;
use std::io::Cursor;
use std::sync::Arc;

use crate::models::{MusicAppTrackDefinition, PlaylistDefinition};

pub fn serialize_library_plist(
    tracks: &[MusicAppTrackDefinition],
    playlists: &[PlaylistDefinition],
) -> Result<String, quick_xml::Error> {
    let mut writer = Writer::new(Cursor::new(Vec::new()));

    // Write XML header
    writer.write_event(Event::Decl(quick_xml::events::BytesDecl::new(
        "1.0",
        Some("UTF-8"),
        None,
    )))?;

    // Write DOCTYPE
    writer.write_event(Event::DocType(quick_xml::events::BytesText::new(
        "!DOCTYPE plist PUBLIC \"-//Apple Computer//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\"",
    )))?;

    // Start plist
    let mut plist_start = BytesStart::new("plist");
    plist_start.push_attribute(("version", "1.0"));
    writer.write_event(Event::Start(plist_start))?;

    // Start dict
    writer.write_event(Event::Start(BytesStart::new("dict")))?;

    // Write tracks dictionary
    writer.write_event(Event::Start(BytesStart::new("key")))?;
    writer.write_event(Event::Text(BytesText::new("Tracks")))?;
    writer.write_event(Event::End(BytesEnd::new("key")))?;

    writer.write_event(Event::Start(BytesStart::new("dict")))?;

    // Write each track
    for track in tracks {
        writer.write_event(Event::Start(BytesStart::new("key")))?;
        writer.write_event(Event::Text(BytesText::new(&track.base.track_id.to_string())))?;
        writer.write_event(Event::End(BytesEnd::new("key")))?;

        writer.write_event(Event::Start(BytesStart::new("dict")))?;

        // Write track properties
        write_track_properties(&mut writer, track)?;

        writer.write_event(Event::End(BytesEnd::new("dict")))?;
    }

    writer.write_event(Event::End(BytesEnd::new("dict")))?;

    // Write playlists array
    writer.write_event(Event::Start(BytesStart::new("key")))?;
    writer.write_event(Event::Text(BytesText::new("Playlists")))?;
    writer.write_event(Event::End(BytesEnd::new("key")))?;

    writer.write_event(Event::Start(BytesStart::new("array")))?;

    // Write each playlist
    for playlist in playlists {
        writer.write_event(Event::Start(BytesStart::new("dict")))?;
        write_playlist_properties(&mut writer, playlist)?;
        writer.write_event(Event::End(BytesEnd::new("dict")))?;
    }

    writer.write_event(Event::End(BytesEnd::new("array")))?;

    // Close main dict and plist
    writer.write_event(Event::End(BytesEnd::new("dict")))?;
    writer.write_event(Event::End(BytesEnd::new("plist")))?;

    let result = writer.into_inner().into_inner();
    String::from_utf8(result).map_err(|e| quick_xml::Error::Io(Arc::new(std::io::Error::new(std::io::ErrorKind::Other, e))))
}

fn write_track_properties(
    writer: &mut Writer<Cursor<Vec<u8>>>,
    track: &MusicAppTrackDefinition,
) -> Result<(), quick_xml::Error> {
    // Helper macro to write key-value pairs
    macro_rules! write_property {
        ($key:expr, $value:expr) => {
            writer.write_event(Event::Start(BytesStart::new("key")))?;
            writer.write_event(Event::Text(BytesText::new($key)))?;
            writer.write_event(Event::End(BytesEnd::new("key")))?;
            writer.write_event(Event::Text(BytesText::new(&$value.to_string())))?;
        };
    }

    // Write basic properties
    write_property!("Track ID", track.base.track_id);
    write_property!("Persistent ID", track.base.persistent_id);
    write_property!("Location", track.base.location);

    // Write numeric properties
    if let Some(v) = track.base.bit_rate { write_property!("Bit Rate", v); }
    if let Some(v) = track.base.bpm { write_property!("BPM", v); }
    if let Some(v) = track.base.play_count { write_property!("Play Count", v); }
    if let Some(v) = track.base.rating { write_property!("Rating", v); }
    if let Some(v) = track.base.sample_rate { write_property!("Sample Rate", v); }
    if let Some(v) = track.base.size { write_property!("Size", v); }
    if let Some(v) = track.base.total_time { write_property!("Total Time", v); }
    if let Some(v) = track.base.track_number { write_property!("Track Number", v); }
    if let Some(v) = track.base.volume_adjustment { write_property!("Volume Adjustment", v); }
    if let Some(v) = track.base.year { write_property!("Year", v); }

    // Write string properties
    if let Some(v) = &track.base.album_artist { write_property!("Album Artist", v); }
    if let Some(v) = &track.base.album { write_property!("Album", v); }
    if let Some(v) = &track.base.artist { write_property!("Artist", v); }
    if let Some(v) = &track.base.genre { write_property!("Genre", v); }
    if let Some(v) = &track.base.grouping { write_property!("Grouping", v); }
    if let Some(v) = &track.base.name { write_property!("Name", v); }
    if let Some(v) = &track.base.track_type { write_property!("Track Type", v); }

    // Write date properties
    if let Some(v) = &track.base.date_added { write_property!("Date Added", v); }
    if let Some(v) = &track.base.date_modified { write_property!("Date Modified", v); }

    // Write Music.app specific properties
    if let Some(v) = track.artwork_count { write_property!("Artwork Count", v); }
    if let Some(v) = track.file_folder_count { write_property!("File Folder Count", v); }
    if let Some(v) = track.library_folder_count { write_property!("Library Folder Count", v); }
    if let Some(v) = &track.kind { write_property!("Kind", v); }
    if let Some(v) = track.normalization { write_property!("Normalization", v); }
    if let Some(v) = track.loved { write_property!("Loved", v); }

    Ok(())
}

fn write_playlist_properties(
    writer: &mut Writer<Cursor<Vec<u8>>>,
    playlist: &PlaylistDefinition,
) -> Result<(), quick_xml::Error> {
    // Helper macro to write key-value pairs
    macro_rules! write_property {
        ($key:expr, $value:expr) => {
            writer.write_event(Event::Start(BytesStart::new("key")))?;
            writer.write_event(Event::Text(BytesText::new($key)))?;
            writer.write_event(Event::End(BytesEnd::new("key")))?;
            writer.write_event(Event::Text(BytesText::new(&$value.to_string())))?;
        };
    }

    // Write required properties
    write_property!("Name", &playlist.name);
    write_property!("Playlist ID", &playlist.playlist_id);
    write_property!("Playlist Persistent ID", &playlist.playlist_persistent_id);

    // Write optional properties
    if let Some(v) = playlist.all_items { write_property!("All Items", v); }
    if let Some(v) = &playlist.description { write_property!("Description", v); }
    if let Some(v) = playlist.master { write_property!("Master", v); }
    if let Some(v) = &playlist.parent_persistent_id { write_property!("Parent Persistent ID", v); }
    if let Some(v) = playlist.visible { write_property!("Visible", v); }

    // Write playlist items
    writer.write_event(Event::Start(BytesStart::new("key")))?;
    writer.write_event(Event::Text(BytesText::new("Playlist Items")))?;
    writer.write_event(Event::End(BytesEnd::new("key")))?;

    writer.write_event(Event::Start(BytesStart::new("array")))?;
    for item in &playlist.playlist_items {
        writer.write_event(Event::Start(BytesStart::new("dict")))?;
        write_property!("Track ID", item.track_id);
        writer.write_event(Event::End(BytesEnd::new("dict")))?;
    }
    writer.write_event(Event::End(BytesEnd::new("array")))?;

    Ok(())
}
