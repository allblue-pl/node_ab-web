import type BuildData from "../BuildData.ts";
import abPager from "./ab-pager.ts";
import spkMessages from "./spk-messages.ts";
import spocky from "./spocky.ts";
import webABApi from "./web-ab-api.ts";

export default (build: BuildData): BuildData => {
    return build
        .init(abPager)
        .init(spkMessages)
        .init(spocky)
        .init(webABApi)
        .extArr(build.data['sass']['paths'], [
            build.devFSPath + '/node_modules/spk-lemon-bee/scss',
        ])
        .extArr(build.data['spocky']['packages'], [
            build.devFSPath + '/node_modules/spk-lemon-bee',        
        ])
        .extArr(build.data['dist']['paths'], [
            build.devFSPath + '/node_modules/spk-lemon-bee/images/**',        
        ]);
}