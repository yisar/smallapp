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
    const dom = fiber.type === 3
        ? document.createTextNode('')
        : fiber.flag & 256
            ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type)
            : document.createElement(fiber.type);
    updateElement(dom, {}, fiber.props);
    return dom;
};
function insert(parent, before, after) {
    console.log(parent, before);
    parent && parent.appendChild(before);
}
function create(fiber) {
    let node = fiber.flag & 32 ? fiber.node : createElement(fiber);
    if (fiber.children) {
        for (var i = 0; i < fiber.children.length; i++) {
            let child = create((fiber.children[i] = kid(fiber.children[i])));
            node.appendChild(child);
        }
    }
    return node;
}
function remove(parent, node) {
    parent.removeChild(node);
}

let cursor = 0;
const resetCursor = () => {
    cursor = 0;
};
const useState = (initState) => {
    return useReducer(null, initState);
};
const useReducer = (reducer, initState) => {
    const [hook, current] = getHook(cursor++);
    hook[0] = isFn(hook[1]) ? hook[1](hook[0]) : hook.length ? hook[1] : initState;
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
let fiber;
let commits = [];
const microTask = [];
const render = (vnode, node, done) => {
    const rootFiber = {
        node,
        props: {},
        children: [vnode],
        flag: 32,
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
    if (!fiber)
        fiber = microTask.shift();
    while (fiber && (!shouldYield() || timeout))
        fiber = reconcile(fiber);
    if (fiber && !timeout)
        return reconcileWork.bind(null);
    if (preCommit)
        commitWork(preCommit);
    return null;
};
function commit(op) {
    commits.push(op);
}
const reconcile = (fiber) => {
    let oldFiber = fiber.alternate;
    const node = oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.node;
    fiber.parentNode = getParentNode(fiber);
    if (!oldFiber) {
        if (isFn(fiber.type)) {
            newKids = updateHook(fiber);
        }
        else {
            const node = createElement(fiber);
            if (fiber.parentNode) {
                insert(fiber.parentNode, node);
            }
            newKids = updateHost(fiber);
        }
    }
    else if (oldFiber && oldFiber.type !== fiber.type) ;
    else if (oldFiber && oldFiber.type === 3) ;
    else {
        var oldKids = oldFiber.children, newKids = kid(fiber), oldHead = 0, newHead = 0, oldTail = oldKids.length - 1, newTail = newKids.length - 1;
        while (oldHead <= oldTail && newHead <= newTail) {
            if (oldKids[oldHead] == null) {
                oldHead++;
            }
            else if (oldKids[oldTail] == null) {
                oldTail--;
            }
            else if (oldKids[oldHead].key === newKids[newHead].key) {
                oldHead++;
                newHead++;
            }
            else if (oldKids[oldTail].key === newKids[newTail].key) {
                oldTail--;
                newTail--;
            }
            else if (oldKids[oldHead].key === newKids[newTail].key) {
                commit(() => insert(parent, oldKids[oldHead].node, oldKids[oldTail + 1].node));
                oldHead++;
                newTail--;
            }
            else if (oldKids[oldTail].key === newKids[newHead].key) {
                commit(() => insert(parent, oldKids[oldTail].node, oldKids[oldHead].node));
                oldTail--;
                newHead++;
            }
            else {
                const i = oldKids.findIndex((kid) => kid.key === newKids[newHead].key);
                if (i >= 0) {
                    const kid = oldKids[i];
                    commit(() => insert(parent, kid.node, oldKids[oldHead].node));
                    oldKids[i] = null;
                }
                else {
                    commit(() => insert(parent, create(newKids[newHead]), oldKids[oldHead].node));
                }
                newHead++;
            }
        }
        if (oldHead > oldTail) {
            commit(() => {
                for (let i = newHead; i <= newTail; i++)
                    insert(parent, create(newKids[i]), oldKids[oldHead]);
            });
        }
        else if (newHead > newTail) {
            commit(() => {
                for (let i = oldHead; i <= oldTail; i++)
                    remove(parent, oldKids[i].node);
            });
        }
    }
    for (var i = 0, prev, old = oldFiber === null || oldFiber === void 0 ? void 0 : oldFiber.child, childs = arrayfy(newKids); i < childs.length; i++) {
        const child = childs[i];
        child.parent = fiber;
        child.alternate = old;
        if (i > 0) {
            prev.sibling = child;
        }
        else {
            fiber.child = child;
        }
        prev = child;
        if (old)
            old = old.sibling;
    }
    if (fiber.child)
        return fiber.child;
    while (fiber) {
        if (!preCommit && !fiber.parent) {
            preCommit = fiber;
            return null;
        }
        if (fiber.sibling)
            return fiber.sibling;
        fiber = fiber.parent;
    }
};
const getParentNode = (WIP) => {
    while ((WIP = WIP.parent)) {
        if (!isFn(WIP.type))
            return WIP.node;
    }
};
const updateHook = (fiber) => {
    fiber.flag |= 64;
    resetCursor();
    currentFiber = fiber;
    const child = fiber.type(fiber.props, fiber.children);
    currentFiber.alternate = fiber;
    currentFiber.children = child;
    return child;
};
const updateHost = (fiber) => {
    fiber.flag |= 128;
    if (!fiber.node) {
        fiber.node = createElement(fiber);
    }
    return fiber.children;
};
const kid = (fiber) => (isFn(fiber.type) ? updateHook(fiber) : updateHost(fiber));
const commitWork = (fiber) => {
    var _a;
    commits.splice(0, commits.length).forEach((c) => c());
    (_a = fiber.done) === null || _a === void 0 ? void 0 : _a.call(fiber);
    preCommit = null;
};
const getCurrentFiber = () => currentFiber || null;
const isFn = (x) => typeof x === 'function';
const isStr = (s) => typeof s === 'number' || typeof s === 'string';
const some = (v) => v != null && v !== false && v !== true;
const arrayfy = (arr) => (!arr ? [] : arr.pop ? arr : [arr]);

const h = function (type, attrs) {
    for (var vnode, rest = [], children = [], i = arguments.length; i-- > 2;) {
        rest.push(arguments[i]);
    }
    const props = attrs || {};
    const key = props.key || null;
    const ref = props.ref || null;
    while (rest.length > 0) {
        if (isArr((vnode = rest.pop()))) {
            for (var i = vnode.length; i-- > 0;) {
                rest.push(vnode[i]);
            }
        }
        else if (some(vnode)) {
            children.push(isStr(vnode) ? createText(vnode) : vnode);
        }
    }
    delete props.key;
    return { type, props, children, key, ref };
};
function createText(vnode) {
    return { type: 3, props: { nodeValue: vnode } };
}
const Fragment = (props) => {
    return props.children;
};
const isArr = Array.isArray;

const mixins = {};

export { Fragment, h, h as jsx, h as jsxDEV, h as jsxs, mixins, render, useCallback, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };
//# sourceMappingURL=fre.esm.js.map
