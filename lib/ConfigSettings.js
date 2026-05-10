import path from "node:path";
export default class ConfigSettings {
    #config;
    #configFSPath;
    get back() {
        return path.resolve(this.#config.back);
    }
    get base() {
        return this.#config.base;
    }
    get configFSPath() {
        return this.#configFSPath;
    }
    get dev() {
        return path.resolve(this.#config.dev);
    }
    get dist() {
        return path.resolve(this.#config.dist);
    }
    get front() {
        return path.resolve(this.#config.front);
    }
    get index() {
        return path.resolve(this.#config.index);
    }
    get tmp() {
        return path.resolve(this.#config.tmp);
    }
    constructor(config, configFSPath) {
        this.#config = config;
        this.#configFSPath = configFSPath;
    }
}
