"use strict";

import { log4js, isEmpty, isNotEmpty, e } from "@/utils";
import { App as vm, i18n, router } from "@/main";

const lr = log4js.getLogger("route");

// update pages
function onRouteChange(to, from) {
    // clean app bar
    switch (from) {
        case "accounts":
            e("tgllr-acc").classList.remove("eph-btn-active");
            break;
        case "profiles":
            e("tgllr-pro").classList.remove("eph-btn-active");
            break;
        case "settings":
            e("tgllr-set").classList.remove("eph-btn-active");
            break;
    }
    // if current pages is home pages
    if (to === "" && from !== "") {
        vm.methods.updateTitle("Epherome");
    }
    // update title
    if (to !== "") {
        switch (to) {
            case "accounts":
                vm.methods.updateTitle(i18n.messages[i18n.locale]["accounts"]);
                e("tgllr-acc").classList.add("eph-btn-active");
                break;
            case "profiles":
                vm.methods.updateTitle(i18n.messages[i18n.locale]["profiles"]);
                e("tgllr-pro").classList.add("eph-btn-active");
                break;
            case "settings":
                vm.methods.updateTitle(i18n.messages[i18n.locale]["settings"]);
                e("tgllr-set").classList.add("eph-btn-active");
                break;
            case "new-acc":
                vm.methods.updateTitle(i18n.messages[i18n.locale]["new-account"]);
                break;
            case "new-pro":
                vm.methods.updateTitle(i18n.messages[i18n.locale]["new-profile"]);
                break;
        }
    }
    lr.info("Updated pages");
}

function getPage(uri = "") {
    let arr = [];
    if (isEmpty(uri)) {
        arr = location.hash.substr(1).split("/"); // all pages from the location hash
    } else {
        arr = uri.split("/");
    }
    return arr[arr.length - 1];
}

function backPage() {
    let page = getPage();
    if (isNotEmpty(page)) {
        let arr = location.hash.substr(1).split("/"); // all pages from the location hash
        arr.pop();
        let link = arr.join("/"); // merge new uri string
        if (isEmpty(link)) {
            link = "/"; // back to the home pages
        }
        onRouteChange(getPage(link), page); // update pages
        router.replace(link);
        lr.info("Back pages triggered");
    }
}

function jumpPage(name) {
    let page = getPage();
    let uri = location.hash.substr(1); // current uri from the location hash
    if (page !== name) {
        onRouteChange(name, page); // update pages
        router.replace(uri + "/" + name); // append pages on the current uri
    }
    lr.info(`Jump page triggered. From ${page} to ${name}`);
}

/**
 * toggle pages on the top app bar
 */
function togglePage(name) {
    let page = getPage();
    if (page !== name) {
        onRouteChange(name, page); // update pages
        router.replace("/" + name);
    }
    lr.info(`Toggle page triggered. From ${page} to ${name}`);
}

export { onRouteChange, getPage, backPage, jumpPage, togglePage };
