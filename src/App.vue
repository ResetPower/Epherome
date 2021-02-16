<template>
    <v-app>
        <v-app-bar color="primary white--text" app>
            <v-btn v-on:click="backPage" color="white" icon>
                <v-icon id="app-bar-left-icon">home</v-icon>
            </v-btn>
            <v-toolbar-title class="animate__animated animate__slideInLeft" id="app-title"
                >Epherome</v-toolbar-title
            >
            <v-spacer></v-spacer>
            <v-btn v-on:click="togglePage('accounts')" id="tgllr-acc" icon>
                <v-icon color="white">account_circle</v-icon>
            </v-btn>
            <v-btn v-on:click="togglePage('profiles')" id="tgllr-pro" icon>
                <v-icon color="white">games</v-icon>
            </v-btn>
            <v-btn v-on:click="togglePage('settings')" id="tgllr-set" icon>
                <v-icon color="white">settings</v-icon>
            </v-btn>
        </v-app-bar>
        <v-main>
            <transition name="fade" mode="out-in">
                <router-view></router-view>
            </transition>
        </v-main>
    </v-app>
</template>

<script>
import { backPage, togglePage } from "@/route";
import { e } from "@/utils";

export default {
    name: "App",
    methods: {
        updateTitle(title) {
            let appBarLeftIcon = e("app-bar-left-icon");
            let appTitle = e("app-title");
            appTitle.innerText = title;
            if (title === "Epherome") {
                appBarLeftIcon.innerText = "home";
            } else {
                appBarLeftIcon.innerText = "arrow_back";
            }
        },
        backPage() {
            backPage();
        },
        togglePage(name) {
            togglePage(name);
        },
    },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}
body::-webkit-scrollbar {
    width: 0 !important;
}
.eph-btn-active {
    background-color: rgba(0, 0, 0, 0.2);
}
</style>
