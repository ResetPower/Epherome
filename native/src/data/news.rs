use neon::prelude::*;
use reqwest::Response;
use scraper::{ElementRef, Html, Selector};
use tokio::runtime::Runtime;

use crate::tool::{my_err, MyError};

// Note that all the news is from MCBBS (A Chinese Minecraft Forum)
// So we will not support English/Japanese/OtherLanguages' news until we find other news API to replace it
// Or you can tell me in the issues if you know some news API (If you have read this line of code)

fn inner(ele: &ElementRef, query_selector: &str) -> Option<String> {
    let selector = Selector::parse(query_selector);
    if let Ok(selector) = selector {
        for i in ele.select(&selector) {
            return Some(i.inner_html());
        }
    }
    None
}

fn parse_element(element: ElementRef) -> (String, String, String) {
    let author = inner(&element, "tr > .by > cite > a").unwrap_or(String::from(""));
    // "time" may in different places
    let mut time = String::from("");
    for i in ["tr > .by > em > span > span", "tr > .by > em > span"].iter() {
        if let Some(thing) = inner(&element, *i) {
            // deal with no-break
            time = thing.replace("&nbsp;", "  ");
            break;
        }
    }
    // "title" may in different places
    let mut title = String::from("");
    for i in [
        "tr > .common > .s.xst",
        "tr > .new > .s.xst",
        "tr > .lock > .s.xst",
    ]
    .iter()
    {
        if let Some(thing) = inner(&element, *i) {
            title = thing;
            break;
        }
    }
    (author, time, title)
}

pub fn fetch_news(mut c: FunctionContext) -> JsResult<JsPromise> {
    let promise = c
        .task(move || {
            (|| -> Result<(Runtime, Response), MyError> {
                let rt = Runtime::new().or(my_err("Error occurred creating tokio runtime"))?;
                let resp = rt
                    .block_on(async {
                        reqwest::get("https://www.mcbbs.net/forum-news-1.html").await
                    })
                    .or(my_err("Error occurred requesting"))?;
                Ok((rt, resp))
            })()
        })
        .promise(move |mut cx, result| {
            let arr = cx.empty_array();
            let selector = Selector::parse("#threadlisttableid > tbody");
            if let Ok((rt, resp)) = result {
                if let (Ok(content), Ok(thread_body_selector)) =
                    (rt.block_on(async { resp.text().await }), selector)
                {
                    let document = Html::parse_document(&content);
                    for element in document.select(&thread_body_selector) {
                        let element_value = element.value();
                        let id = element_value.id().unwrap_or("");
                        // avoid non-news threads
                        if !id.starts_with("normalthread_") {
                            continue;
                        }
                        let thread_id = &id[13..];
                        // extract info from element
                        let (author, time, title) = parse_element(element);
                        // transfer objects to js
                        let obj = cx.empty_object();
                        let url = cx.string(format!(
                            "https://www.mcbbs.net/thread-{}-1-1.html",
                            thread_id
                        ));
                        let author = cx.string(author);
                        let time = cx.string(time);
                        let title = cx.string(title);
                        obj.set(&mut cx, "url", url)?;
                        obj.set(&mut cx, "author", author)?;
                        obj.set(&mut cx, "time", time)?;
                        obj.set(&mut cx, "title", title)?;
                        let len = arr.len(&mut cx);
                        arr.set(&mut cx, len, obj)?;
                    }
                }
            } else {
                panic!("Network Error")
            }
            Ok(arr)
        });

    Ok(promise)
}
