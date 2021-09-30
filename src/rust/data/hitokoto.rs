use std::collections::HashMap;

use neon::prelude::*;

pub fn fetch_hitokoto(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let callback = c.argument::<JsFunction>(0)?.root(&mut c);
    let channel = c.channel();
    std::thread::spawn(move || {
        let resp = reqwest::blocking::get("https://epherome.com/api/hitokoto");
        channel.send(move |mut c| {
            let callback = callback.into_inner(&mut c);
            let this = c.undefined();
            let obj = c.empty_object();
            let mut msg = "";
            if let Ok(resp) = resp {
                if let Ok(json) = resp.json::<HashMap<String, String>>() {
                    // must have key "content" and "from"
                    for i in ["content", "from"].iter() {
                        let value = json.get(*i);
                        if let Some(value) = value {
                            let value = c.string(value);
                            obj.set(&mut c, *i, value)?;
                        } else {
                            msg = "JSON structure is wrong";
                        }
                    }
                }
            } else {
                msg = "Network Error";
            }
            let args = match msg {
                "" => vec![c.null().upcast::<JsValue>(), obj.upcast()],
                _ => vec![c.string(msg).upcast(), c.null().upcast()],
            };
            callback.call(&mut c, this, args)?;
            Ok(())
        });
    });
    Ok(c.undefined())
}
