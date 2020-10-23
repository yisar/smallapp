const isArr = Array.isArray;
const isStr = s => typeof s === 'string' || typeof s === 'number';
const MEMO = 0;

function h(type, attrs, ...args) {
  let props = attrs || {};
  let key = props.key || null;
  let ref = props.ref || null;
  let children = [];

  for (let i = 0; i < args.length; i++) {
    let vnode = args[i];
    if (vnode == null || vnode === true || vnode === false) ; else if (isStr(vnode)) {
      children.push(createText(vnode));
    } else {
      while (isArr(vnode) && vnode.some(v => isArr(v))) {
        vnode = [].concat(...vnode);
      }
      children.push(vnode);
    }
  }

  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }

  delete props.key;
  delete props.ref;

  return { type, props, key, ref }
}

function createText(vnode) {
  return { type: 'text', props: { nodeValue: vnode } }
}

function Fragment(props) {
  return props.children
}

function memo(fn) {
  fn.tag = MEMO;
  return fn
}

function updateElement(dom, oldProps, newProps) {
  for (let name in { ...oldProps, ...newProps }) {
    let oldValue = oldProps[name];
    let newValue = newProps[name];

    if (oldValue == newValue || name === 'children') ; else if (name === 'style') {
      for (const k in { ...oldValue, ...newValue }) {
        if (!(oldValue && newValue && oldValue[k] === newValue[k])) {
          dom[name][k] = (newValue && newValue[k]) || '';
        }
      }
    } else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase();
      if (oldValue) dom.removeEventListener(name, oldValue);
      dom.addEventListener(name, newValue);
    } else if (name in dom && !(dom instanceof SVGElement)) {
      dom[name] = newValue == null ? '' : newValue;
    } else if (newValue == null || newValue === false) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, newValue);
    }
  }
}

function createElement(fiber) {
  const dom =
    fiber.type === 'text'
      ? document.createTextNode('')
      : fiber.tag === SVG
      ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type)
      : document.createElement(fiber.type);
  updateElement(dom, {}, fiber.props);
  return dom
}

let cursor = 0;

function resetCursor() {
  cursor = 0;
}

function useState(initState) {
  return useReducer(null, initState)
}

function useReducer(reducer, initState) {
  const [hook, current] = getHook(cursor++);
  const setter = value => {
    let newValue = reducer
      ? reducer(hook[0], value)
      : isFn(value)
      ? value(hook[0])
      : value;
    if (newValue !== hook[0]) {
      hook[0] = newValue;
      scheduleWork(current);
    }
  };

  if (hook.length) {
    return [hook[0], setter]
  } else {
    hook[0] = initState;
    return [initState, setter]
  }
}

function useEffect(cb, deps) {
  return effectImpl(cb, deps, 'effect')
}

function useLayout(cb, deps) {
  return effectImpl(cb, deps, 'layout')
}

function effectImpl(cb, deps, key) {
  let [hook, current] = getHook(cursor++);
  if (isChanged(hook[1], deps)) {
    hook[0] = useCallback(cb, deps);
    hook[1] = deps;
    current.hooks[key].push(hook);
  }
}

function useMemo(cb, deps) {
  let hook = getHook(cursor++)[0];
  if (isChanged(hook[1], deps)) {
    hook[1] = deps;
    return (hook[0] = cb())
  }
  return hook[0]
}

function useCallback(cb, deps) {
  return useMemo(() => cb, deps)
}

function useRef(current) {
  return useMemo(() => ({ current }), [])
}

function getHook(cursor) {
  const current = getCurrentFiber();
  let hooks =
    current.hooks || (current.hooks = { list: [], effect: [], layout: [] });
  if (cursor >= hooks.list.length) {
    hooks.list.push([]);
  }
  return [hooks.list[cursor], current]
}

function isChanged(a, b) {
  return !a || b.some((arg, index) => arg !== a[index])
}

function push(heap, node) {
  const i = heap.length;
  heap.push(node);
  siftUp(heap, node, i);
}

function pop(heap) {
  const first = heap[0];
  if (!first) return null
  const last = heap.pop();
  if (last !== first) {
    heap[0] = last;
    siftDown(heap, last, 0);
  }
  return first
}

function siftUp(heap, node, i) {
  while (i > 0) {
    const pi = (i - 1) >>> 1;
    const parent = heap[pi];
    if (cmp(parent, node) <= 0) return
    heap[pi] = node;
    heap[i] = parent;
    i = pi;
  }
}

