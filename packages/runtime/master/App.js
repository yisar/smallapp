import { bridgeInAdvance } from './BridgeInAdvance'
import { initWxApi } from './wxApi/index'
import { initNwxApi } from './nwxApi/index'
import { getQuery } from './BridgeInAdvance'
import { navigateTo } from './wxApi/navigateTo'
import _global from './GlobalValue'

let appInstance = null

export function setApp(app) {
    appInstance = app
}

export function getApp() {
    return appInstance
}

export class App {
    constructor(json) {
        this.json = JSON.parse(json)
        this.pageStack = []
        this.entityMap = new Map()
        // this.lifecycle = {} app 的生命周期不需要单独处理
    }

    _init() {
        this._launch()
        this.initApp()
        const firstPage = this.json.pages[0]

        navigateTo({
            url: firstPage.path,
            success: (guid) => {
                initWxApi(guid)
                initNwxApi(guid)
            }
        })
    }

    initApp() {
        // 加载 app 的文件
    }

    _launch() {
        if (this.onLaunch) {
            this.onLaunch.call(this)
        }
    }

    _unlaunch() {
        if (this.onUnlaunch) {
            this.onUnlaunch.call(this)
        }
    }

    _error() {
        if (this.onError) {
            this.onError.call(this, '还没实现')
        }
    }
}