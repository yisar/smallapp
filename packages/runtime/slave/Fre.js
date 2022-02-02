const updateElement = (dom, aProps, bProps) => {
    for (let name in Object.assign(Object.assign({}, aProps), bProps)) {
        let a = aProps[name];
        let b = bProps[name];
        if (a === b || name === "children") ;
        else if (name === "style" && !isStr(b)) {
            for (const k in Object.assign(Object.assign({}, a), b)) {
                if (!(a && b && a[k] === b[k])) {
                    dom[name][k] = (b === null || b === void 0 ? void 0 : b[k]) || "";
                }
            }
        }
        else if (name[0] === "o" && name[1] === "n") {
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
    }
};
const createElement = (fiber) => {
    const dom = fiber.type === ""
        ? document.createTextNode("")
        : fiber.lane & 16
            ? document.createElementNS("http://www.w3.org/2000/svg", fiber.type)
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
    return [
        hook.length === 0 ? (hook[0] = initState) : hook[0],
        (value) => {
            hook[0] = reducer
                ? reducer(hook[0], value)
                : isFn(value)
                    ? value(hook[0])
                    : value;
            update(current);
        },
    ];
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
    return !a || a.length !== b.length || b.some((arg, index) => arg !== a[index]);
};

const queue = [];
const threshold = 1000 / 60;
const transitions = [];
let deadline = 0;
const startTransition = (cb) => {
    transitions.push(cb) && postMessage();
};
const schedule = (callback) => {
    queue.push({ callback });
    startTransition(flush);
};
const postMessage = (() => {
    const cb = () => transitions.splice(0, 1).forEach((c) => c());
    if (typeof MessageChannel !== "undefined") {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = cb;
        return () => port2.postMessage(null);
    }
    return () => setTimeout(cb);
})();
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
    var _a, _b;
    if (options.sync)
        return false;
    return (((_b = (_a = navigator) === null || _a === void 0 ? void 0 : _a.scheduling) === null || _b === void 0 ? void 0 : _b.isInputPending()) || getTime() >= deadline);
};
const getTime = () => performance.now();
const peek = (queue) => queue[0];

const commit = (fiber) => {
    let d = fiber;
    let e = d.e;
    fiber.e = null;
    do {
        insert(e);
    } while ((e = e.e));
    while ((d = d.d))
        remove(d);
    fiber.d = null;
};
const insert = (fiber) => {
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
        if (d.lane & 8) {
            if (d.hooks) {
                d.hooks.list.forEach(e => e[2] && e[2]());
            }
        }
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
let detach = null;
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
            effect = detach = fiber;
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
            startTransition(() => side(WIP.hooks.effect));
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
    WIP.after = WIP.parentNode['prev'];
    WIP.parentNode['prev'] = WIP.node;
    WIP.node['prev'] = null;
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
        if (!same(aCh[aTail], bCh[bTail]))
            break;
        clone(aCh[aTail--], bCh[bTail], 2, WIP, bTail--);
    }
    while (aHead <= aTail && bHead <= bTail) {
        if (!same(aCh[aHead], bCh[bHead]))
            break;
        bCh[bHead].lane |= 64;
        aHead++;
        bHead++;
    }
    if (aHead > aTail) {
        while (bHead <= bTail) {
            let c = bCh[bTail];
            c.lane = 4;
            linke(c, WIP, bTail--);
        }
    }
    else if (bHead > bTail) {
        while (aHead <= aTail) {
            let c = aCh[aTail--];
            c.lane = 8;
            detach.d = c;
            detach = c;
        }
    }
    else {
        let I = {}, P = [];
        for (let i = bHead; i <= bTail; i++) {
            I[bCh[i].key || '.' + 1] = i;
            P[i] = -1;
        }
        for (let i = aHead; i <= aTail; i++) {
            let idx = I[aCh[i].key || '.' + i];
            if (idx != null) {
                P[idx] = i;
            }
            else {
                let c = aCh[i];
                c.lane = 8;
                detach.d = c;
                detach = c;
            }
        }
        let lis = findLis(P, bHead), li = lis.length - 1;
        while (bHead <= bTail) {
            let c = bCh[bTail];
            if (bTail === lis[li]) {
                clone(aCh[P[bTail]], c, 2, WIP, bTail--);
                li--;
            }
            else {
                if (P[bTail] === -1) {
                    c.lane = 4;
                    linke(c, WIP, bTail--);
                }
                else {
                    clone(aCh[P[bTail]], c, 4, WIP, bTail--);
                }
            }
        }
    }
    while (bHead-- > 0) {
        clone(aCh[bHead], bCh[bHead], 2, WIP, bHead);
    }
};
function linke(kid, WIP, i) {
    kid.parent = WIP;
    if (WIP.lane & 16) {
        kid.lane |= 16;
    }
    if (WIP.isComp && WIP.lane & 4) {
        kid.lane |= 4;
    }
    if (i === WIP.kids.length - 1) {
        WIP.child = kid;
    }
    else {
        WIP._prev.sibling = kid;
    }
    WIP._prev = kid;
}
function clone(a, b, lane, WIP, i) {
    b.oldProps = a.props;
    b.node = a.node;
    b.kids = a.kids;
    b.hooks = a.hooks;
    b.ref = a.ref;
    b.lane = lane;
    linke(b, WIP, i);
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
const findLis = (ns, start) => {
    let seq = [], is = [], l = -1, pre = new Array(ns.length);
    for (var i = start, len = ns.length; i < len; i++) {
        let n = ns[i];
        if (n < 0)
            continue;
        let j = bs(seq, n);
        if (j !== -1)
            pre[i] = is[j];
        if (j === l) {
            l++;
            seq[l] = n;
            is[l] = i;
        }
        else if (n < seq[j + 1]) {
            seq[j + 1] = n;
            is[j + 1] = i;
        }
    }
    for (i = is[l]; l >= 0; i = pre[i], l--) {
        seq[l] = i;
    }
    return seq;
};
const bs = (seq, n) => {
    let lo = -1, hi = seq.length;
    if (hi > 0 && seq[hi - 1] <= n)
        return hi - 1;
    while (hi - lo > 1) {
        let mid = (lo + hi) >> 1;
        if (seq[mid] > n) {
            hi = mid;
        }
        else {
            lo = mid;
        }
    }
    return lo;
};
const getCurrentFiber = () => currentFiber || null;
const isFn = (x) => typeof x === 'function';
const isStr = (s) => typeof s === 'number' || typeof s === 'string';

const h = (type, props, ...kids) => {
    props = props || {};
    const c = arrayfy(props.children || kids);
    kids = flat(c).filter(some);
    if (kids.length)
        props.children = kids.length === 1 ? kids[0] : kids;
    let key = props.key || null, ref = props.ref || null;
    delete props.key;
    delete props.ref;
    return createVnode(type, props, key, ref);
};
const some = (x) => x != null && x !== true && x !== false;
const flat = (arr) => [].concat(...arr.map((v) => isArr(v) ? [].concat(flat(v)) : isStr(v) ? createText(v) : v));
const createVnode = (type, props, key, ref) => ({
    type,
    props,
    key,
    ref
});
const createText = (vnode) => ({ type: "", props: { nodeValue: vnode + "" } });
function Fragment(props) {
    return props.children;
}
const isArr = Array.isArray;

export { Fragment, h as createElement, h, render, shouldYield, startTransition, useCallback, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };