import _global from "../GlobalValue";
import { getPage } from "../Page";
import {navigateTo} from './navigateTo'

let callbacks = {}
let seq = 0

export function initWxApi(guid) {
    var self = _global.self;

    const keys =  []
    keys.forEach(key => {
        self.wx = self.wx || {}
        self.wx[key] = (args) => {
            args = wrap(args, key)
            JSSDK.callNative(key, args)
        }
    });

    self.wx.navigateTo = navigateTo
}

function wrap(arg, key) {
    const page = getPage()
    for (const a in arg) {
        let id = `wx.${key}.${a}.${seq++}.${page.id}`
        callbacks[id] = arg[a]
        if (typeof arg[a] === 'function') {
            arg[a] = id
        }
    }
    return arg
}

export function handleWxApi(type, args) {
    const fn = callbacks[type]
    if (fn) {
        fn.apply(null, args)
    }
}