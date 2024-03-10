use std::{env, process};

#[tauri::command]
pub fn reveal_path(pathname: String) -> Result<(), String> {
    let cmd = match env::consts::OS {
        "windows" => "explorer",
        "macos" => "open",
        "linux" => "xdg-open",
        &_ => return Err(String::from("Unknown operating system type.")),
    };
    process::Command::new(cmd).arg(pathname).spawn().unwrap();
    Ok(())
}
