import workerdom from './worker-dom.js';
import { handleWxEvent } from './wxapi'
import {init} from './init'

self.send = function send(message) {
    postMessage(JSON.parse(JSON.stringify(message)));
}

let document = self.document = workerdom();
for (let i in document.defaultView) if (document.defaultView.hasOwnProperty(i)) {
    self[i] = document.defaultView[i];
}

let COUNTER = 0;

const TO_SANITIZE = ['addedNodes', 'removedNodes', 'nextSibling', 'previousSibling', 'target'];

const PROP_BLACKLIST = ['children', 'parentNode', '__handlers', '_component', '_componentConstructor'];

const NODES = new Map();

function getNode(node) {
    let id;
    if (node && typeof node === 'object') id = node.__id;
    if (typeof node === 'string') id = node;
    if (!id) return null;
    if (node.nodeName === 'BODY') return document.body;
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
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) return obj.map(sanitize);

    if (obj instanceof document.defaultView.Node) {
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


(new MutationObserver(mutations => {
    for (let i = mutations.length; i--;) {
        let mutation = mutations[i];
        for (let j = TO_SANITIZE.length; j--;) {
            let prop = TO_SANITIZE[j];
            mutation[prop] = sanitize(mutation[prop]);
        }
    }
    send({ type: 'MutationRecord', mutations });
})).observe(document, { subtree: true });


addEventListener('message', ({ data }) => {
    switch (data.type) {
        case 'init':
            init(data.location)
            break;
        case 'event':
            handleEvent(data.event);
            break;
        case 'wxcallback':
            handleWxEvent(data)
            break;
    }
});