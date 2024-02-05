use std::{fs, path};
use zip::ZipArchive;

#[tauri::command]
pub async fn extract_zip(zipfile: String, target: String) -> Result<(), String> {
    let zipfile = fs::File::open(zipfile).unwrap();
    let target = path::Path::new(&target);

    let mut archive = ZipArchive::new(zipfile).unwrap();

    if let Err(_) = archive.extract(target) {
        return Err(String::from("Internal error occurred."));
    };

    Ok(())
}