function siftDown(heap, node, i) {
  for (;;) {
    const li = i * 2 + 1;
    const left = heap[li];
    if (li >= heap.length) return
    const ri = li + 1;
    const right = heap[ri];
    const ci = ri < heap.length && cmp(right, left) < 0 ? ri : li;
    const child = heap[ci];
    if (cmp(child, node) > 0) return
    heap[ci] = node;
    heap[i] = child;
    i = ci;
  }
}

function cmp(a, b) {
  return a.dueTime - b.dueTime
}

function peek(heap) {
  return heap[0] || null
}

let taskQueue = [];
let currentCallback = null;
let frameDeadline = 0;
const frameLength = 1000 / 60;

function scheduleCallback(callback) {
  const currentTime = getTime();
  const startTime = currentTime;
  const timeout = 3000;
  const dueTime = startTime + timeout;

  let newTask = {
    callback,
    startTime,
    dueTime
  };

  push(taskQueue, newTask);
  currentCallback = flush;
  planWork();
}

function flush(iniTime) {
  let currentTime = iniTime;
  let currentTask = peek(taskQueue);

  while (currentTask) {
    const didout = currentTask.dueTime <= currentTime;
    if (!didout && shouldYeild()) break

    let callback = currentTask.callback;
    currentTask.callback = null;

    let next = callback(didout);
    next ? (currentTask.callback = next) : pop(taskQueue);

    currentTask = peek(taskQueue);
    currentTime = getTime();
  }

  return !!currentTask
}

function flushWork() {
  if (currentCallback) {
    let currentTime = getTime();
    frameDeadline = currentTime + frameLength;
    let more = currentCallback(currentTime);
    more ? planWork() : (currentCallback = null);
  }
}

const planWork = (() => {
  if (typeof MessageChannel !== 'undefined') {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = flushWork;
    return cb => (cb ? requestAnimationFrame(cb) : port2.postMessage(null))
  }
  return cb => setTimeout(cb || flushWork)
})();

function shouldYeild() {
  return getTime() >= frameDeadline
}

const getTime = () => performance.now();

const NOWORK = 0;
const PLACE = 1;
const UPDATE = 2;
const DELETE = 3;

const SVG = 4;

let preCommit = null;
let currentFiber = null;
let WIP = null;
let updateQueue = [];
let commitQueue = [];

function render(vnode, node, done) {
  let rootFiber = {
    node,
    props: { children: vnode },
    done
  };
  scheduleWork(rootFiber);
}

function scheduleWork(fiber) {
  if (!fiber.dirty && (fiber.dirty = true)) {
    updateQueue.push(fiber);
  }
  scheduleCallback(reconcileWork);
}

function reconcileWork(didout) {
  if (!WIP) WIP = updateQueue.shift();
  while (WIP && (!shouldYeild() || didout)) {
    WIP = reconcile(WIP);
  }
  if (!didout && WIP) {
    return reconcileWork.bind(null)
  }
  if (preCommit) commitWork(preCommit);
  return null
}

function reconcile(WIP) {
  WIP.parentNode = getParentNode(WIP);
  isFn(WIP.type) ? updateHOOK(WIP) : updateHost(WIP);
  WIP.dirty = WIP.dirty ? false : 0;
  WIP.oldProps = WIP.props;
  commitQueue.push(WIP);

  if (WIP.child) return WIP.child
  while (WIP) {
    if (!preCommit && WIP.dirty === false) {
      preCommit = WIP;
      return null
    }
    if (WIP.sibling) {
      return WIP.sibling
    }
    WIP = WIP.parent;
  }
}

function updateHOOK(WIP) {
  if (
    WIP.type.tag === MEMO &&
    WIP.dirty == 0 &&
    !shouldUpdate(WIP.oldProps, WIP.props)
  ) {
    cloneChildren(WIP);
    return
  }
  currentFiber = WIP;
  resetCursor();
  let children = WIP.type(WIP.props);
  if (isStr(children)) {
    children = createText(children);
  }
  reconcileChildren(WIP, children);
}

function updateHost(WIP) {
  if (!WIP.node) {
    if (WIP.type === 'svg') WIP.tag = SVG;
    WIP.node = createElement(WIP);
  }
//   let p = WIP.parentNode || {};
//   WIP.insertPoint = p.last || null;
//   p.last = WIP;
  WIP.node.last = null;
  reconcileChildren(WIP, WIP.props.children);
}

function getParentNode(fiber) {
  while ((fiber = fiber.parent)) {
    if (!isFn(fiber.type)) return fiber.node
  }
}

