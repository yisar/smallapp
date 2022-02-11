import { getPageById } from "./page"

const graph = {}
let currentComponent = null

export function Component(option) {
    const { pid, tag, id } = Component
    const parent = getPageById(pid)
    const c = new _Component(id, tag, pid, option)
    parent.children.set(id, c)
    currentComponent = c
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
        for (const key in option) {
            this[key] = option
        }
    }
}