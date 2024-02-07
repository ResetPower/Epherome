use std::process::Command;

#[tauri::command]
pub async fn run_minecraft(pwd: String, java: String, args: Vec<String>) -> Result<(), String> {
    Command::new(java)
        .current_dir(pwd)
        .args(args)
        .spawn()
        .unwrap();
    Ok(())
}
