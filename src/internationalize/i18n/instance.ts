import { Language, i18nConfig } from "./interface";

export default class i18nInstance<T> {
    constructor(conf: i18nConfig) {
        this.config = conf;
        this.languages = [];
    }
    private config: i18nConfig;
    private languages: Array<Language<T>>;
    private lang?: Language<T>;
    
    public async init() {
        const paths = await this.config.dir_reader(this.config.lang_path);
        const len = paths.length;
        for(let i = 0; i < len; i++) {
            const temp = await this.config.json_reader(paths[i])
            this.languages.push(JSON.parse(temp) as Language<T>);
        }
    }

    public getNames() {
        const names: string[] = [];
        this.languages.forEach((v) => {
            names.push(v.name);
        })
        return names;
    }
    public setLang(lang: string) {
        this.languages.forEach((v) => {
            if(v.name === lang) {
                this.lang = v;
            }
        })
        return;
    }
    public body(): T {
        if(!this.lang)
            throw new Error("Language is not set.");
        return this.lang.body;
    }
};