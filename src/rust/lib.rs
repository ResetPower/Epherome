mod data;
mod java;
mod tool;
mod unzip;

use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("Hello JavaScript! I'm from Rust!"))
}

#[neon::main]
fn main(mut c: ModuleContext) -> NeonResult<()> {
    c.export_function("hello", hello)?;
    c.export_function("findJavas", java::finder::find_javas)?;
    c.export_function("findJavaExecutable", java::finder::find_java_executable)?;
    c.export_function("checkJava", java::checker::check_java)?;
    c.export_function("extractZip", unzip::extract_zip)?;
    c.export_function("fetchHitokoto", data::hitokoto::fetch_hitokoto)?;
    c.export_function("fetchNews", data::news::fetch_news)?;
    Ok(())
}