function reconcileChildren(WIP, children) {
  if (!children) return
  delete WIP.child;
  const oldFibers = WIP.kids;
  const newFibers = (WIP.kids = hashfy(children));

  let reused = {};

  for (const k in oldFibers) {
    let newFiber = newFibers[k];
    let oldFiber = oldFibers[k];

    if (newFiber && newFiber.type === oldFiber.type) {
      reused[k] = oldFiber;
    } else {
      oldFiber.op = DELETE;
      commitQueue.push(oldFiber);
    }
  }

  let prevFiber = null;
  let alternate = null;

  for (const k in newFibers) {
    let newFiber = newFibers[k];
    let oldFiber = reused[k];

    if (oldFiber) {
      alternate = createFiber(oldFiber, UPDATE);
      newFiber.op = UPDATE;
      newFiber = { ...alternate, ...newFiber };
      newFiber.lastProps = alternate.props;
      if (shouldPlace(newFiber)) {
        newFiber.op = PLACE;
      }
    } else {
      newFiber = createFiber(newFiber, PLACE);
    }

    newFibers[k] = newFiber;
    newFiber.parent = WIP;

    if (prevFiber) {
      prevFiber.sibling = newFiber;
    } else {
      if (WIP.tag === SVG) newFiber.tag = SVG;
      WIP.child = newFiber;
    }
    prevFiber = newFiber;
  }

  if (prevFiber) prevFiber.sibling = null;
}

function cloneChildren(fiber) {
  if (!fiber.child) return
  let child = fiber.child;
  let newChild = child;
  newChild.op = NOWORK;
  fiber.child = newChild;
  newChild.parent = fiber;
  newChild.sibling = null;
}

function shouldUpdate(a, b) {
  for (let i in a) if (!(i in b)) return true
  for (let i in b) if (a[i] !== b[i]) return true
  return false
}

function shouldPlace(fiber) {
  let p = fiber.parent;
  if (isFn(p.type)) return p.key && !p.dirty
  return fiber.key
}

function commitWork(fiber) {
  commitQueue.forEach(c => c.parent && commit(c));
  fiber.done && fiber.done();
  commitQueue = [];
  preCommit = null;
  WIP = null;
}

function commit(fiber) {
  const { op, parentNode, node, ref, hooks } = fiber;
  if (op === NOWORK) ; else if (op === DELETE) {
    hooks && hooks.list.forEach(cleanup);
    cleanupRef(fiber.kids);
    while (isFn(fiber.type)) fiber = fiber.child;
    parentNode.removeChild(fiber.node);
  } else if (isFn(fiber.type)) {
    if (hooks) {
      hooks.layout.forEach(cleanup);
      hooks.layout.forEach(effect);
      hooks.layout = [];
      planWork(() => {
        hooks.effect.forEach(cleanup);
        hooks.effect.forEach(effect);
        hooks.effect = [];
      });
    }
  } else if (op === UPDATE) {
    updateElement(node, fiber.lastProps, fiber.props);
  } else {
    let point = fiber.insertPoint ? fiber.insertPoint.node : null;
    let after = point ? point.nextSibling : parentNode.firstChild;
    if (after === node) return
    if (after === null && node === parentNode.lastChild) return
    parentNode.insertBefore(node, after);
  }
  refer(ref, node);
}

function createFiber(vnode, op) {
  return { ...vnode, op }
}

const hashfy = c => {
  const out = {};
  isArr(c)
    ? c.forEach((v, i) =>
        isArr(v)
          ? v.forEach((vi, j) => (out[hs(i, j, vi.key)] = vi))
          : (out[hs(i, null, v.key)] = v)
      )
    : (out[hs(0, null, c.key)] = c);
  return out
};

function refer(ref, dom) {
  if (ref) isFn(ref) ? ref(dom) : (ref.current = dom);
}

function cleanupRef(kids) {
  for (const k in kids) {
    const kid = kids[k];
    refer(kid.ref, null);
    if (kid.kids) cleanupRef(kid.kids);
  }
}

const cleanup = e => e[2] && e[2]();

const effect = e => {
  const res = e[0]();
  if (isFn(res)) e[2] = res;
};

const getCurrentFiber = () => currentFiber || null;

const isFn = fn => typeof fn === 'function';

const hs = (i, j, k) =>
  k != null && j != null
    ? '.' + i + '.' + k
    : j != null
    ? '.' + i + '.' + j
    : k != null
    ? '.' + k
    : '.' + i;

const Fre = {
  h,
  Fragment,
  render,
  scheduleWork,
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  memo
};

export default Fre;
export { Fragment, h as createElement, h, memo, render, scheduleWork, useCallback, useEffect, useLayout, useLayout as useLayoutEffect, useMemo, useReducer, useRef, useState };