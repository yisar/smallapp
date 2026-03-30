const [empty] = [[0, 0, 0, 0]];
const { is } = Object;
const { max } = Math;

function measure(obj, ddd, vxy, vwh) {
    const { style, children, nodeType, data } = obj; // [修改] 结构出 nodeType 和 data
    const direction = +(!(style.direction?.charCodeAt(0) === 114)); 
    const xxx = ddd; 
    const yyy = +(!xxx); 
    const cxy = [0, 0, 0, 0, 0]; 
    
    let w = style.width ?? -0;
    let h = style.height ?? -0;
    if (nodeType === 3) {
        w = (data || "").length * 8; 
        h = 16;
    }

    const cwh = [w, h, 0, 0, 0]; 
    const mmm = style.margin ?? empty;
    obj.returns = { xxx, cxy, cwh };
    
    if (style.display?.charCodeAt(0) === 110) return void (cwh[0] = cwh[1] = 0); 
    if ((style.position ?? 'r').charCodeAt(0) === 114) { vxy[0x2] += 1; vwh[0x2] += max(0, style.flex | 0); } 
    
    // 如果是元素节点才递归处理子节点
    if (nodeType === 1) {
        for (let idx = 0; idx < children.length; ++idx) measure(children[idx], direction, cxy, cwh); 
    }

    vwh[0x3] += (is(cwh[xxx], -0) ? cwh[0x3] : cwh[xxx]) + (mmm[xxx + 0] + mmm[xxx + 2]); 
    vwh[0x4] = max(vwh[0x4], (is(cwh[yyy], -0) ? cwh[0x4] : cwh[yyy]) + (mmm[yyy + 0] + mmm[yyy + 2])); 
}

function layout(obj, aaa, jjj, vxy, vwh, gpu) {
    const { style, children, nodeType, returns: { xxx, cxy, cwh } } = obj;
    const yyy = +(!xxx); 
    const ppp = style.padding ?? empty;
    const mmm = style.margin ?? empty;
    const position = +((style.position ?? 'r').charCodeAt(0) === 114); 
    const self = style.alignSelf?.charCodeAt(2);
    const align = style.alignItems?.charCodeAt(2) ?? 97;
    const justify = style.justifyContent?.charCodeAt(2) ?? 0;
    if (self) aaa = self | 0; 
    let activeChildren = (justify === 100) ? [...children].reverse() : children;

    init: {
        cxy[xxx] += mmm[xxx + 0] + ppp[xxx + 0] + vxy[0x4]; 
        cxy[yyy] += mmm[yyy + 0] + ppp[yyy + 0]; 
    }
    size: {
        cwh[0x3] = cwh[0x3] + (ppp[xxx + 0] + ppp[xxx + 2] + ((cxy[0x2] - 1) * max(0, style.gap ?? 0))); 
        cwh[xxx] = is(cwh[xxx], -0) ? (!position ? cwh[0x3] : (vwh[xxx] - vwh[0x3]) * ((max(0, style.flex | 0) || 1) / vwh[0x2])) : cwh[xxx]; 
        cwh[yyy] = is(cwh[yyy], -0) ? (!position ? cwh[0x4] : (vwh[0x4] || vwh[yyy])) : cwh[yyy];
    }
    pos: { 
        for (let [lt, rb, ww, xy, wh] of [[style.left ?? -0, style.right ?? -0, cwh[0x0], 0x0, 0x1], [style.top ?? -0, style.bottom ?? -0, cwh[0x1], 0x1, 0x1]])
            if (!is(lt, -0) && !is(rb, -0) && is(ww, -0)) { 
                cxy[xy] = (position ? cxy : vxy)[xy] + lt; 
                cwh[wh] = vwh[wh] - lt - rb; 
            } else if (lt != null && !is(lt, -0)) cxy[xy] = (position ? cxy : vxy)[xy] + lt; 
            else if (rb != null && !is(rb, -0)) cxy[xy] = vxy[xy] - rb + (position ? 0 : vwh[wh] - cwh[wh]); 
            else if (!position) cxy[xy] = vxy[xy]; 
    }
    align_box: { 
        let [yx, hw] = [[0x1, 0x1], [0x0, 0x0]][xxx]; 
        if (position) switch (aaa) { 
            case 100: cxy[yx] += vwh[hw] - cwh[hw]; break; 
            case 110: cxy[yx] += vwh[hw] / 2 - cwh[hw] / 2; break; 
        }
    }
    justify_box: { 
        let [xy, wh] = [[0x0, 0x0], [0x1, 0x1]][xxx]; 
        if (position) switch (jjj) { 
            case 100: cxy[xy] += vwh[wh] - cwh[wh]; break; 
            case 110: cxy[xy] += vwh[wh] / 2 - cwh[wh] / 2; break; 
        }
    }
    draw: {
        gpu(obj, [vxy[0] + cxy[0], vxy[1] + cxy[1]], [cwh[0], cwh[1]]); 
    }
    each: {
        // 只有元素节点才递归子节点排版
        if (nodeType === 1) {
            for (var idx = 0; idx < activeChildren.length; idx++) layout(activeChildren[idx], align, justify, cxy, cwh, gpu); 
        }
    }
    move: {
        cxy[xxx] += mmm[xxx + 2] + ppp[xxx + 2] + cwh[xxx]; 
        vxy[0x4] += cxy[xxx]; 
    }
}


