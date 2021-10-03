use neon::prelude::*;
use reqwest::{
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    Client, Response,
};
use tokio::runtime::Runtime;

use crate::tool::{my_err, MyError};

pub mod download;
pub mod parallel;

pub fn request(mut c: FunctionContext) -> JsResult<JsUndefined> {
    let method = c.argument::<JsString>(0)?.value(&mut c);
    let url = c.argument::<JsString>(1)?.value(&mut c);
    let callback = c.argument::<JsFunction>(2)?.root(&mut c);
    let mut payload = String::from("");
    if let Some(value) = c.argument_opt(3) {
        if let Ok(value) = value.downcast::<JsString, _>(&mut c) {
            payload = value.value(&mut c);
        }
    }
    let mut authorization = String::from("");
    if let Some(value) = c.argument_opt(4) {
        if let Ok(value) = value.downcast::<JsString, _>(&mut c) {
            authorization = value.value(&mut c);
        }
    }
    let mut content_type_form = false;
    if let Some(value) = c.argument_opt(5) {
        if let Ok(value) = value.downcast::<JsBoolean, _>(&mut c) {
            content_type_form = value.value(&mut c);
        }
    }
    let channel = c.channel();

    std::thread::spawn(move || {
        let result = (|| -> Result<(Runtime, Response), MyError> {
            let rt = Runtime::new().or(my_err("Error occurred creating tokio runtime"))?;
            let client = Client::new();
            let resp = rt
                .block_on(if method == "post" {
                    client
                        .post(url)
                        .header(
                            CONTENT_TYPE,
                            if content_type_form {
                                "application/x-www-form-urlencoded"
                            } else {
                                "application/json"
                            },
                        )
                        .header(ACCEPT, "application/json")
                        .header(AUTHORIZATION, authorization)
                        .body(payload)
                        .send()
                } else {
                    client.get(url).send()
                })
                .or(my_err("Error occurred requesting"))?;
            Ok((rt, resp))
        })();
        channel.send(move |mut c| {
            let callback = callback.into_inner(&mut c);
            let this = c.undefined();
            let up_null = c.null().upcast();
            let args: Vec<Handle<JsValue>> = if let Ok((rt, resp)) = result {
                let status = resp.status();
                let text = rt.block_on(resp.text());
                if let Ok(text) = text {
                    let arr = c.empty_array();
                    let status = c.number(status.as_u16());
                    let body = c.string(text);
                    arr.set(&mut c, 0, status)?;
                    arr.set(&mut c, 1, body)?;
                    vec![up_null, arr.upcast()]
                } else {
                    vec![up_null, up_null]
                }
            } else {
                vec![c.string("Error").upcast(), up_null]
            };
            callback.call(&mut c, this, args)?;
            Ok(())
        });
    });

    Ok(c.undefined())
}
