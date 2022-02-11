import { getInsById } from "./app";

export function $handleEvent(name, id,type){
    const ins = getInsById(id)
    const method = ins.methods[name]
    return method
}