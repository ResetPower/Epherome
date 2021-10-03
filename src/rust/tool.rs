use neon::{prelude::*, result::Throw};

pub fn deduplicate<T: PartialEq + Clone>(vec: &mut Vec<T>) {
    let mut seen = vec![];
    vec.retain(|item| match seen.contains(item) {
        true => false,
        _ => {
            seen.push(item.clone());
            true
        }
    })
}

pub struct MyError(pub String);

pub fn my_err<T>(msg: &str) -> Result<T, MyError> {
    Err(MyError(String::from(msg)))
}

pub fn send_exchange<'a, C: Context<'a>>(
    c: &mut C,
    tunnel: String,
    arg: String,
) -> Result<(), Throw> {
    let f = c
        .global()
        .get(c, "window")?
        .downcast_or_throw::<JsObject, _>(c)?
        .get(c, "exchange")?
        .downcast_or_throw::<JsObject, _>(c)?
        .get(c, "send")?
        .downcast_or_throw::<JsFunction, _>(c)?;
    let this = c.undefined();
    let args = vec![c.string(tunnel), c.string(arg)];
    f.call(c, this, args)?;
    Ok(())
}
