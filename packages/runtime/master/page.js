import {getApp} from './app'

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
        this.methods = {}
        for (const key in option) {
            if(key != 'data' && !key.startsWith('on')){
               this.methods[key] = option[key] 
            }
            
        }
    }
}