window.$for = (arr, fn, key) => {
    arr = arr || []
    return arr.map((item) => fn(item))
}


window.$handleEvent = (name, id, alias, ev) => {
    // 只需要自定义组件的 keymap
    JSSDK.sendMessage({ type: 'message', name, pageid: id, alias, kind: 'keymap' })

    return e => {
        if (alias === 'confirm') {
            if (e.keyCode !== 13) return
        }
        let event = createEv(e, ev)
        JSSDK.sendMessage({ type: 'message', event, name, pageid: id, kind: 'action' })
    }
}

window.$mount = (id) => {
    JSSDK.sendMessage({ type: 'message', pageid: id, kind: 'ready' })
}

window.$unmount = (id) => {
    JSSDK.sendMessage({ type: 'message', pageid: id, kind: 'unready' })
}

function createEv(e, ev) {
    if (ev) {
        var detail = ev.detail
    } else {
        detail = {
            value: e.target.value,
        }
    }
    return {
        type: e.type,
        tartget: {
            dataset: e.target.dataset,
        },
        currentTarget: {},
        detail,
    }
}