export default function fakedom() {
    let observers = [], pendingMutations = false

    class Node {
        constructor(nodeType, nodeName) {
            this.nodeType = nodeType
            this.nodeName = nodeName
            this.childNodes = []
            this.style = {} 
            this.children = [] 
            this.layoutRect = { x: 0, y: 0, width: 0, height: 0 }
        }
        appendChild(child) {
            child.remove()
            child.parentNode = this
            this.childNodes.push(child)
            // 无论是否为元素，都加入 children 数组参与排版
            this.children.push(child) 
            mutation(this, 'childList', { addedNodes: [child], previousSibling: this.childNodes[this.childNodes.length - 2] })
        }
        insertBefore(child, ref) {
            child.remove()
            let i = splice(this.childNodes, ref, child), ref2
            if (!ref) { this.appendChild(child) }
            else {
                if (~i) {
                    splice(this.children, ref, child)
                }
                mutation(this, 'childList', { addedNodes: [child], nextSibling: ref })
            }
        }
        removeChild(child) {
            let i = splice(this.childNodes, child)
            splice(this.children, child) // 移除 children 引用
            mutation(this, 'childList', { removedNodes: [child], previousSibling: this.childNodes[i - 1], nextSibling: this.childNodes[i] })
        }
        remove() { if (this.parentNode) this.parentNode.removeChild(this) }
    }

    class Text extends Node {
        constructor(text) {
            super(3, '#text')
            this.data = text
        }
        get textContent() { return this.data }
        set textContent(value) {
            let oldValue = this.data
            this.data = value
            mutation(this, 'characterData', { oldValue })
        }
        get nodeValue() { return this.data }
        set nodeValue(value) { this.textContent = value }
    }

    class Element extends Node {
        constructor(nodeType, nodeName) {
            super(nodeType || 1, nodeName)
            this.attributes = []
            this.__handlers = {}
            Object.defineProperty(this, 'className', {
                set: val => { this.setAttribute('class', val) },
                get: () => this.getAttribute('style')
            })
            Object.defineProperty(this.style, 'cssText', {
                set: val => { this.setAttribute('style', val) },
                get: () => this.getAttribute('style')
            })
        }
        setAttribute(key, value) { this.setAttributeNS(null, key, value) }
        getAttribute(key) { return this.getAttributeNS(null, key) }
        removeAttribute(key) { this.removeAttributeNS(null, key) }
        setAttributeNS(ns, name, value) {
            let attr = findWhere(this.attributes, createAttributeFilter(ns, name)), oldValue = attr && attr.value
            if (!attr) this.attributes.push(attr = { ns, name })
            attr.value = String(value)
            mutation(this, 'attributes', { attributeName: name, attributeNamespace: ns, oldValue })
        }
        getAttributeNS(ns, name) {
            let attr = findWhere(this.attributes, createAttributeFilter(ns, name))
            return attr && attr.value
        }
        removeAttributeNS(ns, name) {
            splice(this.attributes, createAttributeFilter(ns, name))
            mutation(this, 'attributes', { attributeName: name, attributeNamespace: ns, oldValue: this.getAttributeNS(ns, name) })
        }
        addEventListener(type, handler) {
            (this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])).push(handler)
        }
        removeEventListener(type, handler) { splice(this.__handlers[toLower(type)], handler, 0, true) }
        dispatchEvent(event) {
            let t = event.currentTarget = this, c = event.cancelable, l, i
            do {
                l = t.__handlers && t.__handlers[toLower(event.type)]
                if (l) for (i = l.length; i--;) {
                    if ((l[i].call(t, event) === false || event._end) && c) break
                }
            } while (event.bubbles && !(c && event._stop) && (event.target = t = t.parentNode))
            return !event.defaultPrevented
        }
    }

    class Document extends Element {
        constructor() { super(9, '#document') }
        reflow(w, h) {
            const vxy = [0, 0, 0, 0, 0];
            const vwh = [w, h, 0, 0, 0];
            measure(this.body, 1, vxy, vwh);
            layout(this.body, 97, 0, [0, 0, 0, 0, 0], [w, h, vwh[2], vwh[3], vwh[4]], (node, pos, size) => {
                node.layoutRect.x = pos[0];
                node.layoutRect.y = pos[1];
                node.layoutRect.width = size[0];
                node.layoutRect.height = size[1];
            });
        }
    }

    class Event {
        constructor(type, opts) {
            this.type = type; this.bubbles = !!opts.bubbles; this.cancelable = !!opts.cancelable
        }
        stopPropagation() { this._stop = true }
        stopImmediatePropagation() { this._end = this._stop = true }
        preventDefault() { this.defaultPrevented = true }
    }

    function mutation(target, type, record) {
        record.target = target; record.type = type;
        for (let i = observers.length; i--;) {
            let ob = observers[i], match = target === ob._target
            if (!match && ob._options.subtree) {
                let curr = target;
                do { if (match = curr === ob._target) break; } while ((curr = curr.parentNode))
            }
            if (match) {
                ob._records.push(record)
                if (!pendingMutations) { pendingMutations = true; setImmediate(flushMutations); }
            }
        }
    }

    function flushMutations() {
        pendingMutations = false
        for (let i = observers.length; i--;) {
            let ob = observers[i]
            if (ob._records.length) ob.callback(ob.takeRecords())
        }
    }

    class MutationObserver {
        constructor(callback) { this.callback = callback; this._records = []; }
        observe(target, options) {
            this.disconnect(); this._target = target; this._options = options || {};
            observers.push(this)
        }
        disconnect() { this._target = null; splice(observers, this) }
        takeRecords() { return this._records.splice(0, this._records.length) }
    }

    function createElement(type) { return new Element(null, String(type).toUpperCase()) }
    function createTextNode(text) { return new Text(text) }
    function createDocumentFragment() { return new Element(11, '#document-fragment') }

    function createDocument() {
        let document = new Document()
        assign(document, document.defaultView = { document, MutationObserver, Document, Node, Text, Element, Event })
        assign(document, { documentElement: document, createElement, createTextNode, createDocumentFragment })
        document.appendChild(document.body = createElement('body'))
        return document
    }

    return createDocument()
}

export function assign(obj, props) { for (let i in props) obj[i] = props[i] }
export function toLower(str) { return String(str).toLowerCase() }
export function createAttributeFilter(ns, name) { return o => o.ns === ns && toLower(o.name) === toLower(name) }
export function splice(arr, item, add, byValueOnly) {
    let i = arr ? findWhere(arr, item, true, byValueOnly) : -1
    if (~i) add ? arr.splice(i, 0, add) : arr.splice(i, 1)
    return i
}
export function findWhere(arr, fn, returnIndex, byValueOnly) {
    let i = arr.length
    while (i--) if (typeof fn === 'function' && !byValueOnly ? fn(arr[i]) : arr[i] === fn) break
    return returnIndex ? i : arr[i]
}
let resolved = typeof Promise !== 'undefined' && Promise.resolve()
export const setImmediate = resolved ? (f => { resolved.then(f) }) : setTimeout
