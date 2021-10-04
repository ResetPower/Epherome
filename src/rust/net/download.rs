use futures_util::StreamExt;
use neon::prelude::*;
use std::{
    cmp::min,
    fs::{create_dir_all, File},
    io::Write,
    path::Path,
    time::Duration,
};
use tokio::runtime::Runtime;

use crate::{
    task::{done_task, err_task, register_task, should_task_continue},
    tool::{my_err, send_exchange, MyError},
};

pub async fn download_file_impl_async<T>(
    url: String,
    target: String,
    recursive: bool,
    id: i64,
    enable_show_progress: bool,
    show_progress: T,
    done_task_on_done: bool,
) -> Result<(), MyError>
where
    T: Fn(i64) -> (),
{
    // setup reqwest
    let resp = reqwest::get(&url)
        .await
        .or(my_err("Error occurred requesting"))?;
    let total = resp.content_length().unwrap_or(0);
    // occur error if total length is zero
    if total == 0 {
        return my_err("Total length zero");
    }
    // prepare files
    let target = Path::new(&target);
    if recursive {
        create_dir_all(
            target
                .parent()
                .ok_or(MyError(String::from("Target file has no parent directory")))?,
        )
        .or(my_err("Error occurred creating directory recursively"))?;
    }
    let mut file = File::create(&target).or(my_err("Error occurred creating file"))?;
    // register task
    register_task(id).or(my_err("Error occurred registering task"))?;
    // download chunks
    let mut downloaded: u64 = 0;
    let mut stream = resp.bytes_stream();
    let mut last_percent = -1;
    let mut cancelled = false;
    while let Ok(Some(chunk)) = tokio::time::timeout(Duration::from_secs(5), stream.next()).await {
        if !should_task_continue(id) {
            cancelled = true;
            break;
        }
        let chunk = chunk.or(my_err("Error occurred opening chunk"))?;
        file.write(&chunk)
            .or(my_err("Error occurred writing chunk to file"))?;
        downloaded = min(downloaded + (chunk.len() as u64), total);
        let percent = ((downloaded as f64 / total as f64) * 100.0).floor() as i64;
        if enable_show_progress && percent != last_percent {
            show_progress(percent);
        }
        last_percent = percent;
    }
    if downloaded == total {
        match if done_task_on_done {
            done_task(id)
        } else {
            Ok(())
        } {
            _ => Ok(()),
        }
    } else {
        match err_task(id) {
            _ => {
                if cancelled {
                    my_err("Cancelled")
                } else {
                    my_err("Comes to an abrupt end")
                }
            }
        }
    }
}

pub fn download_file_impl<T>(
    url: String,
    target: String,
    recursive: bool,
    id: i64,
    enable_show_progress: bool,
    show_progress: T,
) -> Result<(), MyError>
where
    T: Fn(i64) -> (),
{
    // setup tokio runtime
    let rt = Runtime::new().or(my_err("Error occurred creating tokio runtime"))?;
    rt.block_on(download_file_impl_async(
        url,
        target,
        recursive,
        id,
        enable_show_progress,
        show_progress,
        true,
    ))
}

pub fn download_file(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let url = c.argument::<JsString>(0)?.value(&mut c);
    let target = c.argument::<JsString>(1)?.value(&mut c);
    let channel = c.channel();
    let callback = c.argument::<JsFunction>(2)?.root(&mut c);
    let id = c.argument::<JsNumber>(3)?.value(&mut c) as i64;
    let enable_show_progress = c.argument::<JsBoolean>(4)?.value(&mut c);
    let mut recursive = false;
    if let Some(Ok(value)) = c
        .argument_opt(5)
        .and_then(|value| Some(value.downcast::<JsBoolean, _>(&mut c)))
    {
        recursive = value.value(&mut c);
    }

    std::thread::spawn(move || {
        let result = download_file_impl(
            url,
            target,
            recursive,
            id,
            enable_show_progress,
            |progress| {
                channel.send(move |mut c| {
                    send_exchange(
                        &mut c,
                        format!("download-file-{}", id),
                        progress.to_string(),
                    )?;
                    Ok(())
                });
            },
        );

        channel.send(|mut c| {
            let callback = callback.into_inner(&mut c);
            let this = c.undefined();
            let args = match result {
                Ok(_) => vec![c.null().upcast::<JsValue>()],
                Err(MyError(msg)) => vec![c.string(msg).upcast()],
            };
            callback.call(&mut c, this, args)?;
            Ok(())
        });
    });

    return Ok(c.undefined());
}
