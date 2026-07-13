import type BuildData from "./BuildData.ts";
import abBootstrapDatetimepicker from "./confs/ab-bootstrap-datetimepicker.ts";
import abBootstrap from "./confs/ab-bootstrap.ts";
import abCookies from "./confs/ab-cookies.ts";
import abDataNative from "./confs/ab-data-native.ts";
import abDataWeb from "./confs/ab-data-web.ts";
import abData from "./confs/ab-data.ts";
import abDatabaseNative from "./confs/ab-database-native.ts";
import abDate from "./confs/ab-date.ts";
import abFields from "./confs/ab-fields.ts";
import abGallery from "./confs/ab-gallery.ts";
import abLayouts from "./confs/ab-layouts.ts";
import abLock from "./confs/ab-lock.ts";
import abNative from "./confs/ab-native.ts";
import abNodes from "./confs/ab-nodes.ts";
import abPager from "./confs/ab-pager.ts";
import abQrCodesGenerator from "./confs/ab-qr-codes-generator.ts";
import abResourcePreloader from "./confs/ab-resource-preloader.ts";
import abStrings from "./confs/ab-strings.ts";
import abTextParser from "./confs/ab-text-parser.ts";
import abText from "./confs/ab-text.ts";
import abTime from "./confs/ab-time.ts";
import abTimer from "./confs/ab-timer.ts";
import abWebScroller from "./confs/ab-web-scroller.ts";
import eSpkLemonBee from "./confs/e-spk-lemon-bee.ts";
import eLibs from "./confs/e-libs.ts";
import eTasks from "./confs/e-tasks.ts";
import fontAwesome from "./confs/font-awesome.ts";
import jquery from "./confs/jquery.ts";
import js0 from "./confs/js0.ts";
import moment from "./confs/moment.ts";
import sortablejs from "./confs/sortablejs.ts";
import spkFileUpload from "./confs/spk-file-upload.ts";
import spkForms from "./confs/spk-forms.ts";
import spkLemonBee from "./confs/spk-lemon-bee.ts";
import spkMessages from "./confs/spk-messages.ts";
import spkTables from "./confs/spk-tables.ts";
import spkTinymce from "./confs/spk-tinymce.ts";
import spocky from "./confs/spocky.ts";
import webABApi from "./confs/web-ab-api.ts";
import type Ext from "./Ext.ts";
import type { ExtInit } from "./ts-types.ts";

export class abConfs_Class {
    get abBootstrapDatetimepicker(): ExtInit {
        return abBootstrapDatetimepicker;
    } 
    get abBootstrap(): ExtInit {
        return abBootstrap;
    }
    get abCookies(): ExtInit {
        return abCookies;
    }
    get abDataNative(): ExtInit {
        return abDataNative;
    }
    get abDataWeb(): ExtInit {
        return abDataWeb;
    }
    get abData(): ExtInit {
        return abData;
    }
    get abDatabaseNative(): ExtInit {
        return abDatabaseNative;
    }
    get abDate(): ExtInit {
        return abDate;
    }
    get abFields(): ExtInit {
        return abFields;
    }
    get abGallery(): ExtInit {
        return abGallery;
    }
    get abLayouts(): ExtInit {
        return abLayouts;
    }
    get abLock(): ExtInit {
        return abLock;
    }
    get abNative(): ExtInit {
        return abNative;
    }
    get abNodes(): ExtInit {
        return abNodes;
    }
    get abPager(): ExtInit {
        return abPager;
    }
    get abQrCodesGenerator(): ExtInit {
        return abQrCodesGenerator;
    }
    get abResourcePreloader(): ExtInit {
        return abResourcePreloader;
    }
    get abStrings(): ExtInit {
        return abStrings;
    }
    get abTextParser(): ExtInit {
        return abTextParser;
    }
    get abText(): ExtInit {
        return abText;
    }
    get abTime(): ExtInit {
        return abTime;
    }
    get abTimer(): ExtInit {
        return abTimer;
    }
    get abWebScroller(): ExtInit {
        return abWebScroller;
    }
    get eSpkLemonBee(): ExtInit {
        return eSpkLemonBee;
    }
    get eLibs(): (build: BuildData, espadaFSPath: string) => BuildData {
        return eLibs;
    }
    get eTasks(): ExtInit {
        return eTasks;
    }
    get fontAwesome(): ExtInit {
        return fontAwesome;
    }
    get jquery(): ExtInit {
        return jquery;
    }
    get js0(): ExtInit {
        return js0;
    }
    get moment(): ExtInit {
        return moment;
    }
    get sortablejs(): ExtInit {
        return sortablejs;
    }
    get spkFileUpload(): ExtInit {
        return spkFileUpload;
    }
    get spkForms(): ExtInit {
        return spkForms;
    }
    get spkLemonBee(): ExtInit {
        return spkLemonBee;
    }
    get spkMessages(): ExtInit {
        return spkMessages;
    }
    get spkTables(): ExtInit {
        return spkTables;
    }
    get spkTinymce(): ExtInit {
        return spkTinymce;
    }
    get spocky(): ExtInit {
        return spocky;
    }
    get webABApi(): ExtInit {
        return webABApi;
    }

    constructor() {
        
    }
}
const abConfs = new abConfs_Class();
export default abConfs;

