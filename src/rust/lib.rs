mod java;
mod tool;

use neon::prelude::*;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("Hello JavaScript! I'm from Rust!"))
}

#[neon::main]
fn main(mut c: ModuleContext) -> NeonResult<()> {
    c.export_function("hello", hello)?;
    c.export_function("findJavas", java::finder::find_javas)?;
    c.export_function("checkJava", java::checker::check_java)?;
    Ok(())
}
