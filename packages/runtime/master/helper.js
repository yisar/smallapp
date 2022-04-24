import { getInsById } from "./app";


export function $event(name, id, custom) {
    const ins = getInsById(id)
    const method = ins[name] || (ins.methods || {})[name] || function () { }
    ins.eventMap[custom] = name
    return (e) => {
        if (e.type === 'keydown' && e.keyCode !== 13) {
            return
        }
        if (e.target) {
            e.target.dataset = e.dataset // 兼容微信
        }
        method.call(ins, e)
    }
}

export const $for = (arr, fn, key) => {
    arr = arr || []
    return arr.map((item, index) => {
        const vdom = fn(item)
        vdom.key = key || index
        return vdom
    })
}
