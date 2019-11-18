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
        let newValue = target[key];

        if (isObj(newValue)) {
          return reactive(res)
        }
        let res = Reflect.get(target, key, receiver);
        track(target, key);
        return res
      },
      set (target, key, value, receiver) {
        let res = Reflect.set(target, key, value, receiver);
        if (key in target) trigger(target, key);
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
    return {
      tag: typeof tag === 'function' ? tag(props) : tag,
      props,
      children,
      key
    }
  }

  const EVENT = 1;

  function updateProperty (dom, name, oldValue, newValue) {
    if (name === 'key') ; else if (name[0] === 'o' && name[1] === 'n') {
      name = name.slice(2).toLowerCase();
      let newHandler = event => {
        const {
          type,
          x,
          y,
          clientX,
          clientY,
          offsetX,
          offsetY,
          pageX,
          pageY
        } = event;
        // 不能传太多，此处省略对事件的简化操作
        worker.postMessage({
          type: EVENT,
          id: newValue,
          event: {
            type,
            x,
            y,
            clientX,
            clientY,
            offsetX,
            offsetY,
            pageX,
            pageY
          }
        });
      };
      dom.addEventListener(name, newHandler);
    }
  }

  function createElement (vnode) {
    switch (vnode.tag) {
      case 'view':
        vnode.tag = 'div';
        break
      case 'text':
        vnode.tag = 'span';
        break
    }
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
      for (const index in commitQueue) {
        commit(commitQueue[index]);
      }
    };
  }

  function commit (op) {
    if (op.length === 4) {
      updateProperty(op[1], op[2], op[3]);
    } else if (op.length === 3) {
      getElement(op[0]).insertBefore(
        getElement(op[2]) || createElement(op[2]),
        getElement(op[1])
      );
    } else {
      getElement(op[0]).nodeValue = op[1];
    }
  }

  const getElement = index => elementMap[index] || null;

  const MAIN = typeof window !== 'undefined';
  const activeEffectStack = [];
  const commitQueue = {};

  function render (instance) {
    MAIN ? masochism() : sadism(instance);
  }

  function sadism (instance) {
    instance.update = effect(() => {
      const oldVnode = instance.subTree || null;
      const newVnode = (instance.subTree = instance.tag(instance.props));
      let index = 0;
      let commit = diff(0, index, oldVnode, newVnode);
      self.postMessage(commit);
    });
    instance.update();
    self.addEventListener('message', e => {
      const { type, id, event } = e.data;
      if (type === EVENT) {
        const fn = handlerMap[id - 1];
        fn && fn(event);
      }
    });
  }

  function diff (parent, index, oldVnode, newVnode) {
    if (oldVnode === newVnode) ; else if (
      oldVnode != null &&
      oldVnode.type === TEXT &&
      newVnode.type === TEXT
    ) {
      if (oldVnode.tag !== newVnode.tag) {
        commitQueue[index] = [index + 1, newVnode.tag];
      }
    } else if (oldVnode == null || oldVnode.tag !== newVnode.tag) {
      commitQueue[index] = [parent, index - 1, newVnode];
    } else {
      let oldChildren = oldVnode.children;
      let children = newVnode.children;
      commitQueue[index] = [null, index, oldVnode.props, newVnode.props];
      if (children) {
        for (let i = 0; i < children.length; i++) {
          diff(parent, ++index + i, oldChildren[i], children[i]);
        }
      }
    }
    return commitQueue
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

  exports.h = h;
  exports.reactive = reactive;
  exports.render = render;

})));
//# sourceMappingURL=voe.js.map
