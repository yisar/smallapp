/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is not neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app/index.js":
/*!**********************!*\
  !*** ./app/index.js ***!
  \**********************/
/*! namespace exports */
/*! exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_require__, __webpack_require__.r, __webpack_exports__, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var fre__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fre */ \"./node_modules/fre/dist/fre.esm.js\");\n\n\nconst {\n  ipcRenderer\n} = __webpack_require__(/*! electron */ \"electron\");\n\nfunction App() {\n  (0,fre__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {\n    const webview = document.querySelector('webview');\n\n    const loadstop = () => {\n      ipcRenderer.send('load', {\n        url: 'https://www.baidu.com/'\n      });\n    };\n\n    webview.addEventListener('did-stop-loading', loadstop);\n  }, []);\n  return (0,fre__WEBPACK_IMPORTED_MODULE_0__.h)(\"webview\", {\n    id: \"simulation\",\n    src: \"https://www.baidu.com/\"\n  });\n}\n\n(0,fre__WEBPACK_IMPORTED_MODULE_0__.render)((0,fre__WEBPACK_IMPORTED_MODULE_0__.h)(App, null), document.getElementById('root'));\n\n//# sourceURL=webpack://fard-ide/./app/index.js?");

/***/ }),

/***/ "./node_modules/fre/dist/fre.esm.js":
/*!******************************************!*\
  !*** ./node_modules/fre/dist/fre.esm.js ***!
  \******************************************/
