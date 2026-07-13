                                             
import abPager from "./ab-pager.js";
import spkMessages from "./spk-messages.js";
import spocky from "./spocky.js";
import webABApi from "./web-ab-api.js";

export default (build           )            => {
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
            build.devFSPath + '/node_modules/spk-lemon-bee/images/**/*.*',        
        ]);
}