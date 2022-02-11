const defaultObj = {};
const jointIter = (aProps, bProps, callback) => {
    aProps = aProps || defaultObj;
    bProps = bProps || defaultObj;
    Object.keys(aProps).forEach(k => callback(k, aProps[k], bProps[k]));
    Object.keys(bProps).forEach(k => !aProps.hasOwnProperty(k) && callback(k, undefined, bProps[k]));
};
const updateElement = (dom, aProps, bProps) => {
    jointIter(aProps, bProps, (name, a, b) => {
        if (a === b || name === 'children') ;
        else if (name === 'style' && !isStr(b)) {
            jointIter(a, b, (styleKey, aStyle, bStyle) => {
                if (aStyle !== bStyle) {
                    dom[name][styleKey] = bStyle || '';
                }
            });
        }
        else if (name[0] === 'o' && name[1] === 'n') {
            name = name.slice(2).toLowerCase();
            if (a)
                dom.removeEventListener(name, a);
            dom.addEventListener(name, b);
        }
        else if (name in dom && !(dom instanceof SVGElement)) {
            dom[name] = b || '';
        }
        else if (b == null || b === false) {
            dom.removeAttribute(name);
        }
        else {
            dom.setAttribute(name, b);
        }
    });
};
const createElement = (fiber) => {
    const dom = fiber.type === '#text'
        ? document.createTextNode('')
        : fiber.lane & 16
            ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type)
            : document.createElement(fiber.type);
    updateElement(dom, {}, fiber.props);
    return dom;
};

let cursor = 0;
const resetCursor = () => {
    cursor = 0;
};
const useState = (initState) => {
    return useReducer(null, initState);
};
const useReducer = (reducer, initState) => {
    const [hook, current] = getHook(cursor++);
    if (hook.length === 0) {
        hook[0] = initState;
        hook[1] = (value) => {
            hook[0] = reducer
                ? reducer(hook[0], value)
                : isFn(value)
                    ? value(hook[0])
                    : value;
            update(current);
        };
    }
    return hook;
};
const useEffect = (cb, deps) => {
    return effectImpl(cb, deps, "effect");
};
const useLayout = (cb, deps) => {
    return effectImpl(cb, deps, "layout");
};
const effectImpl = (cb, deps, key) => {
    const [hook, current] = getHook(cursor++);
    if (isChanged(hook[1], deps)) {
        hook[0] = cb;
        hook[1] = deps;
        current.hooks[key].push(hook);
    }
};
const useMemo = (cb, deps) => {
    const hook = getHook(cursor++)[0];
    if (isChanged(hook[1], deps)) {
        hook[1] = deps;
        return (hook[0] = cb());
    }
    return hook[0];
};
const useCallback = (cb, deps) => {
    return useMemo(() => cb, deps);
};
const useRef = (current) => {
    return useMemo(() => ({ current }), []);
};
const getHook = (cursor) => {
    const current = getCurrentFiber();
    const hooks = current.hooks || (current.hooks = { list: [], effect: [], layout: [] });
    if (cursor >= hooks.list.length) {
        hooks.list.push([]);
    }
    return [hooks.list[cursor], current];
};
const isChanged = (a, b) => {
    return !a || a.length !== b.length || b.some((arg, index) => !Object.is(arg, a[index]));
};

const queue = [];
const threshold = 5;
const transitions = [];
let deadline = 0;
const startTransition = cb => {
    transitions.push(cb) && translate();
};
const schedule = (callback) => {
    queue.push({ callback });
    startTransition(flush);
};
const task = (pending) => {
    const cb = () => transitions.splice(0, 1).forEach(c => c());
    if (!pending && typeof Promise !== 'undefined') {
        return () => queueMicrotask(cb);
    }
    if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = cb;
        return () => port2.postMessage(null);
    }
    return () => setTimeout(cb);
};
let translate = task(false);
const flush = () => {
    deadline = getTime() + threshold;
    let job = peek(queue);
    while (job && !shouldYield()) {
        const { callback } = job;
        job.callback = null;
        const next = callback();
        if (next) {
            job.callback = next;
        }
        else {
            queue.shift();
        }
        job = peek(queue);
    }
    job && startTransition(flush);
};
const shouldYield = () => {
    const pending = getTime() >= deadline;
    translate = task(pending);
    return pending;
};
const getTime = () => performance.now();
const peek = (queue) => queue[0];

