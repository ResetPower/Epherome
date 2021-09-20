use winreg::enums::*;
use winreg::RegKey;

fn get_jre_ver() -> Vec<String> {
    let mut java_list: Vec<String> = Vec::new();
    for i in RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags("SOFTWARE\\JavaSoft\\Java Runtime Environment", KEY_READ)
        .unwrap()
        .enum_keys()
        .map(|x| x.unwrap())
        .filter(|x| x.starts_with(""))
    {
        java_list.push(i);
    }
    return java_list;
}

fn get_jdk_ver() -> Vec<String> {
    let mut java_list: Vec<String> = Vec::new();
    for i in RegKey::predef(HKEY_LOCAL_MACHINE)
        .open_subkey_with_flags("SOFTWARE\\JavaSoft\\JDK", KEY_READ)
        .unwrap()
        .enum_keys()
        .map(|x| x.unwrap())
        .filter(|x| x.starts_with(""))
    {
        java_list.push(i);
    }
    return java_list;
}

fn find_jre() -> Vec<String> {
    let reg_key = RegKey::predef(HKEY_LOCAL_MACHINE);
    let java_list = get_jre_ver();
    let mut path_list: Vec<String> = Vec::new();
    for i in &java_list {
        let mut reg_path = String::from("SOFTWARE\\JavaSoft\\Java Runtime Environment\\");
        reg_path.push_str(&i.to_string()[..]);
        let cur_ver = reg_key.open_subkey(&reg_path.to_string()[..]).unwrap();
        let path: String = cur_ver.get_value("JavaHome").unwrap();
        path_list.push(path);
    }
    return path_list;
}

fn find_jdk() -> Vec<String> {
    let reg_key = RegKey::predef(HKEY_LOCAL_MACHINE);
    let java_list = get_jdk_ver();
    let mut path_list: Vec<String> = Vec::new();
    for i in &java_list {
        let mut reg_path = String::from("SOFTWARE\\JavaSoft\\JDK\\");
        reg_path.push_str(&i.to_string()[..]);
        let cur_ver = reg_key.open_subkey(&reg_path.to_string()[..]).unwrap();
        let path: String = cur_ver.get_value("JavaHome").unwrap();
        path_list.push(path);
    }
    return path_list;
}

pub fn find_javas_in_reg(javas: &mut Vec<String>) {
    let jre_path = find_jre();
    let jdk_path = find_jdk();
    for i in jre_path {
        javas.push(i);
    }
    for i in jdk_path {
        javas.push(i);
    }
}
