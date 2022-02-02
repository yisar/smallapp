export function invokeWebviewCallback(option) {
    const { data, id: componentid, kind } = option
    switch (kind) {
        case 'setData':
            const setSate = window.components[componentid]
            requestAnimationFrame(() => setSate(data))
            break
        case 'triggerEvent':
            const { name,key, detail, pid } = data
            const fn = window.$handleEvent(name, pid, key)
            fn({ detail, option })
            break
    }
}