(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.voe = {}));
}(this, (function (exports) { 'use strict';

  const toProxy = new WeakMap();
  const toRaw = new WeakMap();
  const targetMap = new WeakMap();
  const isObj = obj => typeof obj === 'object';

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
        track(target, key);
        return res
      },
      set (target, key, value, receiver) {
        let res = Reflect.set(target, key, value, receiver);
        if (key in target) {
          trigger(target, key);
        }
        return res
      },
      deleteProperty () {
        return Reflect.defineProperty(target, key)
      }
    };

    let observed = new Proxy(target, handlers);

    toProxy.set(target, observed);
    toRaw.set(observed, target);

    if (!targetMap.has(target)) {
      targetMap.set(target, new Map());
    }

    return observed
  }

  const TEXT = 3;

  let handlerMap = [];

  function h (tag, attrs) {
    let props = attrs || {};
    let key = props.key || null;
    let children = [];

    for (const k in props) {
      if (k[0] === 'o' && k[1] === 'n') {
        let e = props[k];
        handlerMap.push(e);
        props[k] = handlerMap.length;
      }
    }

    for (let i = 2; i < arguments.length; i++) {
      let vnode = arguments[i];
      if (vnode == null || vnode === true || vnode === false) ; else if (typeof vnode === 'string' || typeof vnode === 'number') {
        children.push({ tag: vnode, type: TEXT });
      } else {
        children.push(vnode);
      }
    }

    delete props.key;
    return { tag, props, children, key }
  }

  const EVENT = 1;

  function updateProperty (dom, name, oldValue, newValue, worker) {
    if (name === 'key') ; else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase();
      let newHandler = (event) => {
        // 不能传太多，此处省略对事件的简化操作
        worker.postMessage({
          type: EVENT,
          id: newValue
        });
      };
      dom.addEventListener(name, newHandler);
    }
  }

  function createElement (vnode, worker) {
    let dom = vnode.type === TEXT ? document.createTextNode(vnode.tag) : document.createElement(vnode.tag);
    if (vnode.children) {
      for (let i = 0; i < vnode.children.length; i++) {
        dom.appendChild(createElement(vnode.children[i]));
      }
    }
    for (var name in vnode.props) {
      updateProperty(dom, name, null, vnode.props[name], worker);
    }
    return dom
  }

  function masochism () {
    const PATHNAME = (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1].src
    })();

    const worker = new Worker(PATHNAME);
    worker.onmessage = e => {
      const newVnode = e.data;
      document.body.innerHTML = '';
      document.body.appendChild(createElement(newVnode, worker));
    };
  }

  const MAIN = typeof window !== 'undefined';
  const activeEffectStack = [];

  function app (instance) {
    instance.render = instance.setup();
    MAIN ? masochism() : sadism(instance);
  }

  function sadism (instance) {
    instance.update = effect(function componentEffects () {
      const oldVnode = instance.subTree || null;
      const newVnode = (instance.subTree = instance.render());
      // diff and patch
      self.postMessage(newVnode);
    });
    instance.update();
    self.addEventListener('message', e => {
      const { type, id } = e.data;
      if (type === EVENT) {
        const fn = handlerMap[id - 1];
        fn && fn();
        instance.update();
      }
    });
  }

  function effect (fn) {
    const effect = function effect (...args) {
      return run(effect, fn, args)
    };
    return effect
  }

  function run (effect, fn, args) {
    if (activeEffectStack.indexOf(effect) === -1) {
      try {
        activeEffectStack.push(effect);
        return fn(...args)
      } finally {
        activeEffectStack.pop();
      }
    }
  }

  function trigger (target, key) {
    let deps = targetMap.get(target);
    const effects = new Set();

    deps.get(key).forEach(e => effects.add(e));

    effects.forEach(e => e());
  }

  function track (target, key) {
    const effect = activeEffectStack[activeEffectStack.length - 1];
    if (effect) {
      let depsMap = targetMap.get(target);
      if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()));
      }
      let dep = depsMap.get(key);
      if (!dep) {
        depsMap.set(key, (dep = new Set()));
      }
      if (!dep.has(effect)) {
        dep.add(effect);
      }
    }
  }

  exports.app = app;
  exports.h = h;
  exports.reactive = reactive;

})));
//# sourceMappingURL=voe.js.map
