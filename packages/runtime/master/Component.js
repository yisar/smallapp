import { getPage } from "./Page"
import { walkBehaviors } from "./Behavior"

export class Component {
    constructor(id, tag, option) {
        this.id = id
        this.tag = tag
        this.children = new Map()
        this.parent = null
        this.keyMap = {}
        this.lifecycles = {
            attached: [],
            detached: []
        }
        this._init(option)
    }

    _init(option) {
        for (const key in option) {
            this[key] = option[key]
        }
        if (this.behaviors) {
            walkBehaviors(this.behaviors)
        }
    }

    _attached() {
        if ((this.lifetimes || {}).attached) {
            this.lifetimes.attached.call(this)
        } else if (this.attached) {
            this.attached.call(this)
        }
    }

    _ready() {
        this.lifecycles.attached.forEach(this._attached)
    }

    _unready() {
        this.lifecycles.detached.forEach(this._attached)
    }


    setData(data) {
        this.data = { ...this.oldData, ...data }
        this.emit(this.data, 'setData')
    }

    triggerEvent(key, detail, option) {
        const p = this.parent
        const name = p.keyMap[key]
        p[name].call(this, detail, option)
    }

    emit(data, kind) {
        const page = getPage()
        JSSDK.sendMessage.call(this, { type: 'message', kind, toGuid: page.guid, data })
    }
}
