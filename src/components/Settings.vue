<template>
    <v-tabs left vertical>
        <v-tab>
            <v-icon left> list</v-icon>
            {{ $t("general") }}
        </v-tab>
        <v-tab>
            <v-icon left> palette</v-icon>
            {{ $t("appearance") }}
        </v-tab>
        <v-tab>
            <v-icon left> info</v-icon>
            {{ $t("about") }}
        </v-tab>
        <v-tab-item>
            <v-banner v-model="bannerVisible" transition="slide-y-transition">
                <v-avatar>
                    <v-icon color="warning">warning</v-icon>
                </v-avatar>
                {{ $t("text.reload-required-to-reload-language") }}
                <template v-slot:actions="{ dismiss }">
                    <v-btn text color="primary" @click="dismiss">
                        {{ $t("dismiss") }}
                    </v-btn>
                </template>
            </v-banner>
            <v-container>
                <v-select
                    v-model="selectedLang"
                    prepend-icon="translate"
                    :label="$t('language')"
                    :items="langs"
                    item-text="text"
                    item-value="locale"
                ></v-select>
                <v-text-field
                    v-model="javaPathContent"
                    prepend-icon="local_cafe"
                    :label="$t('java-path')"
                ></v-text-field>
                <v-btn
                    color="secondary white--text"
                    v-on:click="backPage"
                    style="margin-right: 5px;"
                    depressed
                >
                    {{ $t("cancel") }}
                </v-btn>
                <v-btn color="info white--text" v-on:click="saveAll" depressed>{{
                    $t("save")
                }}</v-btn>
            </v-container>
        </v-tab-item>
        <v-tab-item>
            <v-container>{{ $t("text.no-appearance-settings-now") }}</v-container>
        </v-tab-item>
        <v-tab-item>
            <v-container>
                <strong>Epherome: {{ epheromeVersion }} ({{ epheromeStage }})</strong><br /><br />
                <span>Electron: {{ electronVersion }}</span
                ><br />
                <span>Chrome: {{ chromeVersion }}</span
                ><br />
                <span>Node.js: {{ nodeVersion }}</span
                ><br />
                <span>V8: {{ v8Version }}</span
                ><br /><br />
                <span
                    >{{ $t("user-data-path") }}: <strong>{{ userDataPath }}</strong></span
                ><br /><br />
                <span
                    >{{ $t("official-site") }}:
                    <a v-on:click="openExternal('https://epherome.com')"
                        >https://epherome.com</a
                    ></span
                ><br />
                <span
                    >GitHub:
                    <a v-on:click="openExternal('https://github.com/ResetPower/Epherome')">
                        https://github.com/ResetPower/Epherome
                    </a></span
                >
                <br />
                <span>Copyright © 2021 ResetPower. All rights reserved.</span><br />
                <span>{{ $t("oss") }} | GNU General Public License 3.0</span><br />
            </v-container>
        </v-tab-item>
    </v-tabs>
</template>

<script>
import { log4js } from "@/utils";
import { readProperty, writeProperty } from "@/property";
import { backPage } from "@/route";
import Epherome from "@/epherome";
import { userDataPath as udp } from "@/main";
import { shell } from "electron";

const openExternal = shell.openExternal;
const l = log4js.getLogger("default");

export default {
    name: "Accounts",
    data() {
        return {
            epheromeVersion: Epherome.version,
            epheromeStage: this.$t("stage.alpha"),
            electronVersion: process.versions.electron,
            chromeVersion: process.versions.chrome,
            nodeVersion: process.versions.node,
            v8Version: process.versions.v8,
            userDataPath: udp,
            langs: [
                {
                    locale: "en-us",
                    text: "English",
                },
                {
                    locale: "zh-cn",
                    text: "简体中文",
                },
            ],
            formerLang: readProperty("language"),
            selectedLang: readProperty("language"),
            javaPathContent: readProperty("java-path"),
            bannerVisible: false,
        };
    },
    methods: {
        backPage() {
            backPage();
        },
        openExternal(url) {
            openExternal(url);
        },
        saveAll() {
            l.info("Save all settings triggered, saving");
            writeProperty("java-path", this.javaPathContent);
            l.debug("Java path: " + this.javaPathContent);
            writeProperty("language", this.selectedLang);
            l.debug("Language locale: " + this.selectedLang);
            if (this.formerLang !== this.selectedLang) {
                this.bannerVisible = true;
            }
        },
    },
};
</script>
