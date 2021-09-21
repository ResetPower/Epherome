use winreg::enums::*;
use winreg::RegKey;

fn get_java_vers() -> Vec<(String, bool)> {
    let mut vers: Vec<(String, bool)> = Vec::new();
    for i in [
        "SOFTWARE\\JavaSoft\\Java Runtime Environment",
        "SOFTWARE\\JavaSoft\\JDK",
    ] {
        if let Ok(subkey) = RegKey::predef(HKEY_LOCAL_MACHINE).open_subkey_with_flags(i, KEY_READ) {
            let is_jdk = i.ends_with("JDK");
            for j in subkey.enum_keys() {
                if let Ok(j) = j {
                    vers.push((j, is_jdk));
                }
            }
        }
    }
    return vers;
}

pub fn find_javas_in_reg(javas: &mut Vec<String>) {
    let reg_key = RegKey::predef(HKEY_LOCAL_MACHINE);
    let java_vers = get_java_vers();
    for i in &java_vers {
        let mut reg_path = String::from(if i.1 {
            "SOFTWARE\\JavaSoft\\JDK\\"
        } else {
            "SOFTWARE\\JavaSoft\\Java Runtime Environment\\"
        });
        reg_path.push_str(&i.0.to_string()[..]);
        if let Ok(cur_ver) = reg_key.open_subkey(&reg_path.to_string()[..]) {
            if let Ok(path) = cur_ver.get_value("JavaHome") {
                javas.push(path);
            }
        }
    }
}
