import { getApp } from './app'
import { setter } from './expr'
import { global } from './global'

let currentPage = null
const app = getApp()
export function Page(option) {
    const pageid = Page.id
    const page = new _Page(pageid, option)
    app.graph[pageid] = page
    currentPage = page
}

export function getCurrentPage() {
    return currentPage
}

class _Page {
    constructor(id, option) {
        this.id = id
        this.children = new Map()
        this.parent = null
        this.eventMap = {}
        for (const key in option) {
            this[key] = option[key]
        }
    }

    setData(data, extra) {
        this.data = { ...this.data, ...data }
        const setState = global.setStates[this.id]
        if (typeof data === 'string') {
            setter(data)(this.data, extra)
        }
        setState(this.data)
    }
}