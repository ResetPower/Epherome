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
