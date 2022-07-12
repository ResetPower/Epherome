use neon::prelude::*;
use regex::Regex;
use std::process::Command;

pub fn check_java(mut c: FunctionContext) -> JsResult<JsObject> {
    let pathname = c.argument::<JsString>(0)?;
    // run java command line
    let output = Command::new(pathname.value(&mut c))
        .arg("-version")
        .output();
    if let Ok(output) = output {
        let data = String::from_utf8_lossy(&output.stderr);
        let obj = JsObject::new(&mut c);
        obj.set(&mut c, "dir", pathname)?;
        let js_is64bit = c.boolean(data.contains("64-Bit"));
        obj.set(&mut c, "is64Bit", js_is64bit)?;
        // get version in quote
        let re = Regex::new("\"(.*?)\"").unwrap();
        let mut matched = false;
        for cap in re.captures_iter(&data) {
            matched = true;
            let mut chars = cap[0].chars();
            // remove the quote surrounded
            chars.next();
            chars.next_back();
            let js_name = c.string(chars.as_str());
            obj.set(&mut c, "name", js_name)?;
        }
        // fail if regex not matched
        if !matched {
            panic!("Regex not matched")
        }
        return Ok(obj);
    }
    panic!("Internal Error")
}
