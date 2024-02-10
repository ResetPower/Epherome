import { i18nConfig, i18nInstance } from "./i18n";
import { fs } from "@tauri-apps/api";
import { appDataDir } from '@tauri-apps/api/path';
import { cfg } from '../stores/config'

const config: i18nConfig = {
    lang_path: await appDataDir(),
    dir_reader: async (path: string) => { 
        const dirs: string[] = [];
        (await fs.readDir(path)).forEach((v) => {
            if(v.path === "..")
                return;
            dirs.push(v.path);
        }) 
        return dirs;
    },
    json_reader: async (path: string) => {
        return await fs.readTextFile(path);
    }
};

interface EphIntl {
    status: {
        loading: string,

    },
    account: {
        detail: {
            uuid: string,
            type: string,
            name: string,
            authServer: string,
            token: {
                available: string,
                unavailable: string,
                checkAvailability: string
            }
        }
        action: {
            remove: string,
            create: string,
            cancel: string,
            ensureRemove: string,
            selectAccount: string,
        },
        noAccount: string,
    },
    profile: {
        detail: {
            name: string,
            gameDir: string,
            version: string, 
        },
        action: {
            browse: string, 
            create: string,
            cancel: string,
            remove: string,
            ensureRemove: string,
            selectProfile: string
        },
        noProfile: string
    },
    about: {
        issue: string,
        dataDir: string,
        copyright: string,
        githubRepo: string,
        tauriVersion: string,
        nightlyWarning: string,
        officialWebsite: string,
    },
    setting: {
        about: string,
        noOpt: string,
        general: string,
        download: string,
        appearance: string
    },
    counter: {
        count: string,
        increase: string
    },
    home: {
        launch: string,
        account: string,
        profile: string,
        unselected: string
    }
};

export const i18n = new i18nInstance<EphIntl>(config);
await i18n.init();
i18n.setLang(cfg.lang);
export const tr = i18n.body();