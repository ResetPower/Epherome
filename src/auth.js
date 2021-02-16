"use strict";

const MOJANG_AUTHSERVER_URL = "https://authserver.mojang.com";

function isSuccess(code) {
    return code === 200 || code === 204;
}

// === yggdrasil authentication part ===

/**
 * callback: function(data, err)
 *   data is a object that contains (token, uuid, name)
 */
function authenticate(url, username, password, callback) {
    fetch(url + "/authenticate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            agent: {
                name: "Minecraft",
                version: 1,
            },
            username: username,
            password: password,
        }),
    }).then(response => {
        if (isSuccess(response.status)) {
            response.json().then(param => {
                let prof = param["selectedProfile"];
                callback(
                    {
                        token: param["accessToken"],
                        uuid: prof["id"],
                        name: prof["name"],
                    },
                    false
                );
            });
        } else {
            callback({}, true);
        }
    });
}

/**
 * callback: function(data, err)
 *   data is a object that contains (token)
 */
function refresh(url, token, callback) {
    fetch(url + "/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: token }),
    }).then(response => {
        if (isSuccess(response.status)) {
            response.json().then(param => {
                callback({ token: param["accessToken"] }, false);
            });
        } else {
            callback({}, true);
        }
    });
}

/**
 * callback: function(err)
 */
function validate(url, token, callback) {
    fetch(url + "/validate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken: token }),
    }).then(response => {
        if (isSuccess(response.status)) {
            callback(false);
        } else {
            callback(true);
        }
    });
}

// === microsoft authentication part ===

function getAuthCode() {
    // TODO MS Auth
}

export { isSuccess, authenticate, validate, refresh, getAuthCode, MOJANG_AUTHSERVER_URL };
