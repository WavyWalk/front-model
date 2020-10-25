import * as fs from "fs";
import {PROJECT_DIR} from "../index";

export class WebpackStatsInfo {

    static stats: {[id:string]: any}

    static pathToCssIndex: string
    static pathToJsIndex: string

    static readAndAssignStats() {
        const readData = fs.readFileSync(`${PROJECT_DIR}/webpack_stats.json`, 'utf8')
        this.stats = JSON.parse(readData)
        this.pathToJsIndex = `/assets/${this.stats['assetsByChunkName']['js/index'][0]}`
        this.pathToCssIndex = `/assets/${this.stats['assetsByChunkName']['css/index'][0]}`
    }

}