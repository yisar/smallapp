import { getInsById, getApp } from "./app"
let currentComponent = null

const app = getApp()

export function Component(option) {
    const { pid, tag, id } = Component
    const parent = getInsById(pid)
    const c = new _Component(id, tag, pid, option)
    parent.children.set(id, c)
    currentComponent = c
    app.graph[id] = c
}

export function getCurrentPage() {
    return currentPage
}

class _Component {
    constructor(id, tag, pid, option) {
        this.id = id
        this.tag = tag
        this.pid = pid
        this.children = new Map()
        this.parent = null
        this.eventMap = {}
        for (const key in option) {
            this[key] = option[key]
        }
    }

    setData(data) {
        this.data = { ...this.data, ...data }
        const setState = global.setStates[this.id]
        setState(this.data)
    }

    triggerEvent(name, e) {
        const parent = getInsById(this.pid)
        const realname = parent.eventMap['bind' + name]
        e.target.dataset = e.dataset
        console.log(e)
        parent[realname].call(parent, e)
    }
}