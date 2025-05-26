// master/worker-dom.js
function workerdom() {
  let observers = [], pendingMutations = false;
  class Node {
    constructor(nodeType, nodeName) {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.childNodes = [];
    }
    appendChild(child) {
      child.remove();
      child.parentNode = this;
      this.childNodes.push(child);
      if (this.children && child.nodeType === 1)
        this.children.push(child);
      mutation(this, "childList", { addedNodes: [child], previousSibling: this.childNodes[this.childNodes.length - 2] });
    }
    insertBefore(child, ref) {
      child.remove();
      let i = splice(this.childNodes, ref, child), ref2;
      if (!ref) {
        this.appendChild(child);
      } else {
        if (~i && child.nodeType === 1) {
          while (i < this.childNodes.length && (ref2 = this.childNodes[i]).nodeType !== 1 || ref === child)
            i++;
          if (ref2)
            splice(this.children, ref, child);
        }
        mutation(this, "childList", { addedNodes: [child], nextSibling: ref });
      }
    }
    replaceChild(child, ref) {
      if (ref.parentNode === this) {
        this.insertBefore(child, ref);
        ref.remove();
      }
    }
    removeChild(child) {
      let i = splice(this.childNodes, child);
      if (child.nodeType === 1)
        splice(this.children, child);
      mutation(this, "childList", { removedNodes: [child], previousSibling: this.childNodes[i - 1], nextSibling: this.childNodes[i] });
    }
    remove() {
      if (this.parentNode)
        this.parentNode.removeChild(this);
    }
  }
  class Text2 extends Node {
    constructor(text) {
      super(3, "#text");
      this.data = text;
    }
    get textContent() {
      return this.data;
    }
    set textContent(value2) {
      let oldValue = this.data;
      this.data = value2;
      mutation(this, "characterData", { oldValue });
    }
    get nodeValue() {
      return this.data;
    }
    set nodeValue(value2) {
      this.textContent = value2;
    }
  }
  class Element extends Node {
    constructor(nodeType, nodeName) {
      super(nodeType || 1, nodeName);
      this.attributes = [];
      this.children = [];
      this.__handlers = {};
      this.style = {};
      Object.defineProperty(this, "className", {
        set: (val) => {
          this.setAttribute("class", val);
        },
        get: () => this.getAttribute("style")
      });
      Object.defineProperty(this.style, "cssText", {
        set: (val) => {
          this.setAttribute("style", val);
        },
        get: () => this.getAttribute("style")
      });
    }
    setAttribute(key2, value2) {
      this.setAttributeNS(null, key2, value2);
    }
    getAttribute(key2) {
      return this.getAttributeNS(null, key2);
    }
    removeAttribute(key2) {
      this.removeAttributeNS(null, key2);
    }
    setAttributeNS(ns, name, value2) {
      let attr = findWhere(this.attributes, createAttributeFilter(ns, name)), oldValue = attr && attr.value;
      if (!attr)
        this.attributes.push(attr = { ns, name });
      attr.value = String(value2);
      mutation(this, "attributes", { attributeName: name, attributeNamespace: ns, oldValue });
    }
    getAttributeNS(ns, name) {
      let attr = findWhere(this.attributes, createAttributeFilter(ns, name));
      return attr && attr.value;
    }
    removeAttributeNS(ns, name) {
      splice(this.attributes, createAttributeFilter(ns, name));
      mutation(this, "attributes", { attributeName: name, attributeNamespace: ns, oldValue: this.getAttributeNS(ns, name) });
    }
    addEventListener(type, handler) {
      (this.__handlers[toLower(type)] || (this.__handlers[toLower(type)] = [])).push(handler);
    }
    removeEventListener(type, handler) {
      splice(this.__handlers[toLower(type)], handler, 0, true);
    }
    dispatchEvent(event) {
      let t = event.currentTarget = this, c = event.cancelable, l, i;
      do {
        l = t.__handlers && t.__handlers[toLower(event.type)];
        if (l)
          for (i = l.length; i--; ) {
            if ((l[i].call(t, event) === false || event._end) && c)
              break;
          }
      } while (event.bubbles && !(c && event._stop) && (event.target = t = t.parentNode));
      return !event.defaultPrevented;
    }
  }
  class SVGElement2 extends Element {
  }
  class Document extends Element {
    constructor() {
      super(9, "#document");
    }
  }
  class Event {
    constructor(type, opts) {
      this.type = type;
      this.bubbles = !!opts.bubbles;
      this.cancelable = !!opts.cancelable;
    }
    stopPropagation() {
      this._stop = true;
    }
    stopImmediatePropagation() {
      this._end = this._stop = true;
    }
    preventDefault() {
      this.defaultPrevented = true;
    }
  }
  function mutation(target, type, record) {
    record.target = target;
    record.type = type;
    for (let i = observers.length; i--; ) {
      let ob = observers[i], match = target === ob._target;
      if (!match && ob._options.subtree) {
        do {
          if (match = target === ob._target)
            break;
        } while (target = target.parentNode);
      }
      if (match) {
        ob._records.push(record);
        if (!pendingMutations) {
          pendingMutations = true;
          setImmediate(flushMutations);
        }
      }
    }
  }
  function flushMutations() {
    pendingMutations = false;
    for (let i = observers.length; i--; ) {
      let ob = observers[i];
      if (ob._records.length) {
        ob.callback(ob.takeRecords());
      }
    }
  }
  class MutationObserver2 {
    constructor(callback) {
      this.callback = callback;
      this._records = [];
    }
    observe(target, options) {
      this.disconnect();
      this._target = target;
      this._options = options || {};
      observers.push(this);
    }
    disconnect() {
      this._target = null;
      splice(observers, this);
    }
    takeRecords() {
      return this._records.splice(0, this._records.length);
    }
  }
  function createElement2(type) {
    return new Element(null, String(type).toUpperCase());
  }
  function createElementNS(ns, type) {
    let element = createElement2(type);
    element.namespace = ns;
    return element;
  }
  function createTextNode(text) {
    return new Text2(text);
  }
  function createDocument() {
    let document3 = new Document();
    assign(document3, document3.defaultView = { document: document3, MutationObserver: MutationObserver2, Document, Node, Text: Text2, Element, SVGElement: SVGElement2, Event });
    assign(document3, { documentElement: document3, createElement: createElement2, createElementNS, createTextNode });
    document3.appendChild(document3.body = createElement2("body"));
    return document3;
  }
  return createDocument();
}
function assign(obj, props) {
  for (let i in props)
    obj[i] = props[i];
}
function toLower(str) {
  return String(str).toLowerCase();
}
function createAttributeFilter(ns, name) {
  return (o) => o.ns === ns && toLower(o.name) === toLower(name);
}
function splice(arr, item, add, byValueOnly) {
  let i = arr ? findWhere(arr, item, true, byValueOnly) : -1;
  if (~i)
    add ? arr.splice(i, 0, add) : arr.splice(i, 1);
  return i;
}
function findWhere(arr, fn, returnIndex, byValueOnly) {
  let i = arr.length;
  while (i--)
    if (typeof fn === "function" && !byValueOnly ? fn(arr[i]) : arr[i] === fn)
      break;
  return returnIndex ? i : arr[i];
}
var resolved = typeof Promise !== "undefined" && Promise.resolve();
var setImmediate = resolved ? (f) => {
  resolved.then(f);
} : setTimeout;

