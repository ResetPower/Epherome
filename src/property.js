"use strict";

import Store from "electron-store";
import { log4js } from "@/utils";

const lp = log4js.getLogger("property");
const store = new Store();

// initialize property system
function initProperty() {
    if (typeof readProperty("language") === "undefined") {
        lp.warn("Property language not exist, creating");
        let sysLang = navigator.language.toLowerCase();
        if (sysLang.startsWith("zh")) {
            writeProperty("language", "zh-cn");
        } else {
            writeProperty("language", "en-us");
        }
    }
    if (typeof readProperty("java-path") === "undefined") {
        lp.warn("Property java-path not exist, creating");
        writeProperty("java-path", "java");
    }
}

// read property from memory
function readProperty(key, def = undefined) {
    let ret = store.get(key);
    if (typeof ret === "undefined") {
        ret = def;
    }
    return ret;
}

// write property to memory
function writeProperty(key, val) {
    store.set(key, val);
}

/**
 * act: function(obj), return obj
 */
function operateProperty(key, act, def) {
    let val = store.get(key);
    // check if the value is not defined
    if (typeof val === "undefined") {
        val = def;
    }
    writeProperty(key, act(val));
    lp.info("Property operating triggered, updated key: " + key);
}

export { initProperty, readProperty, writeProperty, operateProperty };
