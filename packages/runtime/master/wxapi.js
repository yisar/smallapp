let callbacks = {}

let index = 0;

export const wx = {
    navigateTo(options) {
        sendMessage('navigateTo', options)
    },
    showToast(options) {
        sendMessage('showToast', options)
    },
    showPicker(options) {
        sendMessage('showPicker', options)
    },
    request(url, data) {
        if (typeof fetch !== 'undefined') {
            return new Promise(resolve => {
                fetch(url, data).then(res => res.json()).then(data => {
                    resolve(data)
                })
            })
        }
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

function sendMessage(name, options) {
    const args = {
        type: 'wxapi',
        name: name,
        options: serOptions(options)
    }
    send(args)
}

export function handleWxEvent(data) {
    let callback = callbacks[data.id]
    callback(data.res)
    callbacks[data.id] = undefined
}