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
    set textContent(value) {
      let oldValue = this.data;
      this.data = value;
      mutation(this, "characterData", { oldValue });
    }
    get nodeValue() {
      return this.data;
    }
    set nodeValue(value) {
      this.textContent = value;
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
    setAttribute(key, value) {
      this.setAttributeNS(null, key, value);
    }
    getAttribute(key) {
      return this.getAttributeNS(null, key);
    }
    removeAttribute(key) {
      this.removeAttributeNS(null, key);
    }
    setAttributeNS(ns, name, value) {
      let attr = findWhere(this.attributes, createAttributeFilter(ns, name)), oldValue = attr && attr.value;
      if (!attr)
        this.attributes.push(attr = { ns, name });
      attr.value = String(value);
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
    observe(target, options2) {
      this.disconnect();
      this._target = target;
      this._options = options2 || {};
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
  navigateTo(options2) {
    sendMessage("navigateTo", options2);
  },
  showToast(options2) {
    sendMessage("showToast", options2);
  },
  showPicker(options2) {
    sendMessage("showPicker", options2);
  }
};
function serOptions(options2) {
  let out = {};
  for (const key in options2) {
    let val = options2[key];
    if (typeof val === "function") {
      out[key] = index;
      callbacks[index++] = val;
    } else {
      out[key] = val;
    }
  }
  return out;
}
function sendMessage(name, options2) {
  const args = {
    type: "wxapi",
    name,
    options: serOptions(options2)
  };
  send(args);
}
function handleWxEvent(data) {
  let callback = callbacks[data.id];
  callback(data.res);
  callbacks[data.id] = void 0;
}

// master/exec-script.js
function execScript(path, ref) {
  const { modules, native, fre: fre2, comp: comp2, getApp: getApp2, Page: Page2, Component: Component2, App: App2, $handleEvent: $handleEvent2, setStates, $for: $for2, wx: wx2 } = ref;
  const str = native.readFileSync(path);
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
  fn.exports = {};
  fn.call(fn.exports, fn, relative(path), fre2, comp2, getApp2, Page2, Component2, App2, $handleEvent2, $for2, setStates, wx2);
  modules[path] = fn.exports;
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
  const [hook, current] = getHook(cursor++);
  if (hook.length === 0) {
    hook[0] = initState;
    hook[1] = (value) => {
      hook[0] = reducer ? reducer(hook[0], value) : isFn(value) ? value(hook[0]) : value;
      update(current);
    };
  }
  return hook;
};
var useEffect = (cb, deps) => {
  return effectImpl(cb, deps, "effect");
};
var useLayout = (cb, deps) => {
  return effectImpl(cb, deps, "layout");
};
var effectImpl = (cb, deps, key) => {
  const [hook, current] = getHook(cursor++);
  if (isChanged(hook[1], deps)) {
    hook[0] = cb;
    hook[1] = deps;
    current.hooks[key].push(hook);
  }
};
var useMemo = (cb, deps) => {
  const hook = getHook(cursor++)[0];
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
var getHook = (cursor2) => {
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
  if (!pending && typeof Promise !== "undefined") {
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
  job && startTransition(flush);
};
var shouldYield = () => {
  const pending = getTime() >= deadline;
  translate = task(pending);
  return pending;
};
var getTime = () => performance.now();
var peek = (queue2) => queue2[0];
var commit = (fiber) => {
  let e = fiber.e;
  fiber.e = null;
  do {
    insert(e);
  } while (e = e.e);
};
var insert = (fiber) => {
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
var remove = (d) => {
  if (d.isComp) {
    d.hooks && d.hooks.list.forEach((e) => e[2] && e[2]());
    d.kids.forEach(remove);
  } else {
    kidsRefer(d.kids);
    d.parentNode.removeChild(d.node);
    refer(d.ref, null);
  }
};
var currentFiber;
var finish = null;
var effect = null;
var options = {};
var render = (vnode, node, config) => {
  const rootFiber = {
    node,
    props: { children: vnode }
  };
  if (config) {
    options = config;
  }
  update(rootFiber);
};
var update = (fiber) => {
  if (fiber && !(fiber.lane & 32)) {
    fiber.lane = 2 | 32;
    schedule(() => {
      effect = fiber;
      return reconcile(fiber);
    });
  }
};
var reconcile = (WIP) => {
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
var capture = (WIP) => {
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
var bubble = (WIP) => {
  if (WIP.isComp) {
    if (WIP.hooks) {
      side(WIP.hooks.layout);
      schedule(() => side(WIP.hooks.effect));
    }
  } else {
    effect.e = WIP;
    effect = WIP;
  }
};
var updateHook = (WIP) => {
  resetCursor();
  currentFiber = WIP;
  let children = WIP.type(WIP.props);
  diffKids(WIP, simpleVnode(children));
};
var updateHost = (WIP) => {
  WIP.parentNode = getParentNode(WIP) || {};
  if (!WIP.node) {
    if (WIP.type === "svg")
      WIP.lane |= 16;
    WIP.node = createElement(WIP);
  }
  WIP.childNodes = Array.from(WIP.node.childNodes || []);
  diffKids(WIP, WIP.props.children);
};
var simpleVnode = (type) => isStr(type) ? createText(type) : type;
var getParentNode = (WIP) => {
  while (WIP = WIP.parent) {
    if (!WIP.isComp)
      return WIP.node;
  }
};
var diffKids = (WIP, children) => {
  let aCh = WIP.kids || [], bCh = WIP.kids = arrayfy(children), aHead = 0, bHead = 0, aTail = aCh.length - 1, bTail = bCh.length - 1;
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
      } else {
        clone(aCh[aIndex], bCh[bIndex], 2);
      }
      aIndex++;
      bIndex++;
    } else if (op === 4) {
      let c = bCh[bIndex];
      mIndex = c.key != null ? keymap[c.key] : null;
      if (mIndex != null) {
        clone(aCh[mIndex], c, 4);
        c.after = WIP.childNodes[aIndex];
        aCh[mIndex] = void 0;
      } else {
        c.after = WIP.childNodes ? WIP.childNodes[aIndex] : null;
        c.lane = 4;
      }
      bIndex++;
    } else if (op === 8) {
      aIndex++;
    }
  }
  for (let i = 0, aIndex = aHead; i < len; i++) {
    let op = diff[i];
    if (op === 2) {
      aIndex++;
    } else if (op === 8) {
      let c = aCh[aIndex];
      if (c !== void 0) {
        c.lane = 8;
        effect.e = c;
        effect = c;
      }
      aIndex++;
    }
  }
  for (let i = 0, prev = null, len2 = bCh.length; i < len2; i++) {
    const child = bCh[i];
    if (WIP.lane & 16) {
      child.lane |= 16;
    }
    child.parent = WIP;
    if (i > 0) {
      prev.sibling = child;
    } else {
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
var same = (a, b) => {
  return a && b && a.key === b.key && a.type === b.type;
};
var arrayfy = (arr) => !arr ? [] : isArr(arr) ? arr : [arr];
var side = (effects) => {
  effects.forEach((e) => e[2] && e[2]());
  effects.forEach((e) => e[2] = e[0]());
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
    } else {
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
    keymap
  };
}
function bs(ktr, j) {
  let lo = 1;
  let hi = ktr.length - 1;
  while (lo <= hi) {
    let mid = lo + hi >>> 1;
    if (j < ktr[mid])
      hi = mid - 1;
    else
      lo = mid + 1;
  }
  return lo;
}
var getCurrentFiber = () => currentFiber || null;
var isFn = (x) => typeof x === "function";
var isStr = (s) => typeof s === "number" || typeof s === "string";
var h2 = (type, props, ...kids) => {
  props = props || {};
  kids = flat(arrayfy(props.children || kids));
  if (kids.length)
    props.children = kids.length === 1 ? kids[0] : kids;
  const key = props.key || null;
  const ref = props.ref || null;
  if (key)
    props.key = void 0;
  if (ref)
    props.ref = void 0;
  return createVnode(type, props, key, ref);
};
var some = (x) => x != null && x !== true && x !== false;
var flat = (arr, target = []) => {
  arr.forEach((v) => {
    isArr(v) ? flat(v, target) : some(v) && target.push(isStr(v) ? createText(v) : v);
  });
  return target;
};
var createVnode = (type, props, key, ref) => ({
  type,
  props,
  key,
  ref
});
var createText = (vnode) => ({ type: "#text", props: { nodeValue: vnode + "" } });
function Fragment(props) {
  return props.children;
}
var isArr = Array.isArray;

// master/components/button.js
function Button(props) {
  return /* @__PURE__ */ h2("button", {
    ...props
  });
}

// master/components/text.js
function Text(props) {
  return /* @__PURE__ */ h2("span", {
    ...props
  });
}

// master/components/view.js
function View(props) {
  return /* @__PURE__ */ h2("div", {
    ...props
  });
}

// master/components/switch.js
function Switch(props) {
  const [checked, setChecked] = useState(props.checked);
  const onChange = (e) => {
    setChecked(e.detail.checked);
    props.onChange && props.onChange({ detail: { value: e.detail.checked } });
  };
  return /* @__PURE__ */ h2("input", {
    ...props,
    type: "checkbox",
    tag: "switch",
    onInput: onChange,
    checked
  });
}

// master/components/icon.js
function Icon(props) {
  const { size = 24, color = "var(--primary-color)", type, ...rest } = props;
  return /* @__PURE__ */ h2("i", {
    ...rest,
    type,
    style: {
      color: props.color,
      height: props.size + "px",
      width: props.size + "px"
    }
  });
}
var icon_default = Icon;

// master/components/input.js
function Input(props) {
  return /* @__PURE__ */ h2("input", {
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
  });
}

// master/components/block.js
function Block(props) {
  return /* @__PURE__ */ h2("div", null, props.children);
}

// master/components/label.js
function Label(props) {
  const { children, ...rest } = props;
  return /* @__PURE__ */ h2("label", {
    ...rest
  }, children);
}
var label_default = Label;

// master/context.js
var createContext = (defaultValue) => {
  const context = {
    value: defaultValue,
    subs: /* @__PURE__ */ new Set(),
    Provider: ({ value, children = "" }) => {
      useEffect(() => {
        context.subs.forEach((fn) => fn(value));
        context.value = value;
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
  return /* @__PURE__ */ h2(RadioContext.Provider, {
    value: onChange
  }, /* @__PURE__ */ h2("div", null, props.children));
}
var radio_group_default = RadioGroup;

// master/components/radio.js
function Radio(props) {
  const change = useContext(RadioContext);
  let { color, id, style, value } = props;
  const onClick = (e) => {
    if (props.onClick) {
      props.onClick(e);
    }
  };
  const onChange = (e) => {
    e.stopPropagation && e.stopPropagation();
    change && change({ detail: { value } });
    if (props.onChange) {
      props.onChange({
        detail: {
          value,
          checked: e.target.checked
        }
      });
    }
  };
  if (props.checked === "undefined") {
    props.checked = false;
  }
  return /* @__PURE__ */ h2("input", {
    id,
    type: "radio",
    checked: props.checked,
    onClick,
    onChange,
    style: { color, ...style }
  });
}
var radio_default = Radio;

// master/components/checkbox-group.js
var CheckboxContext = createContext();
function CheckboxGroup(props) {
  const { onChange } = props;
  return /* @__PURE__ */ h2(CheckboxContext.Provider, {
    value: { change: onChange, value: [] }
  }, /* @__PURE__ */ h2("div", null, props.children));
}
var checkbox_group_default = CheckboxGroup;

// master/components/checkbox.js
function Checkbox(props) {
  let { change, value: newValue } = useContext(CheckboxContext);
  const [checked, setChecked] = useState(props.checked);
  let { color, id, style, value } = props;
  useEffect(() => {
    if (checked && newValue.indexOf(value) === -1) {
      newValue.push(value);
    } else if (!checked) {
      const index2 = newValue.indexOf(value);
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
          value,
          checked
        }
      });
    }
  };
  return /* @__PURE__ */ h("input", {
    id,
    type: "checkbox",
    tag: "checkbox",
    style: { color, ...style },
    checked,
    onClick: props.onClick,
    onChange
  });
}
var checkbox_default = Checkbox;

// master/components/index.js
var comp = { Button, Text, View, Switch, Icon: icon_default, Input, Block, Label: label_default, Radio: radio_default, RadioGroup: radio_group_default, Checkbox: checkbox_default, CheckboxGroup: checkbox_group_default };
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
    for (const key in option) {
      this[key] = option[key];
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
var $for = (arr, fn, key) => {
  arr = arr || [];
  return arr.map((item, index2) => {
    const vdom = fn(item);
    vdom.key = key || index2;
    return vdom;
  });
};

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
    for (const key in option) {
      this[key] = option[key];
    }
  }
  setData(data) {
    this.data = { ...this.data, ...data };
    const setState = global2.setStates[this.id];
    setState(this.data);
  }
};

// master/init.js
function init(location) {
  let path = location.pathname;
  let p = "";
  const manifest = global2.native.readFileSync("demo/manifest.json");
  const pages = JSON.parse(manifest).pages;
  console.log(path, pages);
  if (path === "/") {
    p = pages[0];
  } else {
    p = pages.find((i) => i.path === path);
  }
  const { scripts, styles } = p;
  execScript("demo" + scripts[1], global2);
  execScript("demo" + scripts[0], global2);
  const page = getCurrentPage();
  const c = global2.modules["demo" + scripts[1]].default;
  let link = document.createElement("link");
  link.setAttribute("href", "/demo" + styles[0]);
  link.setAttribute("rel", "stylesheet");
  document.body.appendChild(link);
  render(h2(c, { data: page.data }), document.body);
}

// master/index.js
self.send = function send2(message) {
  postMessage(JSON.parse(JSON.stringify(message)));
};
var document2 = self.document = workerdom();
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
    target.dispatchEvent(event);
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
}).observe(document2, { subtree: true });
addEventListener("message", ({ data }) => {
  switch (data.type) {
    case "init":
      init(data.location);
      break;
    case "event":
      handleEvent(data.event);
      break;
    case "wxcallback":
      handleWxEvent(data);
      break;
  }
});
