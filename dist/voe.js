(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.voe = {}));
}(this, (function (exports) { 'use strict';

  const TEXT = 3;

  function h (type, attrs) {
    let props = attrs || {};
    let key = props.key || null;
    let children = [];

    for (let i = 2; i < arguments.length; i++) {
      let vnode = arguments[i];
      if (vnode == null || vnode === true || vnode === false) ; else if (typeof vnode === 'string' || typeof vnode === 'number') {
        children.push({ type: vnode, tag: TEXT });
      } else {
        children.push(vnode);
      }
    }

    delete props.key;
    return { type, props, children, key }
  }

  function masochism (worker, config) {
    worker.postMessage(0);
    function patch (e) {
      let patches = e.data;
      for (const i in patches) {
        let op = patches[i];
        if (op.length === 1) {
          document.body.appendChild(createElement(op[0]));
        }
      }
    }
    worker.onmessage = patch;
  }

  function createElement (vnode) {
    let dom = vnode.tag === TEXT ? document.createTextNode(vnode.type) : document.createElement(vnode.type);
    if (vnode.children) {
      for (let i = 0; i < vnode.children.length; i++) {
        dom.appendChild(createElement(vnode.children[i]));
      }
    }
    return dom
  }

  function sadism (config) {
    function perform (e) {
      const setup = config.setup;
      let rootVnode = setup();
      let patches = diff(null, rootVnode);
      self.postMessage(patches);
    }
    self.onmessage = perform;
  }

  let patches = {};
  let index = 0;

  function diff (oldVnode, newVnode) {
    if (oldVnode === newVnode) ; else if (oldVnode == null || oldVnode.type !== newVnode.type) {
      patches[index++] = [newVnode];
      if (oldVnode != null) {
        patches[index++] = [oldVnode, index];
      }
    }
    return patches
  }

  const MAIN = typeof window !== 'undefined';
  const PATHNAME =
    MAIN &&
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1].src
    })();

  function app (config) {
    if (MAIN) {
      const worker = new Worker(PATHNAME);
      masochism(worker);
    } else {
      sadism(config);
    }
  }

  const toProxy = new WeakMap();
  const toRaw = new WeakMap();
  const isObj = obj => typeof obj === 'object';

  function trigger () {
    console.log('update');
  }

  function reactive (target) {
    if (!isObj(target)) return target

    let proxy = toProxy.get(target);
    if (proxy) return proxy

    if (toRaw.has(target)) return target

    const handlers = {
      get (target, key, receiver) {
        let res = Reflect.get(target, key, receiver);
        if (isObj(target[key])) {
          return reactive(res)
        }
        return res
      },
      set (target, key, value, receiver) {
        if (key in target) {
          trigger();
        }
        return Reflect.set(target, key, value, receiver)
      },
      deleteProperty () {
        return Reflect.defineProperty(target, key)
      }
    };

    let observed = new Proxy(target, handlers);

    toProxy.set(target, observed);
    toRaw.set(observed, target);
    
    return observed
  }

  exports.app = app;
  exports.h = h;
  exports.reactive = reactive;

})));
//# sourceMappingURL=voe.js.map
