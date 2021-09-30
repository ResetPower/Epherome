use neon::prelude::*;
use scraper::{ElementRef, Html, Selector};

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

pub fn fetch_news(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let callback = c.argument::<JsFunction>(0)?.root(&mut c);
    let channel = c.channel();
    std::thread::spawn(move || {
        let resp = reqwest::blocking::get("https://www.mcbbs.net/forum-news-1.html");
        channel.send(move |mut c| {
            let callback = callback.into_inner(&mut c);
            let this = c.undefined();
            let arr = c.empty_array();
            let mut msg = "";
            let selector = Selector::parse("#threadlisttableid > tbody");
            if let Ok(resp) = resp {
                if let (Ok(content), Ok(thread_body_selector)) = (resp.text(), selector) {
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
                        let obj = c.empty_object();
                        let url = c.string(format!(
                            "https://www.mcbbs.net/thread-{}-1-1.html",
                            thread_id
                        ));
                        let author = c.string(author);
                        let time = c.string(time);
                        let title = c.string(title);
                        obj.set(&mut c, "url", url)?;
                        obj.set(&mut c, "author", author)?;
                        obj.set(&mut c, "time", time)?;
                        obj.set(&mut c, "title", title)?;
                        let len = arr.len(&mut c);
                        arr.set(&mut c, len, obj)?;
                    }
                }
            } else {
                msg = "Network Error"
            }
            let args = match msg {
                "" => vec![c.null().upcast::<JsValue>(), arr.upcast()],
                _ => vec![c.string(msg).upcast()],
            };
            callback.call(&mut c, this, args)?;
            Ok(())
        });
    });
    Ok(c.undefined())
}
