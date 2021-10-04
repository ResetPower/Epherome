use futures::{stream, StreamExt};
use neon::prelude::*;
use std::sync::Arc;
use tokio::runtime::Runtime;

use crate::{
    task::{done_task, register_task},
    tool::{my_err, send_exchange, MyError},
};

use super::download::download_file_impl_async;

struct DownloadItem {
    pub unique: i64,
    pub url: String,
    pub target: String,
    pub in_progress: bool,
}

impl DownloadItem {
    pub fn new(unique: i64, url: String, target: String) -> DownloadItem {
        DownloadItem {
            unique,
            url,
            target,
            in_progress: false,
        }
    }
}

fn parallel_download_impl(
    id: i64,
    items: &mut Vec<DownloadItem>,
    channel: &Channel,
    concurrency: usize,
) -> Result<(), MyError> {
    register_task(id).or(my_err("Error occurred registering task"))?;
    let rt = Runtime::new().or(my_err("Error occurred creating tokio runtime"))?;
    let list = items.into_iter().map(|i| async move {
        let uni = i.unique;
        let r = download_file_impl_async(
            i.url.clone(),
            i.target.clone(),
            true,
            id,
            true,
            |progress| {
                channel.send(move |mut c| {
                    send_exchange(
                        &mut c,
                        format!("parallel-download-{}-progress", id),
                        format!("{}-{}", uni, progress),
                    )
                });
            },
            false,
        )
        .await;
        if let Err(MyError(msg)) = r {
            println!(">>> Fuck you!!! >>> Error: {}", msg);
        }
    });
    let stream = stream::iter(list)
        .buffer_unordered(concurrency)
        .collect::<Vec<()>>();
    rt.block_on(stream);
    done_task(id).or(my_err("Error occurred making task done"))?;
    Ok(())
}

pub fn parallel_download(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let js_items = c.argument::<JsArray>(0)?.to_vec(&mut c)?;
    let id = c.argument::<JsNumber>(2)?.value(&mut c) as i64;
    let concurrency = c.argument::<JsNumber>(1)?.value(&mut c).floor() as usize;
    let channel: Arc<Channel> = Arc::new(c.channel());

    let mut items: Vec<DownloadItem> = Vec::new();
    for js_item in js_items {
        let value = js_item.downcast_or_throw::<JsObject, _>(&mut c)?;
        items.push(DownloadItem::new(
            value
                .get(&mut c, "unique")?
                .downcast_or_throw::<JsNumber, _>(&mut c)?
                .value(&mut c) as i64,
            value
                .get(&mut c, "url")?
                .downcast_or_throw::<JsString, _>(&mut c)?
                .value(&mut c),
            value
                .get(&mut c, "target")?
                .downcast_or_throw::<JsString, _>(&mut c)?
                .value(&mut c),
        ));
    }

    std::thread::spawn(move || {
        let result = parallel_download_impl(id, &mut items, &channel, concurrency);
        channel.send(move |mut c| {
            if let Err(MyError(msg)) = result {
                send_exchange(&mut c, format!("parallel-download-{}-err", id), msg)
            } else {
                send_exchange(
                    &mut c,
                    format!("parallel-download-{}-done", id),
                    String::from(""),
                )
            }
        });
    });

    Ok(c.undefined())
}
