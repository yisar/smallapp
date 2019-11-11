(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.voe = {}));
}(this, (function (exports) { 'use strict';

  function sadism (config) {
    function perform (e) {
      // console.log(e.data)
    }
    self.onmessage = perform;
  }

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

  let handlers = [];

  function updateProperty (dom, name, oldValue, newValue) {
    if (name === 'key') ; else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase();
      if (oldValue) dom.removeEventListener(name, oldValue);
      dom.addEventListener(name, newValue);
      dom.setAttribute(`data-${name}`,handlers.length);
      handlers.push(newValue);
    }
  }

  function createElement (vnode) {
    let dom = vnode.tag === TEXT ? document.createTextNode(vnode.type) : document.createElement(vnode.type);
    if (vnode.children) {
      for (let i = 0; i < vnode.children.length; i++) {
        dom.appendChild(createElement(vnode.children[i]));
      }
    }
    for (var name in vnode.props) {
      updateProperty(dom, name, null, vnode.props[name]);
    }
    return dom
  }

  let activeEffectStack = [];

  function effect (fn) {
    const effect = createReactiveEffect(fn);
    return effect
  }

  function createReactiveEffect (fn) {
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

  function app (instance) {
    if (MAIN) {
      let mounted = false;
      instance.render = instance.setup();

      instance.update = effect(function componentEffects () {
        if (!mounted) {
          document.body.appendChild(createElement(instance.render()));
          mounted = true;
        } else {
          const oldVnode = instance.subTree || null;
          const newVnode = (instance.subTree = instance.render());
          document.body.innerHTML = '';
          document.body.appendChild(createElement(newVnode));
        }
      });

      instance.update();
    } else {
      sadism();
    }
  }
  function trigger (target, key) {
    let deps = targetMap.get(target);
    const effects = new Set();

    deps.get(key).forEach(e => effects.add(e));

    effects.forEach(e => e());

    const worker = new Worker(PATHNAME);
    worker.postMessage(0);
  }

  function track (target, key) {
    console.log(target,key);
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

  const MAIN = typeof window !== 'undefined';
  const PATHNAME =
    MAIN &&
    (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1].src
    })();

  exports.app = app;
  exports.h = h;
  exports.reactive = reactive;

})));
//# sourceMappingURL=voe.js.map