const commit = (fiber) => {
    let e = fiber.e;
    fiber.e = null;
    do {
        insert(e);
    } while ((e = e.e));
};
const insert = (fiber) => {
    if (fiber.lane === 8) {
        remove(fiber);
        return;
    }
    if (fiber.lane & 2) {
        updateElement(fiber.node, fiber.oldProps || {}, fiber.props);
    }
    if (fiber.lane & 4) {
        fiber.parentNode.insertBefore(fiber.node, fiber.after);
    }
    refer(fiber.ref, fiber.node);
};
const refer = (ref, dom) => {
    if (ref)
        isFn(ref) ? ref(dom) : (ref.current = dom);
};
const kidsRefer = (kids) => {
    kids.forEach(kid => {
        kid.kids && kidsRefer(kid.kids);
        refer(kid.ref, null);
    });
};
const remove = d => {
    if (d.isComp) {
        d.hooks && d.hooks.list.forEach(e => e[2] && e[2]());
        d.kids.forEach(remove);
    }
    else {
        kidsRefer(d.kids);
        d.parentNode.removeChild(d.node);
        refer(d.ref, null);
    }
};

let currentFiber;
let finish = null;
let effect = null;
let options = {};
const render = (vnode, node, config) => {
    const rootFiber = {
        node,
        props: { children: vnode },
    };
    if (config) {
        options = config;
    }
    update(rootFiber);
};
const update = (fiber) => {
    if (fiber && !(fiber.lane & 32)) {
        fiber.lane = 2 | 32;
        schedule(() => {
            effect = fiber;
            return reconcile(fiber);
        });
    }
};
const reconcile = (WIP) => {
    while (WIP && !shouldYield())
        WIP = capture(WIP);
    if (WIP)
        return reconcile.bind(null, WIP);
    if (finish) {
        commit(finish);
        finish = null;
        options.done && options.done();
    }
    return null;
};
const capture = (WIP) => {
    WIP.isComp = isFn(WIP.type);
    WIP.isComp ? updateHook(WIP) : updateHost(WIP);
    if (WIP.child)
        return WIP.child;
    while (WIP) {
        bubble(WIP);
        if (!finish && WIP.lane & 32) {
            finish = WIP;
            WIP.lane &= ~32;
            return null;
        }
        if (WIP.sibling)
            return WIP.sibling;
        WIP = WIP.parent;
    }
};
const bubble = WIP => {
    if (WIP.isComp) {
        if (WIP.hooks) {
            side(WIP.hooks.layout);
            schedule(() => side(WIP.hooks.effect));
        }
    }
    else {
        effect.e = WIP;
        effect = WIP;
    }
};
const updateHook = (WIP) => {
    resetCursor();
    currentFiber = WIP;
    let children = WIP.type(WIP.props);
    diffKids(WIP, simpleVnode(children));
};
const updateHost = (WIP) => {
    WIP.parentNode = getParentNode(WIP) || {};
    if (!WIP.node) {
        if (WIP.type === 'svg')
            WIP.lane |= 16;
        WIP.node = createElement(WIP);
    }
    WIP.childNodes = Array.from(WIP.node.childNodes || []);
    diffKids(WIP, WIP.props.children);
};
const simpleVnode = (type) => isStr(type) ? createText(type) : type;
const getParentNode = (WIP) => {
    while ((WIP = WIP.parent)) {
        if (!WIP.isComp)
            return WIP.node;
    }
};
const diffKids = (WIP, children) => {
    let aCh = WIP.kids || [], bCh = (WIP.kids = arrayfy(children)), aHead = 0, bHead = 0, aTail = aCh.length - 1, bTail = bCh.length - 1;
    while (aHead <= aTail && bHead <= bTail) {
        if (!same(aCh[aHead], bCh[bHead]))
            break;
        clone(aCh[aHead++], bCh[bHead++], 2);
    }
    while (aHead <= aTail && bHead <= bTail) {
        if (!same(aCh[aTail], bCh[bTail]))
            break;
        clone(aCh[aTail--], bCh[bTail--], 2);
    }
    const { diff, keymap } = lcs(bCh, aCh, bHead, bTail, aHead, aTail);
    let len = diff.length;
    for (let i = 0, aIndex = aHead, bIndex = bHead, mIndex; i < len; i++) {
        const op = diff[i];
        if (op === 2) {
            if (!same(aCh[aIndex], bCh[bIndex])) {
                bCh[bIndex].lane = 4;
                aCh[aIndex].lane = 8;
                effect.e = aCh[aIndex];
                effect = aCh[aIndex];
            }
            else {
                clone(aCh[aIndex], bCh[bIndex], 2);
            }
            aIndex++;
            bIndex++;
        }
        else if (op === 4) {
            let c = bCh[bIndex];
            mIndex = c.key != null ? keymap[c.key] : null;
            if (mIndex != null) {
                clone(aCh[mIndex], c, 4);
                c.after = WIP.childNodes[aIndex];
                aCh[mIndex] = undefined;
            }
            else {
                c.after = WIP.childNodes ? WIP.childNodes[aIndex] : null;
                c.lane = 4;
            }
            bIndex++;
        }
        else if (op === 8) {
            aIndex++;
        }
    }
    for (let i = 0, aIndex = aHead; i < len; i++) {
        let op = diff[i];
        if (op === 2) {
            aIndex++;
        }
        else if (op === 8) {
            let c = aCh[aIndex];
            if (c !== undefined) {
                c.lane = 8;
                effect.e = c;
                effect = c;
            }
            aIndex++;
        }
    }
    for (let i = 0, prev = null, len = bCh.length; i < len; i++) {
        const child = bCh[i];
        if (WIP.lane & 16) {
            child.lane |= 16;
        }
        child.parent = WIP;
        if (i > 0) {
            prev.sibling = child;
        }
        else {
            WIP.child = child;
        }
        prev = child;
    }
};
function clone(a, b, lane) {
    b.hooks = a.hooks;
    b.ref = a.ref;
    b.node = a.node;
    b.oldProps = a.props;
    b.lane = lane;
    b.kids = a.kids;
}
const same = (a, b) => {
    return a && b && a.key === b.key && a.type === b.type;
};
const arrayfy = arr => (!arr ? [] : isArr(arr) ? arr : [arr]);
const side = (effects) => {
    effects.forEach(e => e[2] && e[2]());
    effects.forEach(e => (e[2] = e[0]()));
    effects.length = 0;
};
function lcs(bArr, aArr, bHead = 0, bTail = bArr.length - 1, aHead = 0, aTail = aArr.length - 1) {
    let keymap = {}, unkeyed = [], idxUnkeyed = 0, ch, item, k, idxInOld, key;
    let newLen = bArr.length;
    let oldLen = aArr.length;
    let minLen = Math.min(newLen, oldLen);
    let tresh = Array(minLen + 1);
    tresh[0] = -1;
    for (var i = 1; i < tresh.length; i++) {
        tresh[i] = aTail + 1;
    }
    let link = Array(minLen);
    for (i = aHead; i <= aTail; i++) {
        item = aArr[i];
        key = item.key;
        if (key != null) {
            keymap[key] = i;
        }
        else {
            unkeyed.push(i);
        }
    }
    for (i = bHead; i <= bTail; i++) {
        ch = bArr[i];
        idxInOld = ch.key == null ? unkeyed[idxUnkeyed++] : keymap[ch.key];
        if (idxInOld != null) {
            k = bs(tresh, idxInOld);
            if (k >= 0) {
                tresh[k] = idxInOld;
                link[k] = { newi: i, oldi: idxInOld, prev: link[k - 1] };
            }
        }
    }
    k = tresh.length - 1;
    while (tresh[k] > aTail)
        k--;
    let ptr = link[k];
    let diff = Array(oldLen + newLen - k);
    let curNewi = bTail, curOldi = aTail;
    let d = diff.length - 1;
    while (ptr) {
        const { newi, oldi } = ptr;
        while (curNewi > newi) {
            diff[d--] = 4;
            curNewi--;
        }
        while (curOldi > oldi) {
            diff[d--] = 8;
            curOldi--;
        }
        diff[d--] = 2;
        curNewi--;
        curOldi--;
        ptr = ptr.prev;
    }
    while (curNewi >= bHead) {
        diff[d--] = 4;
        curNewi--;
    }
    while (curOldi >= aHead) {
        diff[d--] = 8;
        curOldi--;
    }
    return {
        diff,
        keymap,
    };
}
function bs(ktr, j) {
    let lo = 1;
    let hi = ktr.length - 1;
    while (lo <= hi) {
        let mid = (lo + hi) >>> 1;
        if (j < ktr[mid])
            hi = mid - 1;
        else
            lo = mid + 1;
    }
    return lo;
}
const getCurrentFiber = () => currentFiber || null;
const isFn = (x) => typeof x === 'function';
const isStr = (s) => typeof s === 'number' || typeof s === 'string';

const h = (type, props, ...kids) => {
    props = props || {};
    kids = flat(arrayfy(props.children || kids));
    if (kids.length)
        props.children = kids.length === 1 ? kids[0] : kids;
    const key = props.key || null;
    const ref = props.ref || null;
    if (key)
        props.key = undefined;
    if (ref)
        props.ref = undefined;
    return createVnode(type, props, key, ref);
};
const some = (x) => x != null && x !== true && x !== false;
const flat = (arr, target = []) => {
    arr.forEach(v => {
        isArr(v)
            ? flat(v, target)
            : some(v) && target.push(isStr(v) ? createText(v) : v);
    });
    return target;
};
const createVnode = (type, props, key, ref) => ({
    type,
    props,
    key,
    ref,
});
const createText = (vnode) => ({ type: '#text', props: { nodeValue: vnode + '' } });
function Fragment(props) {
    return props.children;
}
function memo(fn) {
    fn.memo = true;
    return fn;
}
const isArr = Array.isArray;

export { Fragment, h as createElement, h, memo, render, shouldYield, schedule as startTranstion, useCallback, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };
