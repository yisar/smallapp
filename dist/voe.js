(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.voe = {}));
}(this, (function (exports) { 'use strict';

  // const PATHNAME = (function () {
  //   const scripts = document.getElementsByTagName('script');
  //   return scripts[scripts.length - 1].src
  // })();

  function app (config) {
    const worker = new Worker('http://localhost:1234/demo.e31bb0bc.js');

    worker.postMessage({ data: 111 });

    worker.onmessage = function (event) {
      console.log('接受' + event.data);
    };

  }

  self.addEventListener(
    'message',
    e=> {
      console.log(e.data)
      if(e.data.cmd==='stop'){
        self.postMessage(222)
      }
    },
    false
  )

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
  exports.reactive = reactive;

})));
//# sourceMappingURL=voe.js.map
