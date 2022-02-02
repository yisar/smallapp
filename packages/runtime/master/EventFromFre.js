import { Page } from "./Page"
import { getPageById } from "./PageInit"

export function invokeCoreCallback(data) {
    const { kind, event, pageid, name,alias } = data
    let page = null
    switch (kind) {
        case 'action':
            page = getPageById(pageid)
            if (page instanceof Page) {
                page[name].call(page, event)
            } else {
                // 组件
                page.methods[name].call(page, event)
            }
            break
        case 'mount':
            page = getPageById(pageid)
            page._ready()
            break
        case 'unmount':
            page = getPageById(pageid)
            page._unready()
            break    
        case 'keymap':
            page = getPageById(pageid)
            // myevent = realname
            page.keyMap[alias] = name
            break
        default:
            break    
    }
}