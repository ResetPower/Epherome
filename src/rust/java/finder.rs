use neon::prelude::*;

use crate::tool::deduplicate;
use env::consts::OS;
use once_cell::sync::Lazy;
use std::path::Path;
use std::{env, fs};
use which::which;

#[cfg(target_os = "windows")]
use super::reg_finder;

static JAVA_FILENAME: Lazy<&str> = Lazy::new(|| {
    if OS == "windows" {
        "java.exe"
    } else {
        "java"
    }
});

// Possible java installation paths.
// If you know more possible installation paths,
// please tell us in the issues
static JAVA_PATHS: Lazy<Vec<&str>> = Lazy::new(|| match OS {
    "windows" => vec!["C:\\Program Files\\Java", "C:\\Program Files (x86)\\Java"],
    "macos" => vec!["/Library/Java/JavaVirtualMachines"],
    "linux" => vec!["/usr/lib/jvm"],
    _ => vec![],
});

pub fn find_javas(mut c: FunctionContext) -> JsResult<JsArray> {
    let mut javas: Vec<String> = vec![];
    // find in JAVA_HOME env var
    if let Ok(java_home) = env::var("JAVA_HOME") {
        if let Some(value) = find_java_executable(Path::new(&java_home)) {
            javas.push(value)
        }
    }
    // find in PATH env var
    if let Ok(java) = which("java") {
        if let Some(value) = fs::canonicalize(java).unwrap().to_str() {
            javas.push(String::from(value));
        }
    }
    // find in paths
    find_in_paths(&mut javas);
    // find in registry (Windows only)
    #[cfg(target_os = "windows")]
    reg_finder::find_javas_in_reg(&mut javas);
    deduplicate(&mut javas);
    let arr = JsArray::new(&mut c, javas.len() as u32 + 1);
    for (i, pathname) in javas.iter().enumerate() {
        let js_pathname = c.string(pathname);
        arr.set(&mut c, i as u32, js_pathname)?;
    }
    Ok(arr)
}

fn find_in_paths(javas: &mut Vec<String>) {
    for pathname in JAVA_PATHS.iter() {
        let path = fs::read_dir(Path::new(pathname));
        if path.is_err() {
            continue;
        }
        for dir in path.unwrap() {
            if dir.is_err() {
                continue;
            }
            if let Some(value) = find_java_executable(dir.unwrap().path().as_path()) {
                javas.push(value)
            }
        }
    }
}

pub fn find_java_executable(path: &Path) -> Option<String> {
    // the pathname is an java executable
    if let Some(value) = resolve_java_executable(&path) {
        return Some(String::from(value));
    }
    // find java executable in possible children
    for dir in ["", "bin", "Home/bin", "Contents/Home/bin"].iter() {
        let exe = path.join(dir).join(JAVA_FILENAME.to_string());
        if let Some(value) = resolve_java_executable(&exe) {
            return Some(String::from(value));
        }
    }
    None
}

fn resolve_java_executable(path: &Path) -> Option<&str> {
    let is_java_executable = path.is_file() && path.file_name()?.to_str()? == *JAVA_FILENAME;
    let pathname = path.to_str()?;
    if is_java_executable {
        return Some(pathname);
    }
    None
}
