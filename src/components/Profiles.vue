<template>
    <v-container>
        <v-list style="padding: 10px">
            <v-btn color="info white--text" v-on:click="jumpPage('new-pro')" depressed>
                <v-icon>add</v-icon>
                {{ $t("create") }}
            </v-btn>
            <p v-if="profiles.length === 0">
                {{ $t("text.no-profile-please-create") }}
            </p>
            <v-list-item v-for="a in profiles" :key="a.id" two-line v-else>
                <v-list-item-avatar>
                    <v-btn color="pink" v-if="selected === a.id" icon>
                        <v-icon>radio_button_checked</v-icon>
                    </v-btn>
                    <v-btn color="secondary" v-on:click="select(a.id)" v-else icon>
                        <v-icon>radio_button_unchecked</v-icon>
                    </v-btn>
                </v-list-item-avatar>
                <v-list-item-content>
                    <v-list-item-title>{{ a.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ a.dir }} ({{ a.ver }})</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" icon>
                                <v-icon>more_vert</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-on:click="edit(a.id)">
                                <v-list-item-avatar>
                                    <v-icon>edit</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content>{{ $t("edit") }} </v-list-item-content>
                            </v-list-item>
                            <v-list-item v-on:click="del(a.id)">
                                <v-list-item-avatar>
                                    <v-icon>delete</v-icon>
                                </v-list-item-avatar>
                                <v-list-item-content>{{ $t("delete") }} </v-list-item-content>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-dialog v-model="delDialog">
            <v-card>
                <v-card-title class="headline">{{ $t("text.r-u-sure") }}</v-card-title>
                <v-card-text>
                    {{ $t("text.r-u-sure-to-del-pro") }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text v-on:click="delDialog = false">
                        {{ $t("cancel") }}
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        text
                        v-on:click="
                            delConfirm(dialogOn);
                            delDialog = false;
                        "
                    >
                        {{ $t("confirm") }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="ediDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar flat dark color="primary">
                    <v-btn icon dark v-on:click="ediDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ $t("edit") }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn
                            dark
                            text
                            v-on:click="
                                applyEdit();
                                ediDialog = false;
                            "
                        >
                            {{ $t("save") }}
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <v-text-field
                        prepend-icon="segment"
                        v-model="name"
                        :label="$t('name')"
                    ></v-text-field>
                    <v-text-field
                        prepend-icon="folder"
                        v-model="dir"
                        :label="$t('directory')"
                        :messages="$t('text.description-of-profile-directory')"
                    ></v-text-field>
                    <v-text-field
                        prepend-icon="tag"
                        v-model="ver"
                        :label="$t('version')"
                    ></v-text-field>
                    <br />
                    <v-btn
                        color="success white--text"
                        v-on:click="browse"
                        style="margin-right: 5px;"
                        depressed
                    >
                        <v-icon>folder_open</v-icon> {{ $t("browse-folder") }}
                    </v-btn>
                </v-card-text>
                <div style="flex: 1 1 auto;"></div>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { log4js, getArrayElementById } from "@/utils";
import { jumpPage } from "@/route";
import { readProperty, writeProperty, operateProperty } from "@/property";
import { ipcRenderer } from "electron";
const l = log4js.getLogger("default");

export default {
    name: "Profiles",
    data() {
        let pro = readProperty("profiles", []);
        let sel = readProperty("selected-profile", 0);
        return {
            profiles: pro,
            selected: sel,
            dialogOn: -1,
            delDialog: false,
            ediDialog: false,
            name: "",
            dir: "",
            ver: "",
        };
    },
    methods: {
        select(id) {
            // update selected profile
            this.selected = id;
            writeProperty("selected-profile", id);
            l.info("Updated profile selection. Id: " + id);
        },
        del(id) {
            this.dialogOn = id;
            this.delDialog = true;
        },
        delConfirm(id) {
            // remove account by id
            let nPro = [];
            operateProperty(
                "profiles",
                profiles => {
                    for (let i in profiles) {
                        let a = profiles[i];
                        if (a["id"] === id) {
                            profiles.splice(i, 1);
                        }
                    }
                    nPro = profiles;
                    return profiles;
                },
                []
            );
            this.profiles = nPro;
            l.info("Removed profile. Id: " + id);
        },
        edit(id) {
            this.dialogOn = id;
            this.ediDialog = true;
            let pro = readProperty("profiles", []);
            let obj = getArrayElementById(pro, this.dialogOn);
            this.name = obj.name;
            this.dir = obj.dir;
            this.ver = obj.ver;
        },
        jumpPage(name) {
            jumpPage(name);
        },
        browse() {
            ipcRenderer.on("close-dir-browse-dialog", (ev, args) => {
                if (!args.canceled) {
                    this.dir = args.filePaths[0];
                }
            });
            ipcRenderer.send("open-dir-browse-dialog", []);
        },
        applyEdit() {
            console.log("Apply edition. dialogOn: " + this.dialogOn);
            operateProperty(
                "profiles",
                profiles => {
                    let ind = profiles.indexOf(getArrayElementById(profiles, this.dialogOn));
                    profiles[ind] = {
                        id: profiles[ind]["id"],
                        name: this.name,
                        dir: this.dir,
                        ver: this.ver,
                    };
                    return profiles;
                },
                []
            );
            let indt = this.profiles.indexOf(getArrayElementById(this.profiles, this.dialogOn));
            this.profiles[indt] = {
                id: this.profiles[indt]["id"],
                name: this.name,
                dir: this.dir,
                ver: this.ver,
            };
        },
    },
};
</script>
