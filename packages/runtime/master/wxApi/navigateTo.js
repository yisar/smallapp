import { getApp } from "../App";
import { bridgeInAdvance } from "../BridgeInAdvance";
import { getQuery } from "../BridgeInAdvance";
import {setPageByGuid} from '../PageInit'

export function navigateTo(option) {
    const { url, fail, success } = option
    const app = getApp()
    const { query, path } = getQuery(url)
    const page = app.json.pages.filter(p => p.path === path)[0]

    const { id: pageid, info, scripts, styles } = page
    bridgeInAdvance({
        appJson: app.json.info,
        path,
        info,
        scripts,
        styles,
        pageid,
        query
    }).then(guid => {
        setPageByGuid(guid)
        success(guid)
    }).catch(err => {
        console.log(err)
    })
}