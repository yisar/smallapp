import { getCurrentPages, getPage } from "./Page"
import { Component } from './Component'
import { getApp } from "./App"
import _global from "./GlobalValue";


export function pageInit(context) {
    let polyfill = {
        Page: page,
        Component: component,
        getApp,
        getCurrentPages
    }
    let js = context.js
    try {
        new Function('polyfill', `
            with(polyfill){
                ${js}
            }
        `)(polyfill)
    } catch (e) {
        console.log(e)
    }

}

function page(option) {
    const p = getPage()
    const app = getApp()
    p.id = page.id
    for (const key in option) {
        p[key] = option[key]
    }
    app.entityMap.set(page.id, p)
}

function component(option) {
    const { id, pid, tag } = component
    const app = getApp()
    const parent = getPageById(pid)
    console.log(parent)
    const c = new Component(id, tag, option)
    parent.children.set(id, c)
    c.parent = parent
    app.entityMap.set(id, c)
}

export function getPageById(id) {
    const app = getApp()
    return app.entityMap.get(id + '')
}

export function getPageByGuid(guid) {
    const app = getApp()
    return app.entityMap.get(guid)
}

export function setPageByGuid(guid) {
    const page = getPage()
    const app = getApp()
    app.entityMap.set(guid, page)
}