// master/wxapi.js
var callbacks = {};
var index = 0;
var wx = {
  navigateTo(options) {
    sendMessage("navigateTo", options);
  },
  showToast(options) {
    sendMessage("showToast", options);
  },
  showPicker(options) {
    sendMessage("showPicker", options);
  },
  request(url, data) {
    if (typeof fetch !== "undefined") {
      return new Promise((resolve) => {
        fetch(url, data).then((res) => res.json()).then((data2) => {
          resolve(data2);
        });
      });
    }
  }
};
function serOptions(options) {
  let out = {};
  for (const key2 in options) {
    let val = options[key2];
    if (typeof val === "function") {
      let id = "." + index;
      out[key2] = id;
      callbacks[id] = val;
      index++;
    } else {
      out[key2] = val;
    }
  }
  return out;
}
function sendMessage(name, options) {
  const ser = serOptions(options);
  const args = {
    type: "wxapi",
    name,
    options: ser
  };
  send(args);
}
function handleWxEvent(data) {
  console.log(data.id);
  let callback = callbacks[data.id];
  callback(data.res);
  callbacks[data.id] = void 0;
}

// master/exec-script.js
function execScript(path, ref) {
  const { modules, native, fre: fre2, comp: comp2, getApp: getApp2, Page: Page2, Component: Component2, App: App2, $handleEvent: $handleEvent2, setStates, $for: $for2, wx: wx2 } = ref;
  const str = path;
  const fn = new Function("module", "require", "fre", "comp", "getApp", "Page", "Component", "App", "$handleEvent", "$for", "setStates", "wx", str);
  const relative = function(parent) {
    const resolve = function(path2) {
      var orig = path2;
      var reg = path2 + ".js";
      var index2 = path2 + "/index.js";
      return modules[reg] && reg || modules[index2] && index2 || orig;
    };
    function require2(p) {
      return modules[resolve(p)];
    }
    return function(p) {
      if ("." != p.charAt(0))
        return require2(p);
      var path2 = parent.split("/");
      var segs = p.split("/");
      path2.pop();
      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if (".." == seg)
          path2.pop();
        else if ("." != seg)
          path2.push(seg);
      }
      return require2(path2.join("/"));
    };
  };
  var module = {
    exports: {}
  };
  try {
    fn.call(module.exports, module, relative(path), fre2, comp2, getApp2, Page2, Component2, App2, $handleEvent2, $for2, setStates, wx2);
  } catch (e) {
    console.log(e);
  }
  modules[path] = module.exports;
}

