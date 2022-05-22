const idMap = new Map([[0, self]])
let nextid = -1
let postMessage = () => { }

document.define = (tag, mount, unmount) => {
    let host = null
    const hasDef = customElements.get(tag)
    !hasDef &&
        customElements.define(
            tag,
            class extends HTMLElement {
                constructor() {
                    super()
                    host = this.attachShadow({ mode: 'open' })
                }
                connectedCallback() {
                    mount()
                }
                disconnectedCallback() {
                    unmount()
                }
            }
        )
    return host
}

const wrap = (arg) => {
    if (canClone(arg)) {
        return [0, arg]
    } else {
        return [1, obj2id(arg)]
    }
}

const unwrap = (arr) => {
    switch (arr[0]) {
        case 0: // primitive
            return arr[1]
        case 1: // object
            return id2obj(arr[1])
        case 2: // callback
            return getCb(arr[1])
        case 3: // property
            return id2prop(arr[1], arr[2])
        default:
            throw new Error('invalid arg type')
    }
}

const connect = function connect(worker) {
    postMessage = (data) => worker.postMessage(data)
    worker.onmessage = (e) => onmessage(e.data)
    worker.postMessage('start')
}

function id2obj(id) {
    const ret = idMap.get(id)
    if (!ret) throw new Error('missing object id: ' + id)
    return ret
}

function obj2id(object) {
    const id = nextid--
    idMap.set(id, object)
    return id
}

function id2prop(id, path) {
    const ret = idMap.get(id)
    if (!ret) throw new Error('missing object id: ' + id)
    let base = ret
    for (let i = 0, len = path.length; i < len; ++i) base = base[path[i]]
    return base
}

function getCb(id) {
    return (...args) =>
        postMessage({
            type: 'cb',
            id,
            args: args.map(wrap),
        })
}

navigator.serviceWorker.addEventListener('message', data => {
    switch (data.type) {
        case 'cmds':
            command(data)
            break
        case 'cleanup':
            cleanup(data)
            break
        default:
            console.error('Unknown message type: ' + data.type)
            break
    }
})

function command(data) {
    const res = []
    for (const cmd of data.cmds) process(cmd, res)

    postMessage({
        type: 'done',
        flushId: data.flushId,
        res,
    })
}

function process(arr) {
    const type = arr[0]
    switch (type) {
        case 0:
            call(arr[1], arr[2], arr[3], arr[4], type)
            break
        case 1:
            set(arr[1], arr[2], arr[3])
            break
        case 2:
            call(arr[1], arr[2], arr[3], arr[4], type)
            break
        default:
            throw new Error('invalid cmd type: ' + type)
    }
}

function setAttr(name, value) {
    if (name in this) {
        this[name] = value
    } else {
        this.setAttribute(name, value)
    }
}

Text.prototype.setAttr = setAttr
Element.prototype.setAttr = setAttr

function call(id, path, arg, returnid, isNew) {
    const obj = id2obj(id)
    const args = arg.map(unwrap)
    let base = getBase(obj, path)

    let ret = isNew ? new base(...args) : base(...args)
    idMap.set(returnid, ret)
}

function getBase(obj, path) {
    let base = obj
    let name = path[path.length - 1]
    for (let i = 0; i < path.length - 1; i++) {
        base = base[path[i]]
    }
    if (name === 'setAttribute') name = 'setAttr'
    return base[name].bind(base)
}

function set(id, path, arg) {
    const obj = id2obj(id)
    const value = unwrap(arg)
    const base = getBase(obj, path)
    base = value
}

function cleanup(data) {
    for (const id of data.ids) idMap.delete(id)
}

function canClone(o) {
    const t = typeof o
    return (
        t === 'undefined' ||
        o === null ||
        t === 'boolean' ||
        t === 'number' ||
        t === 'string' ||
        o instanceof Blob ||
        o instanceof ArrayBuffer ||
        o instanceof ImageData
    )
}

export default connect