mod data;
mod java;
mod tool;
mod unzip;

use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("Hello JavaScript! I'm from Rust!"))
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("hello", hello)?;
    cx.export_function("findJavas", java::finder::find_javas)?;
    cx.export_function("findJavaExecutable", java::finder::find_java_executable)?;
    cx.export_function("checkJava", java::checker::check_java)?;
    cx.export_function("extractZip", unzip::js_extract_zip)?;
    cx.export_function("fetchNews", data::news::fetch_news)?;
    Ok(())
}
