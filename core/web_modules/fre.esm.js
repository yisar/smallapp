const updateElement = (dom, oldProps, newProps) => {
    for (let name in Object.assign(Object.assign({}, oldProps), newProps)) {
        let oldValue = oldProps[name];
        let newValue = newProps[name];
        if (oldValue === newValue || name === 'children') ;
        else if (name === 'style') {
            for (const k in Object.assign(Object.assign({}, oldValue), newValue)) {
                if (!(oldValue && newValue && oldValue[k] === newValue[k])) {
                    dom[name][k] = (newValue === null || newValue === void 0 ? void 0 : newValue[k]) || '';
                }
            }
        }
        else if (name[0] === 'o' && name[1] === 'n') {
            name = name.slice(2).toLowerCase();
            if (oldValue)
                dom.removeEventListener(name, oldValue);
            dom.addEventListener(name, newValue);
        }
        else if (name in dom && !(dom instanceof SVGElement)) {
            dom[name] = newValue || '';
        }
        else if (newValue == null || newValue === false) {
            dom.removeAttribute(name);
        }
        else {
            dom.setAttribute(name, newValue);
        }
    }
};
const createElement = (fiber) => {
    const dom = fiber.type === 'text'
        ? document.createTextNode('')
        : fiber.op & (1 << 4)
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
    if (hook[2] & (1 << 3 >> 3)) {
        hook[0] = initState;
        hook[2] = 0b1100;
    }
    else if (hook[2] & (1 << 3 >> 2)) {
        hook[2] = 0b1000;
    }
    else {
        hook[0] = isFn(hook[1]) ? hook[1](hook[0]) : hook.length ? hook[1] : initState;
    }
    return [
        hook[0],
        (action) => {
            hook[1] = reducer ? reducer(hook[0], action) : action;
            hook[2] = reducer && action.type[0] === '*' ? 0b1100 : 0b1000;
            dispatchUpdate(current);
        },
    ];
};
const useEffect = (cb, deps) => {
    return effectImpl(cb, deps, 'effect');
};
const useLayout = (cb, deps) => {
    return effectImpl(cb, deps, 'layout');
};
const effectImpl = (cb, deps, key) => {
    const [hook, current] = getHook(cursor++);
    if (isChanged(hook[1], deps)) {
        hook[0] = useCallback(cb, deps);
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

const macroTask = [];
let deadline = 0;
const threshold = 1000 / 60;
const callbacks = [];
const schedule = (cb) => callbacks.push(cb) === 1 && postMessage();
const scheduleWork = (callback) => {
    const currentTime = getTime();
    const newTask = {
        callback,
        time: currentTime + 3000,
    };
    macroTask.push(newTask);
    schedule(flushWork);
};
const postMessage = (() => {
    const cb = () => callbacks.splice(0, callbacks.length).forEach((c) => c());
    if (typeof MessageChannel !== 'undefined') {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = cb;
        return () => port2.postMessage(null);
    }
    return () => setTimeout(cb);
})();
const flush = (initTime) => {
    let currentTime = initTime;
    let currentTask = peek(macroTask);
    while (currentTask) {
        const timeout = currentTask.time <= currentTime;
        if (!timeout && shouldYield())
            break;
        const callback = currentTask.callback;
        currentTask.callback = null;
        const next = callback(timeout);
        next ? (currentTask.callback = next) : macroTask.shift();
        currentTask = peek(macroTask);
        currentTime = getTime();
    }
    return !!currentTask;
};
const peek = (queue) => {
    queue.sort((a, b) => a.time - b.time);
    return queue[0];
};
const flushWork = () => {
    const currentTime = getTime();
    deadline = currentTime + threshold;
    flush(currentTime) && schedule(flushWork);
};
const shouldYield = () => {
    return getTime() >= deadline;
};
const getTime = () => performance.now();

let preCommit;
let currentFiber;
let WIP;
let commits = [];
const microTask = [];
const render = (vnode, node, done) => {
    const rootFiber = {
        node,
        props: { children: vnode },
        done,
    };
    dispatchUpdate(rootFiber);
};
const dispatchUpdate = (fiber) => {
    if (fiber && !fiber.lane) {
        fiber.lane = true;
        microTask.push(fiber);
    }
    scheduleWork(reconcileWork);
};
const reconcileWork = (timeout) => {
    if (!WIP)
        WIP = microTask.shift();
    while (WIP && (!shouldYield() || timeout))
        WIP = reconcile(WIP);
    if (WIP && !timeout)
        return reconcileWork.bind(null);
    if (preCommit)
        commitWork(preCommit);
    return null;
};
const reconcile = (WIP) => {
    WIP.parentNode = getParentNode(WIP);
    isFn(WIP.type) ? updateHook(WIP) : updateHost(WIP);
    WIP.lane = WIP.lane ? false : 0;
    WIP.parent && commits.push(WIP);
    if (WIP.child)
        return WIP.child;
    while (WIP) {
        if (!preCommit && WIP.lane === false) {
            preCommit = WIP;
            return null;
        }
        if (WIP.sibling)
            return WIP.sibling;
        WIP = WIP.parent;
    }
};
const updateHook = (WIP) => {
    if (WIP.lastProps === WIP.props)
        return;
    currentFiber = WIP;
    resetCursor();
    let children = WIP.type(WIP.props);
    if (isStr(children))
        children = createText(children);
    reconcileChildren(WIP, children);
};
const updateHost = (WIP) => {
    if (!WIP.node) {
        if (WIP.type === 'svg')
            WIP.op |= 1 << 4;
        WIP.node = createElement(WIP);
    }
    const p = WIP.parent || {};
    WIP.insertPoint = p.last || null;
    p.last = WIP;
    WIP.last = null;
    reconcileChildren(WIP, WIP.props.children);
};
const getParentNode = (WIP) => {
    while ((WIP = WIP.parent)) {
        if (!isFn(WIP.type))
            return WIP.node;
    }
};
const reconcileChildren = (WIP, children) => {
    delete WIP.child;
    const oldFibers = WIP.kids;
    const newFibers = (WIP.kids = hashfy(children));
    const reused = {};
    for (const k in oldFibers) {
        const newFiber = newFibers[k];
        const oldFiber = oldFibers[k];
        if (newFiber && newFiber.type === oldFiber.type) {
            reused[k] = oldFiber;
        }
        else {
            oldFiber.op |= 1 << 3;
            commits.push(oldFiber);
        }
    }
    let prevFiber;
    for (const k in newFibers) {
        let newFiber = newFibers[k];
        const oldFiber = reused[k];
        if (oldFiber) {
            oldFiber.op |= 1 << 2;
            newFiber = Object.assign(Object.assign({}, oldFiber), newFiber);
            newFiber.lastProps = oldFiber.props;
            if (shouldPlace(newFiber)) {
                newFiber.op &= 1 << 1;
            }
        }
        else {
            newFiber.op |= 1 << 1;
        }
        newFibers[k] = newFiber;
        newFiber.parent = WIP;
        if (prevFiber) {
            prevFiber.sibling = newFiber;
        }
        else {
            if (WIP.op & (1 << 4)) {
                newFiber.op |= 1 << 4;
            }
            WIP.child = newFiber;
        }
        prevFiber = newFiber;
    }
    prevFiber === null || prevFiber === void 0 ? true : delete prevFiber.sibling;
};
const shouldPlace = (fiber) => {
    const p = fiber.parent;
    if (isFn(p.type))
        return p.key && !p.lane;
    return fiber.key;
};
const commitWork = (fiber) => {
    var _a;
    commits.forEach(commit);
    (_a = fiber.done) === null || _a === void 0 ? void 0 : _a.call(fiber);
    commits = [];
    preCommit = null;
    WIP = null;
};
const commit = (fiber) => {
    const { op, parentNode, node, ref, hooks } = fiber;
    if (op & (1 << 3)) {
        hooks === null || hooks === void 0 ? void 0 : hooks.list.forEach(cleanup);
        cleanupRef(fiber.kids);
        while (isFn(fiber.type))
            fiber = fiber.child;
        parentNode.removeChild(fiber.node);
    }
    else if (isFn(fiber.type)) {
        if (hooks) {
            side(hooks.layout);
            schedule(() => side(hooks.effect));
        }
    }
    else if (op & (1 << 2)) {
        updateElement(node, fiber.lastProps, fiber.props);
    }
    else {
        const point = fiber.insertPoint ? fiber.insertPoint.node : null;
        const after = point ? point.nextSibling : parentNode.firstChild;
        if (after === node)
            return;
        if (after === null && node === parentNode.lastChild)
            return;
        parentNode.insertBefore(node, after);
    }
    refer(ref, node);
};
const onError = (e) => {
    var _a;
    if (isFn((_a = e.error) === null || _a === void 0 ? void 0 : _a.then)) {
        e.preventDefault();
        currentFiber.lane = 0;
        currentFiber.hooks.list.forEach(reset);
        dispatchUpdate(currentFiber);
    }
};
const reset = (h) => (h[2] & (1 << 2) ? (h[2] = 0b1101) : h[2] & (1 << 3) ? (h[2] = 0b1010) : null);
const hashfy = (c) => {
    const out = {};
    isArr(c)
        ? c.forEach((v, i) => (isArr(v) ? v.forEach((vi, j) => (out[hs(i, j, vi.key)] = vi)) : some(v) && (out[hs(i, null, v.key)] = v)))
        : some(c) && (out[hs(0, null, c.key)] = c);
    return out;
};
const refer = (ref, dom) => {
    if (ref)
        isFn(ref) ? ref(dom) : (ref.current = dom);
};
const cleanupRef = (kids) => {
    for (const k in kids) {
        const kid = kids[k];
        refer(kid.ref, null);
        if (kid.kids)
            cleanupRef(kid.kids);
    }
};
const side = (effects) => {
    effects.forEach(cleanup);
    effects.forEach(effect);
    effects.length = 0;
};
const getCurrentFiber = () => currentFiber || null;
const effect = (e) => (e[2] = e[0](currentFiber));
const cleanup = (e) => { var _a; return (_a = e[2]) === null || _a === void 0 ? void 0 : _a.call(e, currentFiber); };
const isFn = (x) => typeof x === 'function';
const isStr = (s) => typeof s === 'number' || typeof s === 'string';
const some = (v) => v != null && v !== false && v !== true;
const hs = (i, j, k) => k != null && j != null ? '.' + i + '.' + k : j != null ? '.' + i + '.' + j : k != null ? '.' + k : '.' + i;
const g = typeof window === 'object' ? window : Function('return this')()
g.addEventListener('error', onError);

const h = function (type, attrs) {
    const props = attrs || {};
    const key = props.key || null;
    const ref = props.ref || null;
    const children = [];
    let simple = '';
    const len = arguments.length;
    for (let i = 2; i < len; i++) {
        let child = arguments[i];
        const end = i === len - 1;
        while (isArr(child) && child.some((v) => isArr(v))) {
            child = [].concat(...child);
        }
        const vnode = some(child) ? child : '';
        const str = isStr(vnode);
        if (str)
            simple += String(vnode);
        if (simple && (!str || end)) {
            children.push(createText(simple));
            simple = '';
        }
        if (!str)
            children.push(vnode);
    }
    if (children.length) {
        props.children = children.length === 1 ? children[0] : children;
    }
    delete props.key;
    return { type, props, key, ref };
};
function createText(vnode) {
    return { type: 'text', props: { nodeValue: vnode } };
}
const Fragment = (props) => {
    return props.children;
};
const isArr = Array.isArray;

const options = {};

export { Fragment, h, h as jsx, h as jsxDEV, h as jsxs, options, render, useCallback, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };