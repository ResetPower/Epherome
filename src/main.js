"use strict";

import Vue from "vue";
import VueRouter from "vue-router";
import VueI18n from "vue-i18n";
import App from "@/App.vue";
import vuetify from "@/plugins/vuetify";
import Home from "@/components/Home";
import Accounts from "@/components/Accounts";
import Profiles from "@/components/Profiles";
import Settings from "@/components/Settings";
import NewAccount from "@/components/NewAccount";
import NewProfile from "@/components/NewProfile";
import { log4js } from "@/utils";
import { initProperty, readProperty } from "@/property";
import "material-design-icons-iconfont/dist/material-design-icons.css";
import "typeface-roboto/index.css";
import "animate.css/animate.min.css";
import i18nMap from "./assets/language.json";
import { ipcRenderer } from "electron";

const li = log4js.getLogger("index");

li.info("### Web Page Started to Load ###");

let userDataPath = "";

ipcRenderer.on("userDataPath", (ev, args) => {
    userDataPath = args[0] + "/config.json";
});

li.info("Initializing property");
initProperty();

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(VueI18n);

const router = new VueRouter({
    routes: [
        {
            path: "/",
            component: Home,
        },
        {
            path: "/accounts",
            component: Accounts,
        },
        {
            path: "/profiles",
            component: Profiles,
        },
        {
            path: "/settings",
            component: Settings,
        },
        {
            path: "/accounts/new-acc",
            component: NewAccount,
        },
        {
            path: "/profiles/new-pro",
            component: NewProfile,
        },
    ],
});

const i18n = new VueI18n({
    locale: readProperty("language"),
    messages: i18nMap,
});

new Vue({
    vuetify,
    router,
    i18n,
    render: h => {
        return h(App);
    },
}).$mount("#app");

export { App, i18n, router, userDataPath };
