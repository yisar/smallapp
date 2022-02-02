import { Page } from "./Page"
import Global from './GlobalValue'
import { getApp } from "./App"

export function bridgeInAdvance(data) {
    const { path, info, styles, scripts, appJson, pageid, query } = data

    try {
        var content = JSSDK.readFileSync(`${Global.channelName}/${scripts[0]}`)
        var script = JSSDK.readFileSync(`${Global.channelName}/${scripts[1]}`)
        var style = JSSDK.readFileSync(`${Global.channelName}/${styles[0]}`)
    } catch (e) {
        console.log(e)
    }

    const page = new Page(content)
    const app = getApp()
    app.pageStack.push(page)
    page._init(query)


    const config = {
        pageName: path,
        pageJSON: { navigationBarTitleText: appJson.window.navigationBarTitleText, ...info },
        appJson,
        script,
        style,
        query,
        url: makeUrl(path),
        config: {
            needShare: true,
            isTabbarPage: true,
            isShowHomeButton: true,
            isBlockDismiss: page.onBack,
            isBlockBack: page.onClose
        },
        pageid,
        option: {
            data: page.data
        }
    }

    return new Promise((resolve, reject) => {
        try {
            JSSDK.bridgeInAdvance(config, (err, res) => {
                page.guid = res.guid
                resolve(res.guid)
                reject(err)
            })
        } catch (e) {
            reject(e)
        }
    })
}

function makeUrl(url) {
    const channelName = 'v3demo'
    return url + `?__engine=mini&__jsCoreGuid=jscore-0&__channelName=${channelName}`
}

export function getQuery(url) {
    let query = {}, path = url
    if (url.indexOf("?") != -1) {
        let str = url.split('?')
        path = str[0]
        let strs = str[1].split("&")
        for (let i = 0; i < strs.length; i++) {
            query[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1])
        }
    }
    return { query, path }
}
