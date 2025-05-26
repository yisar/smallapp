const defaultObj = {};
const jointIter = (aProps, bProps, callback) => {
    aProps = aProps || defaultObj;
    bProps = bProps || defaultObj;
    Object.keys(aProps).forEach((k) => callback(k, aProps[k], bProps[k]));
    Object.keys(bProps).forEach((k) => !aProps.hasOwnProperty(k) && callback(k, undefined, bProps[k]));
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

const EMPTY_ARR = [];
let cursor = 0;
const resetCursor = () => {
    cursor = 0;
};
const useState = (initState) => {
    return useReducer(null, initState);
};
const useReducer = (reducer, initState) => {
    const [hook, current] = getSlot(cursor++);
    if (hook.length === 0) {
        hook[0] = initState;
    }
    hook[1] = (value) => {
        let v = reducer
            ? reducer(hook[0], value)
            : isFn(value)
                ? value(hook[0])
                : value;
        if (hook[0] !== v) {
            hook[0] = v;
            update(current);
        }
    };
    return hook;
};
const useEffect = (cb, deps) => {
    return effectImpl(cb, deps, 'effect');
};
const useLayout = (cb, deps) => {
    return effectImpl(cb, deps, 'layout');
};
const effectImpl = (cb, deps, key) => {
    const [hook, current] = getSlot(cursor++);
    if (isChanged(hook[1], deps)) {
        hook[0] = cb;
        hook[1] = deps;
        current.hooks[key].push(hook);
    }
};
const useMemo = (cb, deps) => {
    const hook = getSlot(cursor++)[0];
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
const getSlot = (cursor) => {
    const current = getCurrentFiber();
    const hooks = current.hooks || (current.hooks = { list: [], effect: [], layout: [] });
    if (cursor >= hooks.list.length) {
        hooks.list.push([]);
    }
    return [hooks.list[cursor], current];
};
const createContext = (initialValue) => {
    const contextComponent = ({ value, children }) => {
        const valueRef = useRef(value);
        const subscribers = useMemo(() => new Set(), EMPTY_ARR);
        if (valueRef.current !== value) {
            valueRef.current = value;
            subscribers.forEach((subscriber) => subscriber());
        }
        return children;
    };
    contextComponent.initialValue = initialValue;
    return contextComponent;
};
const useContext = (contextType) => {
    let subscribersSet;
    const triggerUpdate = useReducer(null, null)[1];
    useEffect(() => {
        return () => subscribersSet && subscribersSet.delete(triggerUpdate);
    }, EMPTY_ARR);
    let contextFiber = getCurrentFiber().parent;
    while (contextFiber && contextFiber.type !== contextType) {
        contextFiber = contextFiber.parent;
    }
    if (contextFiber) {
        const hooks = contextFiber.hooks.list;
        const [[value], [subscribers]] = hooks;
        subscribersSet = subscribers.add(triggerUpdate);
        return value.current;
    }
    else {
        return contextType.initialValue;
    }
};
const isChanged = (a, b) => {
    return (!a ||
        a.length !== b.length ||
        b.some((arg, index) => !Object.is(arg, a[index])));
};

const queue = [];
const threshold = 5;
const transitions = [];
let deadline = 0;
const startTransition = (cb) => {
    transitions.push(cb) && translate();
};
const schedule = (callback) => {
    queue.push({ callback });
    startTransition(flush);
};
const task = (pending) => {
    const cb = () => transitions.splice(0, 1).forEach((c) => c());
    if (!pending && typeof queueMicrotask !== 'undefined') {
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
    job && (translate = task(shouldYield())) && startTransition(flush);
};
const shouldYield = () => {
    return getTime() >= deadline;
};
const getTime = () => performance.now();
const peek = (queue) => queue[0];

const commit = (fiber) => {
    if (!fiber) {
        return;
    }
    const { op, ref, cur } = fiber.action || {};
    const parent = fiber.parentNode;
    const curnode = getChildNode(cur);
    const refnode = getChildNode(ref);
    if (op & 4 || op & 64) {
        parent.insertBefore(curnode, refnode);
    }
    if (op & 128) {
        parent.replaceChild(curnode, refnode);
        removeElement(ref, false);
    }
    if (op & 2) {
        const node = getChildNode(fiber);
        updateElement(node, fiber.old.props || {}, fiber.props);
    }
    refer(fiber.ref, fiber.node);
    fiber.action = null;
    commitSibling(fiber.child);
    commitSibling(fiber.sibling);
};
function commitSibling(fiber) {
    if (fiber === null || fiber === void 0 ? void 0 : fiber.memo) {
        commitSibling(fiber.sibling);
    }
    else {
        commit(fiber);
    }
}
const getChildNode = (fiber) => {
    if (fiber == null)
        return null;
    if (fiber.isComp) {
        while ((fiber = fiber.child)) {
            if (!fiber.isComp)
                return fiber.node;
        }
    }
    else {
        return fiber.node;
    }
};
const refer = (ref, dom) => {
    if (ref)
        isFn(ref) ? ref(dom) : (ref.current = dom);
};
const kidsRefer = (kids) => {
    kids.forEach((kid) => {
        kid.kids && kidsRefer(kid.kids);
        refer(kid.ref, null);
    });
};
const removeElement = (fiber, flag = true) => {
    if (fiber.isComp) {
        fiber.hooks && fiber.hooks.list.forEach((e) => e[2] && e[2]());
    }
    else {
        if (flag) {
            fiber.parentNode.removeChild(fiber.node);
            flag = false;
        }
        kidsRefer(fiber.kids);
        refer(fiber.ref, null);
    }
    fiber.kids.forEach(v => removeElement(v, flag));
};

let currentFiber = null;
let rootFiber = null;
const render = (vnode, node) => {
    rootFiber = {
        node,
        props: { children: vnode },
    };
    update(rootFiber);
};
const update = (fiber) => {
    if (!fiber.dirty) {
        fiber.dirty = true;
        schedule(() => reconcile(fiber));
    }
};
const reconcile = (fiber) => {
    while (fiber && !shouldYield())
        fiber = capture(fiber);
    if (fiber)
        return reconcile.bind(null, fiber);
    return null;
};
const capture = (fiber) => {
    fiber.isComp = isFn(fiber.type);
    if (fiber.isComp) {
        if (isMemo(fiber)) {
            fiber.memo = true;
            return getSibling(fiber);
        }
        else if (fiber.memo) {
            fiber.memo = false;
        }
        updateHook(fiber);
    }
    else {
        updateHost(fiber);
    }
    if (fiber.child)
        return fiber.child;
    const sibling = getSibling(fiber);
    return sibling;
};
const isMemo = (fiber) => {
    var _a, _b;
    if (fiber.type.memo &&
        fiber.type === ((_a = fiber.old) === null || _a === void 0 ? void 0 : _a.type) &&
        ((_b = fiber.old) === null || _b === void 0 ? void 0 : _b.props)) {
        let scu = fiber.type.shouldUpdate || shouldUpdate;
        if (!scu(fiber.props, fiber.old.props)) {
            return true;
        }
    }
    return false;
};
const getSibling = (fiber) => {
    while (fiber) {
        bubble(fiber);
        if (fiber.dirty) {
            fiber.dirty = false;
            commit(fiber);
            return null;
        }
        if (fiber.sibling)
            return fiber.sibling;
        fiber = fiber.parent;
    }
    return null;
};
const bubble = (fiber) => {
    if (fiber.isComp) {
        if (fiber.hooks) {
            side(fiber.hooks.layout);
            schedule(() => side(fiber.hooks.effect));
        }
    }
};
const shouldUpdate = (a, b) => {
    for (let i in a)
        if (!(i in b))
            return true;
    for (let i in b)
        if (a[i] !== b[i])
            return true;
};
const updateHook = (fiber) => {
    resetCursor();
    currentFiber = fiber;
    fiber.parentNode = getParentNode(fiber) || {};
    let children = fiber.type(fiber.props);
    reconcileChidren(fiber, simpleVnode(children));
};
const updateHost = (fiber) => {
    fiber.parentNode = getParentNode(fiber) || {};
    if (!fiber.node) {
        if (fiber.type === 'svg')
            fiber.lane |= 16;
        fiber.node = createElement(fiber);
    }
    reconcileChidren(fiber, fiber.props.children);
};
const simpleVnode = (type) => isStr(type) ? createText(type) : type;
const getParentNode = (fiber) => {
    while ((fiber = fiber.parent)) {
        if (!fiber.isComp)
            return fiber.node;
    }
};
const reconcileChidren = (fiber, children) => {
    let aCh = fiber.kids || [], bCh = (fiber.kids = arrayfy$1(children));
    const actions = diff(aCh, bCh);
    for (let i = 0, prev = null, len = bCh.length; i < len; i++) {
        const child = bCh[i];
        child.action = actions[i];
        if (fiber.lane & 16) {
            child.lane |= 16;
        }
        child.parent = fiber;
        if (i > 0) {
            prev.sibling = child;
        }
        else {
            fiber.child = child;
        }
        prev = child;
    }
};
function clone(a, b) {
    b.hooks = a.hooks;
    b.ref = a.ref;
    b.node = a.node;
    b.kids = a.kids;
    b.old = a;
}
const arrayfy$1 = (arr) => !arr ? [] : isArr(arr) ? arr : [arr];
const side = (effects) => {
    effects.forEach((e) => e[2] && e[2]());
    effects.forEach((e) => (e[2] = e[0]()));
    effects.length = 0;
};
const diff = (aCh, bCh) => {
    let aHead = 0, bHead = 0, aTail = aCh.length - 1, bTail = bCh.length - 1, aMap = {}, bMap = {}, same = (a, b) => a.key != null && b.key != null && a.key === b.key, temp = [], actions = [];
    while (aHead <= aTail && bHead <= bTail) {
        if (!same(aCh[aTail], bCh[bTail]))
            break;
        if (aCh[aTail].type === bCh[bTail].type) {
            clone(aCh[aTail], bCh[bTail]);
            temp.push({ op: 2 });
        }
        else {
            actions.push({ op: 128, cur: bCh[bTail], ref: aCh[aTail] });
        }
        aTail--;
        bTail--;
    }
    while (aHead <= aTail && bHead <= bTail) {
        if (!same(aCh[aHead], bCh[bHead]))
            break;
        if (aCh[aHead].type === bCh[bHead].type) {
            clone(aCh[aHead], bCh[bHead]);
            actions.push({ op: 2 });
        }
        else {
            actions.push({ op: 128, cur: bCh[bHead], ref: aCh[aHead] });
        }
        aHead++;
        bHead++;
    }
    for (let i = aHead; i <= aTail; i++) {
        aMap[aCh[i].key] = i;
    }
    for (let i = bHead; i <= bTail; i++) {
        bMap[bCh[i].key] = i;
    }
    while (aHead <= aTail || bHead <= bTail) {
        var aElm = aCh[aHead], bElm = bCh[bHead];
        if (aElm === null) {
            aHead++;
        }
        else if (bTail + 1 <= bHead) {
            removeElement(aElm);
            aHead++;
        }
        else if (aTail + 1 <= aHead) {
            actions.push({ op: 4, cur: bElm, ref: aElm });
            bHead++;
        }
        else if (aElm.key === bElm.key) {
            if (aElm.type === bElm.type) {
                clone(aElm, bElm);
                actions.push({ op: 2 });
            }
            else {
                actions.push({ op: 128, cur: bElm, ref: aElm });
            }
            aHead++;
            bHead++;
        }
        else {
            var foundB = bMap[aElm.key];
            var foundA = aMap[bElm.key];
            if (foundB == null) {
                removeElement(aElm);
                aHead++;
            }
            else if (foundA == null) {
                actions.push({ op: 4, cur: bElm, ref: aElm });
                bHead++;
            }
            else {
                clone(aCh[foundA], bElm);
                actions.push({ op: 64, cur: aCh[foundA], ref: aElm });
                aCh[foundA] = null;
                bHead++;
            }
        }
    }
    for (let i = temp.length - 1; i >= 0; i--) {
        actions.push(temp[i]);
    }
    return actions;
};
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
const arrayfy = (arr) => !arr ? [] : isArr(arr) ? arr : [arr];
const some = (x) => x != null && x !== true && x !== false;
const flat = (arr, target = []) => {
    arr.forEach((v) => {
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
function memo(fn, compare) {
    fn.memo = true;
    fn.shouldUpdate = compare;
    return fn;
}
const isArr = Array.isArray;

export { Fragment, createContext, h as createElement, h, memo, render, shouldYield, schedule as startTranstion, useCallback, useContext, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };
//# sourceMappingURL=fre.esm.js.map