use std::sync::{Arc, Mutex};

use neon::prelude::*;

use crate::{
    task::{done_task, register_task, should_task_continue},
    tool::{my_err, send_exchange, MyError},
};

use super::download::download_file_impl;

struct DownloadItem {
    pub unique: i64,
    pub url: String,
    pub target: String,
}

pub fn parallel_download(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let js_items = c.argument::<JsArray>(0)?.to_vec(&mut c)?;
    let concurrency = c.argument::<JsNumber>(1)?.value(&mut c).floor() as usize;
    let id = c.argument::<JsNumber>(2)?.value(&mut c) as i64;
    let channel: Arc<Channel> = Arc::new(c.channel());

    let mut items: Vec<DownloadItem> = Vec::new();
    let in_progress: Arc<Mutex<Vec<usize>>> = Arc::new(Mutex::new(Vec::new()));
    for js_item in js_items {
        let value = js_item.downcast_or_throw::<JsObject, _>(&mut c)?;
        items.push(DownloadItem {
            unique: value
                .get(&mut c, "unique")?
                .downcast_or_throw::<JsNumber, _>(&mut c)?
                .value(&mut c) as i64,
            url: value
                .get(&mut c, "url")?
                .downcast_or_throw::<JsString, _>(&mut c)?
                .value(&mut c),
            target: value
                .get(&mut c, "target")?
                .downcast_or_throw::<JsString, _>(&mut c)?
                .value(&mut c),
        });
    }
    let total = items.len();
    let items: Arc<Mutex<Vec<DownloadItem>>> = Arc::new(Mutex::new(items));

    register_task(id).unwrap();

    fn def_check(
        items: Arc<Mutex<Vec<DownloadItem>>>,
        in_progress: Arc<Mutex<Vec<usize>>>,
        total: usize,
        concurrency: usize,
        id: i64,
        channel: Arc<Channel>,
    ) -> Result<(), MyError> {
        let t_items = items.lock().or(my_err("Error occurred locking items"))?;
        if t_items.len() == 0 {
            done_task(id).or(my_err("Error occurred making task done"))?;
            channel.send(move |mut c| {
                send_exchange(
                    &mut c,
                    format!("parallel-download-{}-done", id),
                    String::from(""),
                )
            });
        }
        if !should_task_continue(id) {
            return my_err("Cancelled");
        }
        for (index, item) in t_items.iter().enumerate() {
            let mut ip = in_progress
                .lock()
                .or(my_err("Error occurred locking in_progress"))?;
            if ip.len() < concurrency {
                ip.push(index);
                let items = items.clone();
                let in_progress = in_progress.clone();
                let url = item.url.clone();
                let target = item.target.clone();
                let channel = channel.clone();
                let uni = item.unique;
                std::thread::spawn(move || -> Result<(), MyError> {
                    download_file_impl(url, target, true, id, true, |progress| {
                        channel.send(move |mut c| {
                            send_exchange(
                                &mut c,
                                format!("parallel-download-{}-progress", id),
                                format!("{}-{}", uni, progress),
                            )
                        });
                    })?;
                    let mut ip = in_progress
                        .lock()
                        .or(my_err("Error occurred locking in_progress (in sub-thread)"))?;
                    ip.retain(|x| x != &index);
                    drop(ip);
                    let mut ti = items
                        .lock()
                        .or(my_err("Error occurred locking items (in sub-thread)"))?;
                    if let Some(_) = ti.get(index) {
                        ti.remove(index);
                    }
                    drop(ti);
                    def_check(items, in_progress, total, concurrency, id, channel)?;
                    Ok(())
                });
            }
        }
        Ok(())
    }

    let channel_ = channel.clone();
    if let Err(MyError(msg)) = def_check(items, in_progress, total, concurrency, id, channel) {
        channel_
            .send(move |mut c| send_exchange(&mut c, format!("parallel-download-{}-err", id), msg));
    }

    Ok(c.undefined())
}
