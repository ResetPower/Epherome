v<template>
    <v-container>
        <v-list style="padding: 10px">
            <v-btn color="info white--text" v-on:click="jumpPage('new-acc')" depressed>
                <v-icon>add</v-icon>
                {{ $t("create") }}
            </v-btn>
            <p v-if="accounts.length === 0">
                {{ $t("text.no-account-please-create") }}
            </p>
            <v-list-item v-for="a in accounts" :key="a.id" two-line v-else>
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
                    <v-list-item-subtitle>{{ $t(a.mode) }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                    <v-menu offset-y>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn v-bind="attrs" v-on="on" icon>
                                <v-icon>more_vert</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-dialog v-model="dialog">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-list-item v-bind="attrs" v-on="on">
                                        <v-list-item-avatar>
                                            <v-icon>delete</v-icon>
                                        </v-list-item-avatar>
                                        <v-list-item-content
                                            >{{ $t("delete") }}
                                        </v-list-item-content>
                                    </v-list-item>
                                </template>
                                <v-card>
                                    <v-card-title class="headline">{{
                                        $t("text.r-u-sure")
                                    }}</v-card-title>
                                    <v-card-text>
                                        {{ $t("text.r-u-sure-to-del-acc") }}
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="green darken-1" text @click="dialog = false">
                                            {{ $t("cancel") }}
                                        </v-btn>
                                        <v-btn
                                            color="green darken-1"
                                            text
                                            @click="dialog = false"
                                            v-on:click="remove(a.id)"
                                        >
                                            {{ $t("confirm") }}
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-dialog>
                        </v-list>
                    </v-menu>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-container>
</template>

<script>
import { log4js } from "@/utils";
import { jumpPage } from "@/route";
import { readProperty, writeProperty, operateProperty } from "@/property";
const l = log4js.getLogger("default");

export default {
    name: "Accounts",
    data() {
        let acc = readProperty("accounts", []);
        let sel = readProperty("selected-account", 0);
        return {
            accounts: acc,
            selected: sel,
            dialog: false,
        };
    },
    methods: {
        select(id) {
            // update selected account
            this.selected = id;
            writeProperty("selected-account", id);
            l.info("Updated account selection. Id: " + id);
        },
        remove(id) {
            // remove account by id
            let nAcc = [];
            operateProperty(
                "accounts",
                accounts => {
                    for (let i in accounts) {
                        let a = accounts[i];
                        if (a["id"] === id) {
                            accounts.splice(i, 1);
                        }
                    }
                    nAcc = accounts;
                    return accounts;
                },
                []
            );
            this.accounts = nAcc;
            l.info("Removed account. Id: " + id);
        },
        jumpPage(name) {
            jumpPage(name);
        },
    },
};
</script>
