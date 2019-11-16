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

  function updateProperty (dom, name, oldValue, newValue) {
    if (name === 'key') ; else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase();
      let newHandler = event => {
        // 不能传太多，此处省略对事件的简化操作
        worker.postMessage({
          type: EVENT,
          id: newValue
        });
      };
      dom.addEventListener(name, newHandler);
    }
  }

  function createElement (vnode) {
    let dom =
      vnode.type === TEXT
        ? document.createTextNode(vnode.tag)
        : document.createElement(vnode.tag);
    elementMap.push(dom);
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

  const elementMap = [];
  let worker = null;

  function masochism () {
    const PATHNAME = (function () {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1].src
    })();
    elementMap.push(document.body);

    worker = new Worker(PATHNAME);
    worker.onmessage = e => {
      const commitQueue = e.data;
      commitQueue.forEach(commit);
    };
  }

  function commit (op) {
    getElement(op[0]).innerHTML = '';
    elementMap.length = 1;

    if (op.length === 4) {
      updateProperty(op[1], op[2], op[3]);
    } else if (op.length === 3) {
      getElement(op[0]).insertBefore(
        getElement(op[2]) || createElement(op[2]),
        getElement(op[1])
      );
    } else {
      getElement(op[0]).removeChild(getElement(op[1]));
    }
  }

  const getElement = index => elementMap[index];

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
      let commit = diff(0, null, oldVnode, newVnode);
      self.postMessage(commit);
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

  function diff (parent, node, oldVnode, newVnode) {
    const commitQueue = [];
    if (oldVnode === newVnode) ; else if (!oldVnode || oldVnode.type !== newVnode.type) {
      commitQueue.push([parent, node, newVnode]);
      if (oldVnode != null) {
        commitQueue.push([parent, node]);
      }
    } else {
      commitQueue.push([null, node, oldVnode.props, newVnode.props]);
      let oldKeyed = {};
      let newKeyed = {};
      let oldElements = [];
      let oldChildren = oldVnode.children;
      let children = newVnode.children;

      for (let i = 0; i < oldChildren.length; i++) {
        oldElements[i] = [node, i];
        let oldKey = getKey(oldChildren[i]);
        if (oldKey != null) {
          oldKeyed[oldKey] = [oldElements[i], oldChildren[i]];
        }
      }

      let i = 0;
      let j = 0;

      while (j < children.length) {
        let oldKey = getKey(oldChildren[i]);
        let newKey = getKey(children[i]);
        if (newKeyed[oldKey]) {
          i++;
          commitQueue.push([]);
          continue
        }

        if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
          if (oldKey == null) {
            commitQueue.push([element, oldElements[i]]);
          }
          i++;
          continue
        }

        if (newKey == null) {
          if (oldKey == null) {
            diff(node, oldElements[i], oldChildren[i], children[k]);
            k++;
          }
          i++;
        } else {
          let keyed = oldKeyed[newKey] || [];
          if (oldKey === newKey) {
            diff(node, keyed[0], keyed[1], children[k]);
            i++;
          } else {
            diff(node, oldElements[i], null, children[k]);
            newKeyed[newKey] = children[k];
            k++;
          }
        }
      }

      while (i < oldChildren.length) {
        if (getKey(oldChildren[i]) == null) {
          commitQueue.push(node, oldElements[i]);
        }
        i++;
      }

      for (let i in oldKeyed) {
        if (!newKeyed[i]) {
          commitQueue.push(node, oldKeyed[i][0]);
        }
      }
    }
    return commitQueue
  }

  const getKey = node => (node ? node.key : null);

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
