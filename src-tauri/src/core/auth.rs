use tauri::Manager;

#[tauri::command]
pub fn get_microsoft_auth_code(app_handle: tauri::AppHandle) {
    tauri::WindowBuilder::new(
        &app_handle,
        "oauth",
        tauri::WindowUrl::External(
            "https://login.live.com/oauth20_authorize.srf\
                ?client_id=00000000402b5328\
                &response_type=code\
                &prompt=login\
                &scope=service%3A%3Auser.auth.xboxlive.com%3A%3AMBI_SSL\
                &redirect_uri=https%3A%2F%2Flogin.live.com%2Foauth20_desktop.srf"
                .parse()
                .unwrap(),
        ),
    )
    .title("Log in to Microsoft...")
    .on_navigation(|url| {
        let prefix = "https://login.live.com/oauth20_desktop.srf?";
        let url = url.to_string();
        if url.starts_with(prefix) {
            let auth_code = url.replace(prefix, "");
            if let Some(app_handle) = crate::INSTANCE.get() {
                app_handle.emit_all("auth-code", auth_code).unwrap();
                if let Some(window) = app_handle.get_window("oauth") {
                    window.close().unwrap();
                }
            }
        }
        true
    })
    .build()
    .unwrap();
}