/*! namespace exports */
/*! export Fragment [provided] [no usage info] [missing usage info prevents renaming] */
/*! export createElement [provided] [no usage info] [missing usage info prevents renaming] */
/*! export default [provided] [no usage info] [missing usage info prevents renaming] */
/*! export h [provided] [no usage info] [missing usage info prevents renaming] */
/*! export memo [provided] [no usage info] [missing usage info prevents renaming] */
/*! export render [provided] [no usage info] [missing usage info prevents renaming] */
/*! export scheduleWork [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useCallback [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useEffect [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useLayout [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useLayoutEffect [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useMemo [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useReducer [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useRef [provided] [no usage info] [missing usage info prevents renaming] */
/*! export useState [provided] [no usage info] [missing usage info prevents renaming] */
/*! other exports [not provided] [no usage info] */
/*! runtime requirements: __webpack_exports__, __webpack_require__.r, __webpack_require__.d, __webpack_require__.* */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => __WEBPACK_DEFAULT_EXPORT__,\n/* harmony export */   \"Fragment\": () => /* binding */ Fragment,\n/* harmony export */   \"createElement\": () => /* binding */ h,\n/* harmony export */   \"h\": () => /* binding */ h,\n/* harmony export */   \"memo\": () => /* binding */ memo,\n/* harmony export */   \"render\": () => /* binding */ render,\n/* harmony export */   \"scheduleWork\": () => /* binding */ scheduleWork,\n/* harmony export */   \"useCallback\": () => /* binding */ useCallback,\n/* harmony export */   \"useEffect\": () => /* binding */ useEffect,\n/* harmony export */   \"useLayout\": () => /* binding */ useLayout,\n/* harmony export */   \"useLayoutEffect\": () => /* binding */ useLayout,\n/* harmony export */   \"useMemo\": () => /* binding */ useMemo,\n/* harmony export */   \"useReducer\": () => /* binding */ useReducer,\n/* harmony export */   \"useRef\": () => /* binding */ useRef,\n/* harmony export */   \"useState\": () => /* binding */ useState\n/* harmony export */ });\nconst isArr = Array.isArray;\n\nconst isStr = s => typeof s === 'string' || typeof s === 'number';\n\nconst MEMO = 0;\n\nfunction h(type, attrs, ...args) {\n  let props = attrs || {};\n  let key = props.key || null;\n  let ref = props.ref || null;\n  let children = [];\n\n  for (let i = 0; i < args.length; i++) {\n    let vnode = args[i];\n    if (vnode == null || vnode === true || vnode === false) ;else if (isStr(vnode)) {\n      children.push(createText(vnode));\n    } else {\n      while (isArr(vnode) && vnode.some(v => isArr(v))) {\n        vnode = [].concat(...vnode);\n      }\n\n      children.push(vnode);\n    }\n  }\n\n  if (children.length) {\n    props.children = children.length === 1 ? children[0] : children;\n  }\n\n  delete props.key;\n  delete props.ref;\n  return {\n    type,\n    props,\n    key,\n    ref\n  };\n}\n\nfunction createText(vnode) {\n  return {\n    type: 'text',\n    props: {\n      nodeValue: vnode\n    }\n  };\n}\n\nfunction Fragment(props) {\n  return props.children;\n}\n\nfunction memo(fn) {\n  fn.tag = MEMO;\n  return fn;\n}\n\nfunction updateElement(dom, oldProps, newProps) {\n  for (let name in { ...oldProps,\n    ...newProps\n  }) {\n    let oldValue = oldProps[name];\n    let newValue = newProps[name];\n    if (oldValue == newValue || name === 'children') ;else if (name === 'style') {\n      for (const k in { ...oldValue,\n        ...newValue\n      }) {\n        if (!(oldValue && newValue && oldValue[k] === newValue[k])) {\n          dom[name][k] = newValue && newValue[k] || '';\n        }\n      }\n    } else if (name[0] === 'o' && name[1] === 'n') {\n      name = name.slice(2).toLowerCase();\n      if (oldValue) dom.removeEventListener(name, oldValue);\n      dom.addEventListener(name, newValue);\n    } else if (name in dom && !(dom instanceof SVGElement)) {\n      dom[name] = newValue == null ? '' : newValue;\n    } else if (newValue == null || newValue === false) {\n      dom.removeAttribute(name);\n    } else {\n      dom.setAttribute(name, newValue);\n    }\n  }\n}\n\nfunction createElement(fiber) {\n  const dom = fiber.type === 'text' ? document.createTextNode('') : fiber.tag === SVG ? document.createElementNS('http://www.w3.org/2000/svg', fiber.type) : document.createElement(fiber.type);\n  updateElement(dom, {}, fiber.props);\n  return dom;\n}\n\nlet cursor = 0;\n\nfunction resetCursor() {\n  cursor = 0;\n}\n\nfunction useState(initState) {\n  return useReducer(null, initState);\n}\n\nfunction useReducer(reducer, initState) {\n  const [hook, current] = getHook(cursor++);\n\n  const setter = value => {\n    let newValue = reducer ? reducer(hook[0], value) : isFn(value) ? value(hook[0]) : value;\n\n    if (newValue !== hook[0]) {\n      hook[0] = newValue;\n      scheduleWork(current);\n    }\n  };\n\n  if (hook.length) {\n    return [hook[0], setter];\n  } else {\n    hook[0] = initState;\n    return [initState, setter];\n  }\n}\n\nfunction useEffect(cb, deps) {\n  return effectImpl(cb, deps, 'effect');\n}\n\nfunction useLayout(cb, deps) {\n  return effectImpl(cb, deps, 'layout');\n}\n\nfunction effectImpl(cb, deps, key) {\n  let [hook, current] = getHook(cursor++);\n\n  if (isChanged(hook[1], deps)) {\n    hook[0] = useCallback(cb, deps);\n    hook[1] = deps;\n    current.hooks[key].push(hook);\n  }\n}\n\nfunction useMemo(cb, deps) {\n  let hook = getHook(cursor++)[0];\n\n  if (isChanged(hook[1], deps)) {\n    hook[1] = deps;\n    return hook[0] = cb();\n  }\n\n  return hook[0];\n}\n\nfunction useCallback(cb, deps) {\n  return useMemo(() => cb, deps);\n}\n\nfunction useRef(current) {\n  return useMemo(() => ({\n    current\n  }), []);\n}\n\nfunction getHook(cursor) {\n  const current = getCurrentFiber();\n  let hooks = current.hooks || (current.hooks = {\n    list: [],\n    effect: [],\n    layout: []\n  });\n\n  if (cursor >= hooks.list.length) {\n    hooks.list.push([]);\n  }\n\n  return [hooks.list[cursor], current];\n}\n\nfunction isChanged(a, b) {\n  return !a || b.some((arg, index) => arg !== a[index]);\n}\n\nfunction push(heap, node) {\n  const i = heap.length;\n  heap.push(node);\n  siftUp(heap, node, i);\n}\n\nfunction pop(heap) {\n  const first = heap[0];\n  if (!first) return null;\n  const last = heap.pop();\n\n  if (last !== first) {\n    heap[0] = last;\n    siftDown(heap, last, 0);\n  }\n\n  return first;\n}\n\nfunction siftUp(heap, node, i) {\n  while (i > 0) {\n    const pi = i - 1 >>> 1;\n    const parent = heap[pi];\n    if (cmp(parent, node) <= 0) return;\n    heap[pi] = node;\n    heap[i] = parent;\n    i = pi;\n  }\n}\n\nfunction siftDown(heap, node, i) {\n  for (;;) {\n    const li = i * 2 + 1;\n    const left = heap[li];\n    if (li >= heap.length) return;\n    const ri = li + 1;\n    const right = heap[ri];\n    const ci = ri < heap.length && cmp(right, left) < 0 ? ri : li;\n    const child = heap[ci];\n    if (cmp(child, node) > 0) return;\n    heap[ci] = node;\n    heap[i] = child;\n    i = ci;\n  }\n}\n\nfunction cmp(a, b) {\n  return a.dueTime - b.dueTime;\n}\n\nfunction peek(heap) {\n  return heap[0] || null;\n}\n\nlet taskQueue = [];\nlet currentCallback = null;\nlet frameDeadline = 0;\nconst frameLength = 1000 / 60;\n\nfunction scheduleCallback(callback) {\n  const currentTime = getTime();\n  const startTime = currentTime;\n  const timeout = 3000;\n  const dueTime = startTime + timeout;\n  let newTask = {\n    callback,\n    startTime,\n    dueTime\n  };\n  push(taskQueue, newTask);\n  currentCallback = flush;\n  planWork();\n}\n\nfunction flush(iniTime) {\n  let currentTime = iniTime;\n  let currentTask = peek(taskQueue);\n\n  while (currentTask) {\n    const didout = currentTask.dueTime <= currentTime;\n    if (!didout && shouldYeild()) break;\n    let callback = currentTask.callback;\n    currentTask.callback = null;\n    let next = callback(didout);\n    next ? currentTask.callback = next : pop(taskQueue);\n    currentTask = peek(taskQueue);\n    currentTime = getTime();\n  }\n\n  return !!currentTask;\n}\n\nfunction flushWork() {\n  if (currentCallback) {\n    let currentTime = getTime();\n    frameDeadline = currentTime + frameLength;\n    let more = currentCallback(currentTime);\n    more ? planWork() : currentCallback = null;\n  }\n}\n\nconst planWork = (() => {\n  if (typeof MessageChannel !== 'undefined') {\n    const {\n      port1,\n      port2\n    } = new MessageChannel();\n    port1.onmessage = flushWork;\n    return cb => cb ? requestAnimationFrame(cb) : port2.postMessage(null);\n  }\n\n  return cb => setTimeout(cb || flushWork);\n})();\n\nfunction shouldYeild() {\n  return getTime() >= frameDeadline;\n}\n\nconst getTime = () => performance.now();\n\nconst NOWORK = 0;\nconst PLACE = 1;\nconst UPDATE = 2;\nconst DELETE = 3;\nconst SVG = 4;\nlet preCommit = null;\nlet currentFiber = null;\nlet WIP = null;\nlet updateQueue = [];\nlet commitQueue = [];\n\nfunction render(vnode, node, done) {\n  let rootFiber = {\n    node,\n    props: {\n      children: vnode\n    },\n    done\n  };\n  scheduleWork(rootFiber);\n}\n\nfunction scheduleWork(fiber) {\n  if (!fiber.dirty && (fiber.dirty = true)) {\n    updateQueue.push(fiber);\n  }\n\n  scheduleCallback(reconcileWork);\n}\n\nfunction reconcileWork(didout) {\n  if (!WIP) WIP = updateQueue.shift();\n\n  while (WIP && (!shouldYeild() || didout)) {\n    WIP = reconcile(WIP);\n  }\n\n  if (!didout && WIP) {\n    return reconcileWork.bind(null);\n  }\n\n  if (preCommit) commitWork(preCommit);\n  return null;\n}\n\nfunction reconcile(WIP) {\n  WIP.parentNode = getParentNode(WIP);\n  isFn(WIP.type) ? updateHOOK(WIP) : updateHost(WIP);\n  WIP.dirty = WIP.dirty ? false : 0;\n  WIP.oldProps = WIP.props;\n  commitQueue.push(WIP);\n  if (WIP.child) return WIP.child;\n\n  while (WIP) {\n    if (!preCommit && WIP.dirty === false) {\n      preCommit = WIP;\n      return null;\n    }\n\n    if (WIP.sibling) {\n      return WIP.sibling;\n    }\n\n    WIP = WIP.parent;\n  }\n}\n\nfunction updateHOOK(WIP) {\n  if (WIP.type.tag === MEMO && WIP.dirty == 0 && !shouldUpdate(WIP.oldProps, WIP.props)) {\n    cloneChildren(WIP);\n    return;\n  }\n\n  currentFiber = WIP;\n  resetCursor();\n  let children = WIP.type(WIP.props);\n\n  if (isStr(children)) {\n    children = createText(children);\n  }\n\n  reconcileChildren(WIP, children);\n}\n\nfunction updateHost(WIP) {\n  if (!WIP.node) {\n    if (WIP.type === 'svg') WIP.tag = SVG;\n    WIP.node = createElement(WIP);\n  }\n\n  let p = WIP.parentNode || {};\n  WIP.insertPoint = p.last || null;\n  p.last = WIP;\n  WIP.node.last = null;\n  reconcileChildren(WIP, WIP.props.children);\n}\n\nfunction getParentNode(fiber) {\n  while (fiber = fiber.parent) {\n    if (!isFn(fiber.type)) return fiber.node;\n  }\n}\n\nfunction reconcileChildren(WIP, children) {\n  if (!children) return;\n  delete WIP.child;\n  const oldFibers = WIP.kids;\n  const newFibers = WIP.kids = hashfy(children);\n  let reused = {};\n\n  for (const k in oldFibers) {\n    let newFiber = newFibers[k];\n    let oldFiber = oldFibers[k];\n\n    if (newFiber && newFiber.type === oldFiber.type) {\n      reused[k] = oldFiber;\n    } else {\n      oldFiber.op = DELETE;\n      commitQueue.push(oldFiber);\n    }\n  }\n\n  let prevFiber = null;\n  let alternate = null;\n\n  for (const k in newFibers) {\n    let newFiber = newFibers[k];\n    let oldFiber = reused[k];\n\n    if (oldFiber) {\n      alternate = createFiber(oldFiber, UPDATE);\n      newFiber.op = UPDATE;\n      newFiber = { ...alternate,\n        ...newFiber\n      };\n      newFiber.lastProps = alternate.props;\n\n      if (shouldPlace(newFiber)) {\n        newFiber.op = PLACE;\n      }\n    } else {\n      newFiber = createFiber(newFiber, PLACE);\n    }\n\n    newFibers[k] = newFiber;\n    newFiber.parent = WIP;\n\n    if (prevFiber) {\n      prevFiber.sibling = newFiber;\n    } else {\n      if (WIP.tag === SVG) newFiber.tag = SVG;\n      WIP.child = newFiber;\n    }\n\n    prevFiber = newFiber;\n  }\n\n  if (prevFiber) prevFiber.sibling = null;\n}\n\nfunction cloneChildren(fiber) {\n  if (!fiber.child) return;\n  let child = fiber.child;\n  let newChild = child;\n  newChild.op = NOWORK;\n  fiber.child = newChild;\n  newChild.parent = fiber;\n  newChild.sibling = null;\n}\n\nfunction shouldUpdate(a, b) {\n  for (let i in a) if (!(i in b)) return true;\n\n  for (let i in b) if (a[i] !== b[i]) return true;\n\n  return false;\n}\n\nfunction shouldPlace(fiber) {\n  let p = fiber.parent;\n  if (isFn(p.type)) return p.key && !p.dirty;\n  return fiber.key;\n}\n\nfunction commitWork(fiber) {\n  commitQueue.forEach(c => c.parent && commit(c));\n  fiber.done && fiber.done();\n  commitQueue = [];\n  preCommit = null;\n  WIP = null;\n}\n\nfunction commit(fiber) {\n  const {\n    op,\n    parentNode,\n    node,\n    ref,\n    hooks\n  } = fiber;\n  if (op === NOWORK) ;else if (op === DELETE) {\n    hooks && hooks.list.forEach(cleanup);\n    cleanupRef(fiber.kids);\n\n    while (isFn(fiber.type)) fiber = fiber.child;\n\n    parentNode.removeChild(fiber.node);\n  } else if (isFn(fiber.type)) {\n    if (hooks) {\n      hooks.layout.forEach(cleanup);\n      hooks.layout.forEach(effect);\n      hooks.layout = [];\n      planWork(() => {\n        hooks.effect.forEach(cleanup);\n        hooks.effect.forEach(effect);\n        hooks.effect = [];\n      });\n    }\n  } else if (op === UPDATE) {\n    updateElement(node, fiber.lastProps, fiber.props);\n  } else {\n    let point = fiber.insertPoint ? fiber.insertPoint.node : null;\n    let after = point ? point.nextSibling : parentNode.firstChild;\n    if (after === node) return;\n    if (after === null && node === parentNode.lastChild) return;\n    parentNode.insertBefore(node, after);\n  }\n  refer(ref, node);\n}\n\nfunction createFiber(vnode, op) {\n  return { ...vnode,\n    op\n  };\n}\n\nconst hashfy = c => {\n  const out = {};\n  isArr(c) ? c.forEach((v, i) => isArr(v) ? v.forEach((vi, j) => out[hs(i, j, vi.key)] = vi) : out[hs(i, null, v.key)] = v) : out[hs(0, null, c.key)] = c;\n  return out;\n};\n\nfunction refer(ref, dom) {\n  if (ref) isFn(ref) ? ref(dom) : ref.current = dom;\n}\n\nfunction cleanupRef(kids) {\n  for (const k in kids) {\n    const kid = kids[k];\n    refer(kid.ref, null);\n    if (kid.kids) cleanupRef(kid.kids);\n  }\n}\n\nconst cleanup = e => e[2] && e[2]();\n\nconst effect = e => {\n  const res = e[0]();\n  if (isFn(res)) e[2] = res;\n};\n\nconst getCurrentFiber = () => currentFiber || null;\n\nconst isFn = fn => typeof fn === 'function';\n\nconst hs = (i, j, k) => k != null && j != null ? '.' + i + '.' + k : j != null ? '.' + i + '.' + j : k != null ? '.' + k : '.' + i;\n\nconst Fre = {\n  h,\n  Fragment,\n  render,\n  scheduleWork,\n  useState,\n  useReducer,\n  useEffect,\n  useMemo,\n  useCallback,\n  useRef,\n  memo\n};\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Fre);\n\n\n//# sourceURL=webpack://fard-ide/./node_modules/fre/dist/fre.esm.js?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! dynamic exports */
/*! exports [maybe provided (runtime-defined)] [no usage info] */
/*! runtime requirements: module */
/***/ ((module) => {

eval("module.exports = require(\"electron\");;\n\n//# sourceURL=webpack://fard-ide/external_%22electron%22?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./app/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;