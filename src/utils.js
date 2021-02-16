"use strict";

import log4js from "log4js";

const JWT_META_BASE64 = "eyJhbGciOiAiTk9ORSIsICJ0eXBlIjogIkpXVCJ9";

log4js.configure({
    appenders: {
        out: { type: "stdout" },
    },
    categories: {
        index: { appenders: ["out"], level: "debug" },
        property: { appenders: ["out"], level: "debug" },
        auth: { appenders: ["out"], level: "debug" },
        route: { appenders: ["out"], level: "debug" },
        core: { appenders: ["out"], level: "debug" },
        minecraft: { appenders: ["out"], level: "debug" },
        default: { appenders: ["out"], level: "debug" },
    },
});

// get element from id
function e(id) {
    return document.getElementById(id);
}

function genUUID() {
    let result = "";
    for (let j = 0; j < 32; j++) {
        let i = Math.floor(Math.random() * 16)
            .toString(16)
            .toLowerCase();
        result = result + i;
    }
    // return a string with 32 chars
    return result;
}

function genOfflineToken(name) {
    let payload = {
        name: encodeURIComponent(name),
    };
    return `${JWT_META_BASE64}.${btoa(JSON.stringify(payload))}.${Math.random()}`;
}

function isEmpty(str) {
    return str.trim() === "" || typeof str === "undefined" || str === null;
}

function isNotEmpty(str) {
    return !isEmpty(str);
}

function removePrefix(former, prefix) {
    if (former.startsWith(prefix)) {
        return former.substring(prefix.length, former.length);
    } else {
        return former;
    }
}

function removeSuffix(former, suffix) {
    if (former.endsWith(suffix)) {
        return former.substring(0, former.length - suffix.length);
    } else {
        return former;
    }
}

// resolve url of authentication server
function resolveAuthServerURL(server) {
    let url = removeSuffix(server, "/");
    let ret = "";
    if (url.indexOf("authserver") === -1) {
        // no "authserver" in url, add it
        ret = url + "/authserver";
    }
    return ret;
}

function getArrayElementById(arr, id) {
    for (let i in arr) {
        if (arr[i]["id"] === id) {
            return arr[i];
        }
    }
    return undefined;
}

function getArrayNewElementId(arr) {
    let len = arr.length;
    return len === 0 ? 0 : arr[len - 1]["id"] + 1;
}

export {
    log4js,
    e,
    genUUID,
    genOfflineToken,
    isEmpty,
    isNotEmpty,
    removeSuffix,
    removePrefix,
    resolveAuthServerURL,
    getArrayElementById,
    getArrayNewElementId,
};
