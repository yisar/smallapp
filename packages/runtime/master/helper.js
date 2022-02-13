import { getInsById } from "./app";

export function $handleEvent(name, id, type) {
    const ins = getInsById(id)
    const method = ins[name] || ins.methods[name] || function () { }
    return (e) => {
        if (e.type === 'keydown' && e.keyCode !== 13) {
            return
        }
        method.call(ins, e)
    }
}

export const $for = (arr, fn, key) => {
    arr = arr || []
    return arr.map((item) => fn(item))
}
