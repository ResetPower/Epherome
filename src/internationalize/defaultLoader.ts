import en from "./lang/en.json";
import zh_hans from "./lang/zh_hans.json";
import zh_hant from "./lang/zh_hant.json";
import de from "./lang/de.json";
import fr from "./lang/fr.json";
import es from "./lang/es.json";
import ar from "./lang/es.json";
import { fs } from "@tauri-apps/api";
import { appDataDir, resolve } from "@tauri-apps/api/path";

export default async function loadDefaultLanguages() {
    const langPath = await resolve(await appDataDir(), "lang");
    if(!(await fs.exists(langPath)))
        await fs.createDir(langPath);
    await fs.writeTextFile(await resolve(langPath, "en.json"), JSON.stringify(en));
    await fs.writeTextFile(await resolve(langPath, "zh_hans.json"), JSON.stringify(zh_hans));
    await fs.writeTextFile(await resolve(langPath, "zh_hant.json"), JSON.stringify(zh_hant));
    await fs.writeTextFile(await resolve(langPath, "de.json"), JSON.stringify(de));
    await fs.writeTextFile(await resolve(langPath, "fr.json"), JSON.stringify(fr));
    await fs.writeTextFile(await resolve(langPath, "es.json"), JSON.stringify(es));
    await fs.writeTextFile(await resolve(langPath, "ar.json"), JSON.stringify(ar));
}