use neon::prelude::*;
use std::{
    error::Error,
    fs::{read, read_dir, File},
    io::{Seek, Write},
    path::PathBuf,
};
use zip::{write::FileOptions, ZipWriter};

fn write_folder<W>(
    prefix: &str,
    folder: &PathBuf,
    writer: &mut ZipWriter<W>,
) -> Result<(), Box<dyn Error>>
where
    W: Write + Seek,
{
    let paths = read_dir(folder)?;
    for path in paths {
        let path = path?;
        let file_type = path.file_type()?;
        if file_type.is_dir() {
            write_folder(
                &format!(
                    "{}/{}",
                    prefix,
                    path.file_name().to_str().unwrap_or("Unknown")
                ),
                &path.path(),
                writer,
            )?;
        } else if file_type.is_file() {
            writer.start_file(
                format!(
                    "{}/{}",
                    prefix,
                    path.file_name().to_str().unwrap_or("Unknown")
                ),
                FileOptions::default(),
            )?;
            writer.write_all(&read(path.path())?)?;
        }
    }
    Ok(())
}

fn compress_zip(folder: &str, target: &str) -> Result<(), Box<dyn Error>> {
    let mut buf = File::create(target)?;
    let mut writer = ZipWriter::new(&mut buf);
    write_folder("", &PathBuf::new().join(folder), &mut writer)?;
    writer.finish()?;
    Ok(())
}

pub fn js_compress_zip(mut c: FunctionContext) -> JsResult<JsPromise> {
    let folder = c.argument::<JsString>(0)?.value(&mut c);
    let target = c.argument::<JsString>(1)?.value(&mut c);

    let promise = c
        .task(move || compress_zip(&folder, &target).is_ok())
        .promise(move |mut cx, status| Ok(cx.boolean(status)));

    Ok(promise)
}
