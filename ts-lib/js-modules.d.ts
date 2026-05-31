
declare module "anymatch" {
    const anymatch: (matchers: Array<string>, testString: string) => boolean;
    export default anymatch;
}

declare module "@babel/core";
declare module "uglify-js";