let callbacks = {}

let index = 0;

export const wx = {
    navigateTo(options) {
        send({
            type: 'wxapi',
            name: 'navigateTo',
            options: serOptions(options)
        })
    }
}

function serOptions(options) {
    let out = {}
    for (const key in options) {
        let val = options[key]
        if (typeof val === 'function') {
            out[key] = index
            callbacks[index++] = val
        } else {
            out[key] = val
        }
    }
    return out
}

export function handleWxEvent(data){
    let callback = callbacks[data.id]
    callback(data.res)
}