<template>
    <v-container>
        <v-tabs v-on:change="changeTab">
            <v-tab> {{ $t("mode.mojang") }}</v-tab>
            <v-tab> {{ $t("mode.microsoft") }}</v-tab>
            <v-tab> {{ $t("mode.authlib") }}</v-tab>
            <v-tab> {{ $t("mode.offline") }}</v-tab>
            <v-tab-item
                ><br />
                <v-text-field id="mo-un" :label="$t('username')"></v-text-field>
                <v-text-field id="mo-pw" :label="$t('password')" type="password"></v-text-field>
            </v-tab-item>
            <v-tab-item><br /><!--Microsoft Authentication--></v-tab-item>
            <v-tab-item
                ><br />
                <v-text-field id="au-as" :label="$t('authserver')"></v-text-field>
                <v-text-field id="au-un" :label="$t('username')"></v-text-field>
                <v-text-field id="au-pw" :label="$t('password')" type="password"></v-text-field>
            </v-tab-item>
            <v-tab-item
                ><br />
                <v-text-field id="of-un" :label="$t('username')"></v-text-field>
            </v-tab-item>
        </v-tabs>
        <transition name="slide-fade">
            <v-alert border="left" color="error white--text" v-if="showErr">
                <v-icon color="white">error_outline</v-icon>
                {{ $t("text.error-in-auth") }}
            </v-alert>
        </transition>
        <v-btn
            color="secondary white--text"
            v-on:click="backPage"
            style="margin-right: 5px;"
            depressed
            >{{ $t("cancel") }}
        </v-btn>
        <v-btn
            :loading="loading"
            :disabled="loading"
            color="info white--text"
            v-on:click="create"
            depressed
        >
            {{ $t("create") }}
        </v-btn>
    </v-container>
</template>

<script>
import { backPage } from "@/route";
import { authenticate, MOJANG_AUTHSERVER_URL } from "@/auth";
import { operateProperty } from "@/property";
import {
    log4js,
    getArrayNewElementId,
    resolveAuthServerURL,
    genUUID,
    genOfflineToken,
    e,
    isEmpty,
} from "@/utils";
const l = log4js.getLogger("default");

export default {
    name: "Accounts",
    data() {
        return {
            selectedTab: 0,
            loading: false,
            showErr: false,
        };
    },
    methods: {
        create() {
            // create new account
            this.showErr = false; // hide error alert on create start
            this.loading = true; // start creating progress
            let tab = this.selectedTab; // selected tab (account authentication mode)
            if (tab === 0) {
                // mojang account
                let un = e("mo-un").value;
                let pw = e("mo-pw").value;
                if (isEmpty(un) || isEmpty(pw)) {
                    this.loading = false;
                    return;
                }
                authenticate(MOJANG_AUTHSERVER_URL, un, pw, (data, err) => {
                    if (err) {
                        // error occurred
                        l.error("Error occurred authenticating. Authtype: Mojang");
                        this.loading = false;
                        this.showErr = true;
                    } else {
                        operateProperty(
                            "accounts",
                            accounts => {
                                accounts.push({
                                    id: getArrayNewElementId(accounts),
                                    email: un,
                                    name: data["name"],
                                    uuid: data["uuid"],
                                    token: data["token"],
                                    mode: "mode._mojang",
                                });
                                return accounts;
                            },
                            []
                        );
                        l.info("Added a new account. Name: " + data["name"]);
                        backPage();
                    }
                });
            } else if (tab === 1) {
                // microsoft account
                this.loading = false;
            } else if (tab === 2) {
                // authlib injector
                let as = e("au-as").value;
                let un = e("au-un").value;
                let pw = e("au-pw").value;
                if (isEmpty(un) || isEmpty(pw) || isEmpty(pw)) {
                    this.loading = false;
                    return;
                }
                authenticate(resolveAuthServerURL(as), un, pw, (data, err) => {
                    if (err) {
                        // error occurred
                        l.error("Error occurred authenticating. Authtype: Authlib Injector");
                        this.loading = false;
                        this.showErr = true;
                    } else {
                        operateProperty(
                            "accounts",
                            accounts => {
                                accounts.push({
                                    id: getArrayNewElementId(accounts),
                                    email: un,
                                    name: data["name"],
                                    uuid: data["uuid"],
                                    token: data["token"],
                                    mode: "mode._authlib",
                                });
                                return accounts;
                            },
                            []
                        );
                        l.info("Added a new account. Name: " + data["name"]);
                        backPage();
                    }
                });
            } else if (tab === 3) {
                // offline account
                let un = e("of-un").value;
                if (isEmpty(un)) {
                    this.loading = false;
                    return;
                }
                operateProperty(
                    "accounts",
                    accounts => {
                        accounts.push({
                            id: getArrayNewElementId(accounts),
                            name: un,
                            uuid: genUUID(),
                            token: genOfflineToken(un),
                            mode: "mode._offline",
                        });
                        l.info("Added a new account. Name: " + un);
                        return accounts;
                    },
                    []
                );
                backPage();
            }
        },
        changeTab(n) {
            this.selectedTab = n;
        },
        backPage() {
            backPage();
        },
    },
};
</script>

<style>
.slide-fade-enter-active {
    transition: all 0.5s ease;
}
.slide-fade-leave-active {
    transition: all 0.5s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
}
</style>
