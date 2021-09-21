use neon::prelude::*;
use std::{fs, io, path::Path};
use zip::ZipArchive;

pub fn extract_zip(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let zip_filepath = c.argument::<JsString>(0)?.value(&mut c);
    let target = c.argument::<JsString>(1)?.value(&mut c);
    let target = Path::new(&target);
    // create dir if target not exists
    if !target.exists() {
        fs::create_dir_all(&target).unwrap();
    }

    let mut archive = ZipArchive::new(fs::File::open(&zip_filepath).unwrap()).unwrap();
    for i in 0..archive.len() {
        let mut item = archive.by_index(i).unwrap();
        let item_path = match item.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        let item_path = target.join(item_path);
        if (item.name()).ends_with('/') {
            // create folder if item is a folder
            fs::create_dir_all(&item_path).unwrap();
        } else {
            // create file if item is a file
            if let Some(parent) = item_path.parent() {
                if !parent.exists() {
                    // create parent folder
                    fs::create_dir_all(&parent).unwrap();
                }
            }
            let mut file = fs::File::create(&item_path).unwrap();
            io::copy(&mut item, &mut file).unwrap();
        }
        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = item.unix_mode() {
                fs::set_permissions(&item_path, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
    }
    Ok(c.undefined())
}
