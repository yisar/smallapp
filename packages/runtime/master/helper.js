import { getInsById } from "./app";

export function $handleEvent(name, id, type) {
    const ins = getInsById(id)
    const method = ins[name]
    return method.bind(ins)
}

export const $for = (arr, fn, key) => {
    arr = arr || []
    return arr.map((item) => fn(item))
}
