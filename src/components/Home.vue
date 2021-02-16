<template>
    <div>
        <v-list class="animate__animated animate__slideInLeft" shaped>
            <v-list-item style="background-color: #51c2d5; width: fit-content; padding-right: 50px">
                <v-list-item-icon>
                    <v-icon color="white">account_circle</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title style="color: white">
                        <span v-if="typeof username === 'undefined'">
                            {{ $t("text.no-account-please-select") }}
                        </span>
                        <span v-else
                            >{{ $t("hello") }}, <strong>{{ username }}</strong
                            >!</span
                        >
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <v-container>
            <v-alert dense border="left" v-if="alphaWarn" color="warning white--text">
                <v-icon color="white">warning</v-icon>
                <span style="padding-right: 5px;">{{ $t("text.alpha-warn") }}</span>
                <a v-on:click="alphaWarn = false">{{ $t("dismiss") }}</a>
            </v-alert>

            <v-row>
                <v-col>
                    <v-card color="blue lighten-3" elevation="6" style="padding: 10px">
                        <v-select
                            v-model="select"
                            v-on:change="change"
                            :hint="`${select.dir} (${select.ver})`"
                            :items="items"
                            item-text="name"
                            item-value="id"
                            label="Select"
                            v-if="select !== undefined"
                            persistent-hint
                            return-object
                            single-line
                        ></v-select>
                        <p v-else>{{ $t("text.no-profile-please-create") }}</p>
                        <br />
                        <v-btn color="blue-grey white--text" v-on:click="launch">
                            <v-icon>launch</v-icon>
                            {{ $t("launch") }} Minecraft
                        </v-btn>
                    </v-card>
                </v-col>
                <v-col>
                    <v-card color="blue lighten-1" elevation="6" style="padding: 10px">
                        <v-icon>voicemail</v-icon>
                        {{ $t("news") }}
                        <p>{{ $t("text.no-news-yet") }}</p>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
        <v-dialog v-model="tipDialog">
            <v-card>
                <v-card-title class="headline">{{ $t("tip") }}</v-card-title>
                <v-card-text>
                    {{ $t("text.acc-or-pro-not-selected") }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text v-on:click="tipDialog = false">
                        {{ $t("confirm") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="requestPasswordDialog">
            <v-card>
                <v-card-title class="headline">{{ $t("text.password-required") }}</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="currentPassword"
                        prepend-icon="vpn_key"
                        :label="$t('password')"
                        type="password"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="secondary white--text" v-on:click="onPasswordCancel">{{
                        $t("cancel")
                    }}</v-btn>
                    <v-btn color="green darken-1 white--text" v-on:click="onPasswordConfirm">{{
                        $t("confirm")
                    }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="launchDialog"
            fullscreen
            hide-overlay
            transition="dialog-bottom-transition"
        >
            <v-card>
                <v-toolbar flat color="primary">
                    <v-btn icon v-on:click="launchDialog = false">
                        <v-icon color="white">close</v-icon>
                    </v-btn>
                    <v-toolbar-title color="white--text">{{ $t("launching") }}</v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <v-list>
                        <v-list-item v-for="d in details" v-bind:key="d.text">
                            <v-list-item-avatar v-if="d.stat"
                                ><v-icon>check</v-icon></v-list-item-avatar
                            >
                            <v-list-item-avatar v-else
                                ><v-icon>arrow_forward</v-icon></v-list-item-avatar
                            >
                            <v-list-item-content>{{ $t(d.text) }}</v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <p>{{ currentSpeed }}</p>
                </v-card-text>
                <div style="flex: 1 1 auto;"></div>
            </v-card>
        </v-dialog>
        <v-dialog v-model="errorDialog">
            <v-card>
                <v-toolbar flat color="info">
                    <v-btn
                        icon
                        v-on:click="
                            errorDialog = false;
                            launchDialog = false;
                        "
                    >
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>
                        {{ $t("error-occurred") }}
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-title>{{ currentErrorType }} Error</v-card-title>
                <v-card-text>{{ currentErrorMessage }}</v-card-text>
                <v-card-actions>
                    {{ $t("text.help-on-error") }}
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { readProperty, writeProperty, operateProperty } from "@/property";
import { getArrayElementById, log4js, resolveAuthServerURL } from "@/utils";
import { MOJANG_AUTHSERVER_URL, authenticate, refresh, validate } from "@/auth";
import { launchMinecraft } from "@/core";

const l = log4js.getLogger("default");

export default {
    name: "Home",
    data: () => {
        let acc = readProperty("accounts", []);
        let pro = readProperty("profiles", []);
        let aSel = readProperty("selected-account", 0);
        let pSel = readProperty("selected-profile", 0);
        let acco = getArrayElementById(acc, aSel);
        let prof = getArrayElementById(pro, pSel);
        let select = undefined;
        if (pro.length !== 0) {
            if (typeof prof === "undefined") {
                select = pro[0];
            } else {
                select = prof;
            }
        }
        return {
            username: typeof acco === "undefined" ? undefined : acco["name"],
            account: acco,
            accountId: aSel,
            select: select,
            items: pro,
            tipDialog: false,
            launchDialog: false,
            requestPasswordDialog: false,
            errorDialog: false,
            currentPassword: "",
            details: [],
            currentSpeed: "",
            currentErrorType: "",
            currentErrorMessage: "",
            alphaWarn: true,
        };
    },
    methods: {
        change(pro) {
            writeProperty("selected-profile", pro["id"]);
        },
        onPasswordConfirm() {},
        onPasswordCancel() {
            l.info("Password input canceled. Canceled start Minecraft");
            this.requestPasswordDialog = false;
            this.launchDialog = false;
        },
        launch() {
            this.launchDialog = true;
            const continueStartMinecraft = () => {
                this.details[0].stat = true;
                launchMinecraft(
                    {
                        profile: this.select,
                        name: this.username,
                        uuid: this.account["uuid"],
                        token: this.account["token"],
                        java: readProperty("java-path"),
                        details: this.details,
                        reloadDetails: () => {},
                        setSpeed: () => {},
                        done: () => {
                            this.launchDialog = false;
                        },
                    },
                    (type, msg) => {
                        this.currentErrorType = type;
                        this.currentErrorMessage = msg;
                        this.errorDialog = true;
                    }
                );
            };
            this.details = [];
            this.details.push({
                text: "progress.login",
                stat: false,
            });
            if (typeof this.select !== "undefined" && typeof this.account !== "undefined") {
                if (!navigator.onLine) {
                    l.info("Network unavailable. Needn't authentication. Continue start Minecraft");
                    // network unavailable, launch minecraft directly
                    continueStartMinecraft();
                } else if (
                    // check if it needs authentication
                    this.account["mode"] === "mode._authlib" ||
                    this.account["mode"] === "mode._mojang"
                ) {
                    let url =
                        this.account["mode"] === "mode._mojang"
                            ? MOJANG_AUTHSERVER_URL
                            : resolveAuthServerURL(this.account["server"]);
                    // check availability of account token
                    l.info("Account is authentication required. Checking availability");
                    validate(url, this.account["token"], err => {
                        if (err) {
                            l.info("Online token is unavailable. Refreshing");
                            // token is unavailable, try to refresh token
                            refresh(url, this.account["token"], (data, err) => {
                                if (err) {
                                    l.info("Failed refreshing online token. Requesting password");
                                    // request user to input password
                                    this.onPasswordConfirm = () => {
                                        l.info("User input password. Authenticating");
                                        this.requestPasswordDialog = false;
                                        authenticate(
                                            url,
                                            this.account["email"],
                                            this.currentPassword,
                                            (data, err) => {
                                                this.currentPassword = "";
                                                if (err) {
                                                    l.info(
                                                        "Authentication failed. Request for password again"
                                                    );
                                                    this.requestPasswordDialog = true;
                                                } else {
                                                    l.info("Authentication successfully");
                                                    operateProperty(
                                                        "accounts",
                                                        accounts => {
                                                            let ind = accounts.indexOf(
                                                                getArrayElementById(
                                                                    accounts,
                                                                    this.accountId
                                                                )
                                                            );
                                                            accounts[ind]["token"] = data["token"];
                                                            return accounts;
                                                        },
                                                        []
                                                    );
                                                    this.requestPasswordDialog = false;
                                                    this.account["token"] = data["token"];
                                                    l.info(
                                                        "Got another online token by password successfully. Continue start Minecraft"
                                                    );
                                                    continueStartMinecraft();
                                                }
                                            }
                                        );
                                    };
                                    this.requestPasswordDialog = true;
                                } else {
                                    operateProperty(
                                        "account",
                                        accounts => {
                                            let ind = accounts.indexOf(
                                                getArrayElementById(accounts, this.accountId)
                                            );
                                            accounts[ind]["token"] = data["token"];
                                            return accounts;
                                        },
                                        []
                                    );
                                    // online account, refreshed token successfully
                                    this.account["token"] = data["token"];
                                    l.info(
                                        "Online token refreshed successfully. Continue start Minecraft"
                                    );
                                    continueStartMinecraft();
                                }
                            });
                        } else {
                            l.info("Online token is available. Continue start Minecraft");
                            // online account, validated successfully
                            continueStartMinecraft();
                        }
                    });
                } else {
                    l.info("Offline account. Needn't authentication. Continue start Minecraft");
                    // offline account, launch minecraft directly
                    continueStartMinecraft();
                }
            } else {
                this.tipDialog = true;
            }
        },
    },
};
</script>
