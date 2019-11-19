(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.voe = {}));
}(this, (function (exports) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var TEXT = 3;
    var handlerMap = {};
    var tagMap = new Map([
        ['view', 'div'],
        ['text', 'span'],
        ['icon', 'i'],
        ['button', 'button'],
        ['image', 'img'],
        ['navigator', 'a'],
    ]);
    function h(tag, attrs) {
        var props = attrs || {};
        var key = props.key || null;
        var children = [];
        Object.keys(props).forEach(function (k, i) {
            var e = props[k];
            handlerMap[i] = e;
            props[k] = i;
        });
        for (var i = 2; i < arguments.length; i++) {
            var vnode = arguments[i];
            if (vnode == null || vnode === true || vnode === false) ;
            else if (typeof vnode === 'string' || typeof vnode === 'number') {
                children.push({ tag: vnode + '', type: TEXT });
            }
            else {
                children.push(vnode);
            }
        }
        var newTag = tagMap.get(tag);
        return {
            tag: typeof tag === 'function' ? tag(props) : tag,
            props: props,
            children: children,
            key: key,
        };
    }
    //# sourceMappingURL=h.js.map

    function updateElement(dom, oldProps, newProps) {
        Object.keys(newProps)
            .filter(function () { })
            .forEach(function (name) {
            updateProperty(dom, name, oldProps[name], newProps[name], false);
        });
    }
    function updateProperty(dom, name, oldValue, newValue, isSvg) {
        if (name === 'key' || oldValue === newValue) ;
        else if (name === 'style') {
            for (var k in __assign(__assign({}, oldValue), newValue)) {
                oldValue = newValue == null || newValue[k] == null ? '' : newValue[k];
                dom[name][k] = oldValue;
            }
        }
        else if (name[0] === 'o' && name[1] === 'n') {
            name = name.slice(2).toLowerCase();
            var newHandler = function (event) {
                var type = event.type, x = event.x, y = event.y, clientX = event.clientX, clientY = event.clientY, offsetX = event.offsetX, offsetY = event.offsetY, pageX = event.pageX, pageY = event.pageY;
                worker.postMessage({
                    type: EVENT,
                    id: newValue,
                    data: {
                        type: type,
                        x: x,
                        y: y,
                        clientX: clientX,
                        clientY: clientY,
                        offsetX: offsetX,
                        offsetY: offsetY,
                        pageX: pageX,
                        pageY: pageY,
                    },
                });
            };
            dom.addEventListener(name, newHandler);
        }
        else if (name in dom && !isSvg) {
            dom[name] = newValue == null ? '' : newValue;
        }
        else if (newValue == null || newValue === false) ;
        else {
            dom.setAttribute(name, newValue);
        }
    }
    function createElement(vnode) {
        var dom = vnode.type === TEXT
            ? document.createTextNode(vnode.tag)
            : document.createElement(vnode.tag);
        elementMap.push(dom);
        if (vnode.children) {
            for (var i = 0; i < vnode.children.length; i++) {
                dom.appendChild(createElement(vnode.children[i]));
            }
        }
        for (var name in vnode.props) {
            updateProperty(dom, name, null, vnode.props[name], false);
        }
        return dom;
    }
    //# sourceMappingURL=dom.js.map

    var elementMap = [];
    var worker = null;
    var isNum = function (x) { return typeof x === 'number'; };
    function masochism() {
        var PATHNAME = (function () {
            var scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1].src;
        })();
        elementMap.push(document.body);
        worker = new Worker(PATHNAME);
        worker.onmessage = function (e) {
            var _a;
            var _b = e.data, type = _b.type, data = _b.data, name = _b.name, prams = _b.prams;
            if (type === COMMIT) {
                for (var index in data) {
                    commit(data[index]);
                }
            }
            if (type === WEB_API) {
                (_a = window[name[0]])[name[1]].apply(_a, prams);
            }
        };
    }
    function commit(op) {
        if (op.length === 3) {
            isNum(op[1])
                ? getElement(op[0]).insertBefore(getElement(op[2]) || createElement(op[2]), getElement(op[1]))
                : updateElement(getElement(op[0]), op[1], op[2]);
        }
        else {
            isNum(op[1])
                ? getElement(op[0]).removeChild(op[1])
                : (getElement(op[0]).nodeValue = op[1]);
        }
    }
    var getElement = function (index) { return elementMap[index] || null; };
    //# sourceMappingURL=slave.js.map

    var _a;
    var MAIN = typeof window !== 'undefined';
    var activeEffectStack = [];
    var commitQueue = {};
    var targetMap = new WeakMap();
    var COMMIT = (_a = [1, 2, 3], _a[0]), EVENT = _a[1], WEB_API = _a[2];
    function render(instance) {
        MAIN ? masochism() : sadism(instance);
    }
    function sadism(instance) {
        instance.update = effect(function () {
            var oldVnode = instance.subTree || null;
            var newVnode = (instance.subTree = instance.tag(instance.props));
            var index = 0;
            var commit = diff(0, index, oldVnode, newVnode);
            self.postMessage({
                type: COMMIT,
                data: commit,
            }, null);
        });
        instance.update();
        self.onmessage = function (e) {
            var _a = e.data, type = _a.type, data = _a.data, id = _a.id;
            if (type === EVENT) {
                var fn = handlerMap[id];
                fn && fn(data);
            }
        };
        self.localStorage = {
            getItem: function (key) {
                callMethod(['localStorage', 'getItem'], [key]);
            },
            setItem: function (key, val) {
                callMethod(['localStorage', 'setItem'], [key, val]);
            },
        };
    }
    function diff(parent, index, oldVnode, newVnode) {
        if (oldVnode === newVnode) ;
        else if (oldVnode != null &&
            oldVnode.type === TEXT &&
            newVnode.type === TEXT) {
            if (oldVnode.tag !== newVnode.tag) {
                commitQueue[index] = [index + 1, newVnode.tag];
            }
        }
        else if (oldVnode == null || oldVnode.tag !== newVnode.tag) {
            commitQueue[index] = [parent, index - 1, newVnode];
            if (oldVnode != null) {
                commitQueue[index] = [parent, index];
            }
        }
        else {
            var oldChildren = oldVnode.children;
            var children = newVnode.children;
            commitQueue[index] = [index, oldVnode.props, newVnode.props];
            if (children) {
                for (var i = 0; i < children.length; i++) {
                    diff(parent, ++index + i, oldChildren[i], children[i]);
                }
            }
        }
        return commitQueue;
    }
    function effect(fn) {
        var effect = function effect() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return run(effect, fn, args);
        };
        return effect;
    }
    function run(effect, fn, args) {
        if (activeEffectStack.indexOf(effect) === -1) {
            try {
                activeEffectStack.push(effect);
                return fn.apply(void 0, args);
            }
            finally {
                activeEffectStack.pop();
            }
        }
    }
    function trigger(target, key) {
        var deps = targetMap.get(target);
        var effects = new Set();
        deps.get(key).forEach(function (e) { return effects.add(e); });
        effects.forEach(function (e) { return e(); });
    }
    function track(target, key) {
        var effect = activeEffectStack[activeEffectStack.length - 1];
        if (effect) {
            var depsMap = targetMap.get(target);
            if (!depsMap) {
                targetMap.set(target, (depsMap = new Map()));
            }
            var dep = depsMap.get(key);
            if (!dep) {
                depsMap.set(key, (dep = new Set()));
            }
            if (!dep.has(effect)) {
                dep.add(effect);
            }
        }
    }
    function callMethod(name, prams) {
        self.postMessage({
            type: WEB_API,
            name: name,
            prams: prams,
        }, null);
    }

    var toProxy = new WeakMap();
    var toRaw = new WeakMap();
    var isObj = function (obj) { return typeof obj === 'object'; };
    function reactive(target) {
        if (!isObj(target))
            return target;
        var proxy = toProxy.get(target);
        if (proxy)
            return proxy;
        if (toRaw.has(target))
            return target;
        var handlers = {
            get: function (target, key, receiver) {
                var newValue = target[key];
                if (isObj(newValue)) {
                    return reactive(newValue);
                }
                var res = Reflect.get(target, key, receiver);
                track(target, key);
                return res;
            },
            set: function (target, key, value, receiver) {
                var res = Reflect.set(target, key, value, receiver);
                if (key in target)
                    trigger(target, key);
                return res;
            },
            deleteProperty: function (target, key, receiver) {
                return Reflect.defineProperty(target, key, receiver);
            }
        };
        var observed = new Proxy(target, handlers);
        toProxy.set(target, observed);
        toRaw.set(observed, target);
        if (!targetMap.has(target)) {
            targetMap.set(target, new Map());
        }
        return observed;
    }
    //# sourceMappingURL=reactivity.js.map

    exports.h = h;
    exports.reactive = reactive;
    exports.render = render;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
