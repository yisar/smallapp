const graph = {}
const stack = []
let currentPage = null

export function Page(option) {
    const pageid = Page.id
    const page = new _Page(pageid, option)
    graph[pageid] = page
    currentPage = page
}

export function getPageById(id){
    return graph[id]
}

export function getCurrentPage() {
    return currentPage
}

class _Page {
    constructor(id, option) {
        this.id = id
        this.children = new Map()
        this.parent = null
        for (const key in option) {
            this[key] = option
        }
    }
}