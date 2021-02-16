<template>
    <v-container>
        <v-text-field prepend-icon="segment" v-model="name" :label="$t('name')"></v-text-field>
        <v-text-field
            prepend-icon="folder"
            v-model="dir"
            :label="$t('directory')"
            :messages="$t('text.description-of-profile-directory')"
        ></v-text-field>
        <v-text-field prepend-icon="tag" v-model="ver" :label="$t('version')"></v-text-field>
        <br />
        <v-btn color="success white--text" v-on:click="browse" style="margin-right: 5px;" depressed>
            <v-icon>folder_open</v-icon> {{ $t("browse-folder") }}
        </v-btn>
        <v-btn
            color="secondary white--text"
            v-on:click="backPage"
            style="margin-right: 5px;"
            depressed
            >{{ $t("cancel") }}
        </v-btn>
        <v-btn color="info white--text" v-on:click="create" depressed>
            {{ $t("create") }}
        </v-btn>
    </v-container>
</template>
<script>
import { backPage } from "@/route";
import { operateProperty } from "@/property";
import { log4js, getArrayNewElementId, isNotEmpty } from "@/utils";
import { ipcRenderer } from "electron";

const l = log4js.getLogger("default");

export default {
    name: "NewProfile",
    data() {
        return {
            name: "",
            dir: "",
            ver: "",
        };
    },
    methods: {
        create() {
            // create new profile
            if (isNotEmpty(this.name) && isNotEmpty(this.dir) && isNotEmpty(this.ver)) {
                operateProperty(
                    "profiles",
                    profiles => {
                        let nId = getArrayNewElementId(profiles);
                        profiles.push({
                            id: nId,
                            name: this.name,
                            dir: this.dir,
                            ver: this.ver,
                        });
                        l.info("Profile created. Id: " + nId);
                        return profiles;
                    },
                    []
                );
                backPage();
            }
        },
        backPage() {
            backPage();
        },
        browse() {
            ipcRenderer.on("close-dir-browse-dialog", (ev, args) => {
                if (!args.canceled) {
                    this.dir = args.filePaths[0];
                }
            });
            ipcRenderer.send("open-dir-browse-dialog", []);
        },
    },
};
</script>
