use neon::prelude::*;
use std::{error::Error, fs, io, path::Path};
use zip::ZipArchive;

pub fn extract_zip(zip: &str, target: &str) -> Result<(), Box<dyn Error>> {
    let target = Path::new(&target);
    // create dir if target not exists
    if !target.exists() {
        fs::create_dir_all(&target)?;
    }

    let mut archive = ZipArchive::new(fs::File::open(&zip)?)?;
    for i in 0..archive.len() {
        let mut item = archive.by_index(i)?;
        let item_path = match item.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        let item_path = target.join(item_path);
        if (item.name()).ends_with('/') {
            // create folder if item is a folder
            fs::create_dir_all(&item_path)?;
        } else {
            // create file if item is a file
            if let Some(parent) = item_path.parent() {
                if !parent.exists() {
                    // create parent folder
                    fs::create_dir_all(&parent)?;
                }
            }
            let mut file = fs::File::create(&item_path)?;
            io::copy(&mut item, &mut file)?;
        }
        // Get and Set permissions
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = item.unix_mode() {
                fs::set_permissions(&item_path, fs::Permissions::from_mode(mode)).ok();
            }
        }
    }
    Ok(())
}

pub fn js_extract_zip(mut c: FunctionContext) -> JsResult<JsPromise> {
    let zip = c.argument::<JsString>(0)?.value(&mut c);
    let target = c.argument::<JsString>(1)?.value(&mut c);

    let promise = c
        .task(move || extract_zip(&zip, &target).is_ok())
        .promise(move |mut cx, status| Ok(cx.boolean(status)));

    Ok(promise)
}
