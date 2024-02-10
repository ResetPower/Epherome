export interface i18nConfig {
    /**
     * (Absolute Path)
     */
    lang_path: string,
    /**
     * 
     * @param path (Absolute Path)
     * @returns Path
     */
    json_reader: (path: string) => Promise<string>
    /**
     * 
     * @param path (Absolute Path)
     * @returns Path[] (Absolute Paths)
     */
    dir_reader: (path: string) => Promise<string[]>
}

export interface Language<T> {
    name: string,
    body: T
}