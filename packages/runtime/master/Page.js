import { getApp } from "./App"
import { pageInit } from "./PageInit"

export function getPage(id) {
    const app = getApp()
    if (app) {
        return id ? app.entityMap.get(id) : app.pageStack[app.pageStack.length - 1]
    } else {
        return {}
    }

}

export function getCurrentPages(){
    const app = getApp()
    return app.pageStack
}

export class Page {
    constructor(js) {
        this.js = js
        this.children = new Map()
        this.parent = null
        this.keyMap = {} // 存储 alias 和 key 的 map
        this.lifecycles = { // 生命周期是栈
            load: [],
            show: [],
            hide: [],
            unload: []
        }
    }

    _init(query) {

        pageInit(this)

        this._load(query)
    }

    _show() {
        // native 发过来的
        if (this.onShow) {
            this.onShow.call(this)
        }
    }

    _ready() {
        // fre 发过来的
        if (this.onReady) {
            this.onReady.call(this)
        }
    }

    _load(query) {
        if (this.onLoad) {
            this.onLoad.call(this, query)
        }
    }

    _unload() {
        // native 发过来的
        if (this.onUnload) {
            this.onUnload.call(this)
        }
    }

    _error() {
        if (this.onError) {
            this.onError.call(this, '还没实现')
        }
    }

    setData(data) {
        this.data = { ...this.data, ...data }
        this.emit(this.data, 'setData')
    }
    emit(data, kind) {
        JSSDK.sendMessage.call(this, { type: 'message', kind, toGuid: this.guid, data, id: this.id })
    }
}