// master/app.js
var app = null;
var _App = class {
  constructor() {
    this.graph = {};
  }
};
function App(option) {
  app = new _App();
}
function getApp() {
  return app;
}
function getInsById(id) {
  return app.graph[id];
}
App();

// master/fre-esm.js
var defaultObj = {};
var jointIter = (aProps, bProps, callback) => {
  aProps = aProps || defaultObj;
  bProps = bProps || defaultObj;
  Object.keys(aProps).forEach((k) => callback(k, aProps[k], bProps[k]));
  Object.keys(bProps).forEach((k) => !aProps.hasOwnProperty(k) && callback(k, void 0, bProps[k]));
};
var updateElement = (dom, aProps, bProps) => {
  jointIter(aProps, bProps, (name, a, b) => {
    if (a === b || name === "children")
      ;
    else if (name === "style" && !isStr(b)) {
      jointIter(a, b, (styleKey, aStyle, bStyle) => {
        if (aStyle !== bStyle) {
          dom[name][styleKey] = bStyle || "";
        }
      });
    } else if (name[0] === "o" && name[1] === "n") {
      name = name.slice(2).toLowerCase();
      if (a)
        dom.removeEventListener(name, a);
      dom.addEventListener(name, b);
    } else if (name in dom && !(dom instanceof SVGElement)) {
      dom[name] = b || "";
    } else if (b == null || b === false) {
      dom.removeAttribute(name);
    } else {
      dom.setAttribute(name, b);
    }
  });
};
var createElement = (fiber) => {
  const dom = fiber.type === "#text" ? document.createTextNode("") : fiber.lane & 16 ? document.createElementNS("http://www.w3.org/2000/svg", fiber.type) : document.createElement(fiber.type);
  updateElement(dom, {}, fiber.props);
  return dom;
};
var cursor = 0;
var resetCursor = () => {
  cursor = 0;
};
var useState = (initState) => {
  return useReducer(null, initState);
};
var useReducer = (reducer, initState) => {
  const [hook, current] = getSlot(cursor++);
  if (hook.length === 0) {
    hook[0] = initState;
  }
  hook[1] = (value2) => {
    let v = reducer ? reducer(hook[0], value2) : isFn(value2) ? value2(hook[0]) : value2;
    if (hook[0] !== v) {
      hook[0] = v;
      update(current);
    }
  };
  return hook;
};
var useEffect = (cb, deps) => {
  return effectImpl(cb, deps, "effect");
};
var useLayout = (cb, deps) => {
  return effectImpl(cb, deps, "layout");
};
var effectImpl = (cb, deps, key2) => {
  const [hook, current] = getSlot(cursor++);
  if (isChanged(hook[1], deps)) {
    hook[0] = cb;
    hook[1] = deps;
    current.hooks[key2].push(hook);
  }
};
var useMemo = (cb, deps) => {
  const hook = getSlot(cursor++)[0];
  if (isChanged(hook[1], deps)) {
    hook[1] = deps;
    return hook[0] = cb();
  }
  return hook[0];
};
var useCallback = (cb, deps) => {
  return useMemo(() => cb, deps);
};
var useRef = (current) => {
  return useMemo(() => ({ current }), []);
};
var getSlot = (cursor2) => {
  const current = getCurrentFiber();
  const hooks = current.hooks || (current.hooks = { list: [], effect: [], layout: [] });
  if (cursor2 >= hooks.list.length) {
    hooks.list.push([]);
  }
  return [hooks.list[cursor2], current];
};
var isChanged = (a, b) => {
  return !a || a.length !== b.length || b.some((arg, index2) => !Object.is(arg, a[index2]));
};
var queue = [];
var threshold = 5;
var transitions = [];
var deadline = 0;
var startTransition = (cb) => {
  transitions.push(cb) && translate();
};
var schedule = (callback) => {
  queue.push({ callback });
  startTransition(flush);
};
var task = (pending) => {
  const cb = () => transitions.splice(0, 1).forEach((c) => c());
  if (!pending && typeof queueMicrotask !== "undefined") {
    return () => queueMicrotask(cb);
  }
  if (typeof MessageChannel !== "undefined") {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = cb;
    return () => port2.postMessage(null);
  }
  return () => setTimeout(cb);
};
var translate = task(false);
var flush = () => {
  deadline = getTime() + threshold;
  let job = peek(queue);
  while (job && !shouldYield()) {
    const { callback } = job;
    job.callback = null;
    const next = callback();
    if (next) {
      job.callback = next;
    } else {
      queue.shift();
    }
    job = peek(queue);
  }
  job && (translate = task(shouldYield())) && startTransition(flush);
};
var shouldYield = () => {
  return getTime() >= deadline;
};
var getTime = () => performance.now();
var peek = (queue2) => queue2[0];
var commit = (fiber) => {
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
  } else {
    commit(fiber);
  }
}
var getChildNode = (fiber) => {
  if (fiber == null)
    return null;
  if (fiber.isComp) {
    while (fiber = fiber.child) {
      if (!fiber.isComp)
        return fiber.node;
    }
  } else {
    return fiber.node;
  }
};
var refer = (ref, dom) => {
  if (ref)
    isFn(ref) ? ref(dom) : ref.current = dom;
};
var kidsRefer = (kids) => {
  kids.forEach((kid) => {
    kid.kids && kidsRefer(kid.kids);
    refer(kid.ref, null);
  });
};
var removeElement = (fiber, flag = true) => {
  if (fiber.isComp) {
    fiber.hooks && fiber.hooks.list.forEach((e) => e[2] && e[2]());
  } else {
    if (flag) {
      fiber.parentNode.removeChild(fiber.node);
      flag = false;
    }
    kidsRefer(fiber.kids);
    refer(fiber.ref, null);
  }
  fiber.kids.forEach((v) => removeElement(v, flag));
};
var currentFiber = null;
var rootFiber = null;
var render = (vnode, node) => {
  rootFiber = {
    node,
    props: { children: vnode }
  };
  update(rootFiber);
};
var update = (fiber) => {
  if (!fiber.dirty) {
    fiber.dirty = true;
    schedule(() => reconcile(fiber));
  }
};
var reconcile = (fiber) => {
  while (fiber && !shouldYield())
    fiber = capture(fiber);
  if (fiber)
    return reconcile.bind(null, fiber);
  return null;
};
var capture = (fiber) => {
  fiber.isComp = isFn(fiber.type);
  if (fiber.isComp) {
    if (isMemo(fiber)) {
      fiber.memo = true;
      return getSibling(fiber);
    } else if (fiber.memo) {
      fiber.memo = false;
    }
    updateHook(fiber);
  } else {
    updateHost(fiber);
  }
  if (fiber.child)
    return fiber.child;
  const sibling = getSibling(fiber);
  return sibling;
};
var isMemo = (fiber) => {
  var _a, _b;
  if (fiber.type.memo && fiber.type === ((_a = fiber.old) === null || _a === void 0 ? void 0 : _a.type) && ((_b = fiber.old) === null || _b === void 0 ? void 0 : _b.props)) {
    let scu = fiber.type.shouldUpdate || shouldUpdate;
    if (!scu(fiber.props, fiber.old.props)) {
      return true;
    }
  }
  return false;
};
var getSibling = (fiber) => {
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
var bubble = (fiber) => {
  if (fiber.isComp) {
    if (fiber.hooks) {
      side(fiber.hooks.layout);
      schedule(() => side(fiber.hooks.effect));
    }
  }
};
var shouldUpdate = (a, b) => {
  for (let i in a)
    if (!(i in b))
      return true;
  for (let i in b)
    if (a[i] !== b[i])
      return true;
};
var updateHook = (fiber) => {
  resetCursor();
  currentFiber = fiber;
  fiber.parentNode = getParentNode(fiber) || {};
  let children = fiber.type(fiber.props);
  reconcileChidren(fiber, simpleVnode(children));
};
var updateHost = (fiber) => {
  fiber.parentNode = getParentNode(fiber) || {};
  if (!fiber.node) {
    if (fiber.type === "svg")
      fiber.lane |= 16;
    fiber.node = createElement(fiber);
  }
  reconcileChidren(fiber, fiber.props.children);
};
var simpleVnode = (type) => isStr(type) ? createText(type) : type;
var getParentNode = (fiber) => {
  while (fiber = fiber.parent) {
    if (!fiber.isComp)
      return fiber.node;
  }
};
var reconcileChidren = (fiber, children) => {
  let aCh = fiber.kids || [], bCh = fiber.kids = arrayfy$1(children);
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
    } else {
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
var arrayfy$1 = (arr) => !arr ? [] : isArr(arr) ? arr : [arr];
var side = (effects) => {
  effects.forEach((e) => e[2] && e[2]());
  effects.forEach((e) => e[2] = e[0]());
  effects.length = 0;
};
var diff = (aCh, bCh) => {
  let aHead = 0, bHead = 0, aTail = aCh.length - 1, bTail = bCh.length - 1, aMap = {}, bMap = {}, same = (a, b) => a.key != null && b.key != null && a.key === b.key, temp = [], actions = [];
  while (aHead <= aTail && bHead <= bTail) {
    if (!same(aCh[aTail], bCh[bTail]))
      break;
    if (aCh[aTail].type === bCh[bTail].type) {
      clone(aCh[aTail], bCh[bTail]);
      temp.push({ op: 2 });
    } else {
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
    } else {
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
    } else if (bTail + 1 <= bHead) {
      removeElement(aElm);
      aHead++;
    } else if (aTail + 1 <= aHead) {
      actions.push({ op: 4, cur: bElm, ref: aElm });
      bHead++;
    } else if (aElm.key === bElm.key) {
      if (aElm.type === bElm.type) {
        clone(aElm, bElm);
        actions.push({ op: 2 });
      } else {
        actions.push({ op: 128, cur: bElm, ref: aElm });
      }
      aHead++;
      bHead++;
    } else {
      var foundB = bMap[aElm.key];
      var foundA = aMap[bElm.key];
      if (foundB == null) {
        removeElement(aElm);
        aHead++;
      } else if (foundA == null) {
        actions.push({ op: 4, cur: bElm, ref: aElm });
        bHead++;
      } else {
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
var getCurrentFiber = () => currentFiber || null;
var isFn = (x) => typeof x === "function";
var isStr = (s) => typeof s === "number" || typeof s === "string";
var h2 = (type, props, ...kids) => {
  props = props || {};
  kids = flat(arrayfy(props.children || kids));
  if (kids.length)
    props.children = kids.length === 1 ? kids[0] : kids;
  const key2 = props.key || null;
  const ref = props.ref || null;
  if (key2)
    props.key = void 0;
  if (ref)
    props.ref = void 0;
  return createVnode(type, props, key2, ref);
};
var arrayfy = (arr) => !arr ? [] : isArr(arr) ? arr : [arr];
var some = (x) => x != null && x !== true && x !== false;
var flat = (arr, target = []) => {
  arr.forEach((v) => {
    isArr(v) ? flat(v, target) : some(v) && target.push(isStr(v) ? createText(v) : v);
  });
  return target;
};
var createVnode = (type, props, key2, ref) => ({
  type,
  props,
  key: key2,
  ref
});
var createText = (vnode) => ({ type: "#text", props: { nodeValue: vnode + "" } });
function Fragment(props) {
  return props.children;
}
var isArr = Array.isArray;

// master/components/button.js
function Button(props) {
  return /* @__PURE__ */ h2("button", { ...props });
}

// master/components/text.js
function Text(props) {
  return /* @__PURE__ */ h2("span", { ...props });
}

// master/components/view.js
function computedStype(str) {
  let out = {};
  let arr = str.split(";");
  arr.forEach((s) => {
    const [name, value2] = s.split(":");
    out[name] = value2;
  });
  return out;
}
function View(props) {
  if (props.style) {
    var style = computedStype(props.style);
    delete props.style;
  }
  return /* @__PURE__ */ h2("div", { ...props, style });
}

// master/components/switch.js
function Switch(props) {
  const [checked, setChecked] = useState(props.checked);
  const onChange = (e) => {
    setChecked(e.detail.checked);
    props.onChange && props.onChange({ detail: { value: e.detail.checked } });
  };
  return /* @__PURE__ */ h2("input", { ...props, type: "checkbox", tag: "switch", onInput: onChange, checked });
}

// master/components/icon.js
function Icon(props) {
  const { size = 24, color = "var(--primary-color)", type, ...rest } = props;
  return /* @__PURE__ */ h2(
    "i",
    {
      ...rest,
      type,
      style: {
        color: props.color,
        height: props.size + "px",
        width: props.size + "px"
      }
    }
  );
}
var icon_default = Icon;

// master/components/input.js
function Input(props) {
  return /* @__PURE__ */ h2(
    "input",
    {
      style: {
        border: " 0px",
        padding: " 5px",
        "box-sizing": " border-box",
        outline: " none",
        "border-radius": "2px",
        ...props.style
      },
      type: "text",
      ...props
    }
  );
}

// master/components/block.js
function Block(props) {
  return /* @__PURE__ */ h2("div", null, props.children);
}

// master/components/label.js
function Label(props) {
  const { children, ...rest } = props;
  return /* @__PURE__ */ h2("label", { ...rest }, children);
}
var label_default = Label;

// master/context.js
var createContext = (defaultValue) => {
  const context = {
    value: defaultValue,
    subs: /* @__PURE__ */ new Set(),
    Provider: ({ value: value2, children = "" }) => {
      useEffect(() => {
        context.subs.forEach((fn) => fn(value2));
        context.value = value2;
      });
      return children;
    }
  };
  return context;
};
var useContext = (context, selector) => {
  const subs = context.subs;
  const [, forceUpdate] = useReducer((c) => c + 1, 0);
  const selected = selector ? selector(context.value) : context.value;
  const ref = useRef(null);
  useEffect(() => {
    ref.current = selected;
  });
  useEffect(() => {
    const fn = (nextValue) => {
      if (selector && ref.current === selector(nextValue))
        return;
      forceUpdate(nextValue);
    };
    subs.add(fn);
    return () => subs.delete(fn);
  }, [subs]);
  return selected;
};

// master/components/radio-group.js
var RadioContext = createContext();
function RadioGroup(props) {
  const { onChange } = props;
  return /* @__PURE__ */ h2(RadioContext.Provider, { value: onChange }, /* @__PURE__ */ h2("div", null, props.children));
}
var radio_group_default = RadioGroup;

// master/components/radio.js
function Radio(props) {
  const change = useContext(RadioContext);
  let { color, id, style, value: value2 } = props;
  const onClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
  };
  const onChange = (e) => {
    e.stopPropagation && e.stopPropagation();
    change && change({ detail: { value: value2 } });
    if (props.onChange) {
      props.onChange({
        detail: {
          value: value2,
          checked: e.target.checked
        }
      });
    }
  };
  if (props.checked === "undefined") {
    props.checked = false;
  }
  return /* @__PURE__ */ h2(
    "input",
    {
      id,
      type: "radio",
      checked: props.checked,
      onClick,
      onChange,
      style: { color, ...style }
    }
  );
}
var radio_default = Radio;

// master/components/checkbox-group.js
var CheckboxContext = createContext();
function CheckboxGroup(props) {
  const { onChange } = props;
  return /* @__PURE__ */ h2(CheckboxContext.Provider, { value: { change: onChange, value: [] } }, /* @__PURE__ */ h2("div", null, props.children));
}
var checkbox_group_default = CheckboxGroup;

// master/components/checkbox.js
function Checkbox(props) {
  let { change, value: newValue } = useContext(CheckboxContext);
  const [checked, setChecked] = useState(props.checked);
  let { color, id, style, value: value2 } = props;
  useEffect(() => {
    if (checked && newValue.indexOf(value2) === -1) {
      newValue.push(value2);
    } else if (!checked) {
      const index2 = newValue.indexOf(value2);
      newValue.splice(index2, 1);
    }
    change && change({ detail: { value: newValue } });
  }, [checked]);
  const onChange = (e) => {
    e.stopPropagation && e.stopPropagation();
    setChecked(e.target.checked);
    if (props.onChange) {
      props.onChange({
        detail: {
          value: value2,
          checked
        }
      });
    }
  };
  return /* @__PURE__ */ h(
    "input",
    {
      id,
      type: "checkbox",
      tag: "checkbox",
      style: { color, ...style },
      checked,
      onClick: props.onClick,
      onChange
    }
  );
}
var checkbox_default = Checkbox;

// master/components/image.js
function Image(props) {
  return /* @__PURE__ */ h2("img", { ...props });
}

// master/components/index.js
var comp = { Button, Text, View, Switch, Icon: icon_default, Input, Block, Label: label_default, Radio: radio_default, RadioGroup: radio_group_default, Checkbox: checkbox_default, CheckboxGroup: checkbox_group_default, Image };
var components_default = comp;

// master/component.js
var currentComponent = null;
var app2 = getApp();
function Component(option) {
  const { pid, tag, id } = Component;
  const parent = getInsById(pid);
  const c = new _Component(id, tag, pid, option);
  parent.children.set(id, c);
  currentComponent = c;
  app2.graph[id] = c;
}
var _Component = class {
  constructor(id, tag, pid, option) {
    this.id = id;
    this.tag = tag;
    this.pid = pid;
    this.children = /* @__PURE__ */ new Map();
    this.parent = null;
    this.eventMap = {};
    for (const key2 in option) {
      this[key2] = option[key2];
    }
  }
  setData(data) {
    this.data = { ...this.data, ...data };
    const setState = global.setStates[this.id];
    setState(this.data);
  }
  triggerEvent(name, e) {
    const parent = getInsById(this.pid);
    const realname = parent.eventMap["bind" + name];
    e.target.dataset = e.dataset;
    console.log(e);
    parent[realname].call(parent, e);
  }
};

// master/helper.js
function $handleEvent(name, id, custom) {
  const ins = getInsById(id);
  const method = ins[name] || (ins.methods || {})[name] || function() {
  };
  ins.eventMap[custom] = name;
  return (e) => {
    if (e.type === "keydown" && e.keyCode !== 13) {
      return;
    }
    if (e.target) {
      e.target.dataset = e.dataset;
    }
    method.call(ins, e);
  };
}
var $for = (arr, fn, key2) => {
  arr = arr || [];
  return arr.map((item, index2) => {
    const vdom = fn(item);
    vdom.key = key2 || index2;
    return vdom;
  });
};

// master/expr.js
var Cache = class {
  constructor() {
    this._maxSize = maxSize;
    this.clear();
  }
  clear() {
    this._size = 0;
    this._values = /* @__PURE__ */ Object.create(null);
  }
  get() {
    return this._values[key];
  }
  set() {
    this._size >= this._maxSize && this.clear();
    if (!(key in this._values))
      this._size++;
    return this._values[key] = value;
  }
};
var SPLIT_REGEX = /[^.^\]^[]+|(?=\[\]|\.\.)/g;
var CLEAN_QUOTES_REGEX = /^\s*(['"]?)(.*?)(\1)\s*$/;
var MAX_CACHE_SIZE = 512;
var pathCache = new Cache(MAX_CACHE_SIZE);
var setCache = new Cache(MAX_CACHE_SIZE);
var getCache = new Cache(MAX_CACHE_SIZE);
var setter = function(path) {
  var parts = normalizePath(path);
  return setCache.get(path) || setCache.set(path, function setter2(obj, value2) {
    var index2 = 0;
    var len = parts.length;
    var data = obj;
    while (index2 < len - 1) {
      var part = parts[index2];
      if (part === "__proto__" || part === "constructor" || part === "prototype") {
        return obj;
      }
      data = data[parts[index2++]];
    }
    data[parts[index2]] = value2;
  });
};
var getter = function(path, safe) {
  var parts = normalizePath(path);
  return getCache.get(path) || getCache.set(path, function getter2(data) {
    var index2 = 0, len = parts.length;
    while (index2 < len) {
      if (data != null || !safe)
        data = data[parts[index2++]];
      else
        return;
    }
    return data;
  });
};
function normalizePath(path) {
  return pathCache.get(path) || pathCache.set(
    path,
    split(path).map(function(part) {
      return part.replace(CLEAN_QUOTES_REGEX, "$2");
    })
  );
}
function split(path) {
  return path.match(SPLIT_REGEX) || [""];
}

// master/global.js
var fre = { Fragment, h: h2, render, useCallback, useEffect, useLayout, useMemo, useReducer, useRef, useState };
var global2 = {
  modules: {},
  Page,
  getApp,
  Component,
  fre,
  comp: components_default,
  $handleEvent,
  $for,
  setStates: {},
  wx,
  getter,
  setter,
  native: {
    readFileSync(path) {
      var request = new XMLHttpRequest();
      request.open("GET", "/" + path, false);
      request.send(null);
      if (request.status === 200) {
        return request.responseText;
      }
    },
    log(msg) {
      console.log(msg);
    }
  }
};

// master/page.js
var currentPage2 = null;
var app3 = getApp();
function Page(option) {
  const pageid = Page.id;
  const page = new _Page(pageid, option);
  app3.graph[pageid] = page;
  currentPage2 = page;
}
function getCurrentPage() {
  return currentPage2;
}
var _Page = class {
  constructor(id, option) {
    this.id = id;
    this.children = /* @__PURE__ */ new Map();
    this.parent = null;
    this.eventMap = {};
    for (const key2 in option) {
      this[key2] = option[key2];
    }
  }
  setData(data) {
    this.data = { ...this.data, ...data };
    const setState = global2.setStates[this.id];
    setState(this.data);
  }
};

// master/init.js
function init(manifest) {
  let path = "/";
  let p = "";
  const pages = manifest.pages;
  if (path === "/") {
    p = pages[0];
  } else {
    p = pages.find((i) => i.path === path);
  }
  const { scripts, styles } = p;
  let link = document.createElement("link");
  link.setAttribute("href", "." + styles[0]);
  link.setAttribute("rel", "stylesheet");
  document.body.appendChild(link);
  execScript(scripts[1], global2);
  execScript(scripts[0], global2);
  const page = getCurrentPage();
  const c = global2.modules[scripts[1]].default;
  const wrapComp = () => {
    useEffect(() => {
      page.onLoad && page.onLoad();
      return () => {
        page.unLoad && page.unLoad();
      };
    }, []);
    return h2(c, { data: page.data });
  };
  render(h2(wrapComp, {}), globalThis.document1.body);
}

// master/index.js
try {
  console.log(window);
} catch (error) {
  window = { isAndroid: false };
}
var window;
self.send = function send2(message) {
  try {
    if (window.isAndroid) {
      AndroidJSViewBridge.postMessage(JSON.stringify(message));
    }
  } catch (error) {
    postMessage(JSON.stringify(message));
  }
};
var document2 = self.document = workerdom();
globalThis.document1 = document2;
for (let i in document2.defaultView)
  if (document2.defaultView.hasOwnProperty(i)) {
    self[i] = document2.defaultView[i];
  }
var COUNTER = 0;
var TO_SANITIZE = ["addedNodes", "removedNodes", "nextSibling", "previousSibling", "target"];
var PROP_BLACKLIST = ["children", "parentNode", "__handlers", "_component", "_componentConstructor"];
var NODES = /* @__PURE__ */ new Map();
function getNode(node) {
  let id;
  if (node && typeof node === "object")
    id = node.__id;
  if (typeof node === "string")
    id = node;
  if (!id)
    return null;
  if (node.nodeName === "BODY")
    return document2.body;
  return NODES.get(id);
}
function handleEvent(event) {
  let target = getNode(event.target);
  if (target) {
    event.target = target;
    event.bubbles = true;
    target.dispatchEvent && target.dispatchEvent(event);
  }
}
function sanitize(obj) {
  if (!obj || typeof obj !== "object")
    return obj;
  if (Array.isArray(obj))
    return obj.map(sanitize);
  if (obj instanceof document2.defaultView.Node) {
    let id = obj.__id;
    if (!id) {
      id = obj.__id = String(++COUNTER);
    }
    NODES.set(id, obj);
  }
  let out = {};
  for (let i in obj) {
    if (obj.hasOwnProperty(i) && PROP_BLACKLIST.indexOf(i) < 0) {
      out[i] = obj[i];
    }
  }
  if (out.childNodes && out.childNodes.length) {
    out.childNodes = sanitize(out.childNodes);
  }
  return out;
}
new MutationObserver((mutations) => {
  for (let i = mutations.length; i--; ) {
    let mutation = mutations[i];
    for (let j = TO_SANITIZE.length; j--; ) {
      let prop = TO_SANITIZE[j];
      mutation[prop] = sanitize(mutation[prop]);
    }
  }
  send({ type: "MutationRecord", mutations });
}).observe(document2, { subtree: true, childList: true });
function _message(data) {
  if (typeof data === "string") {
    data = JSON.parse(data);
  }
  switch (data.type) {
    case "init":
      init(data.manifest ? data.manifest : window.manifest);
      break;
    case "event":
      handleEvent(data.event);
      break;
    case "wxcallback":
      handleWxEvent(data.payload);
      break;
  }
}
try {
  if (window.isAndroid) {
    AndroidJSViewBridge.onmessage = function(data) {
      _message(data);
    };
  }
} catch (error) {
  addEventListener("message", ({ data }) => {
    _message(data);
  });
}
