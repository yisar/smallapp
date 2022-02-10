import { h, render, useEffect, useState, Fragment } from './web_modules/fre-esm.js'
import workerdom from './web_modules/worker-dom.js';
import { execScript } from './web_modules/exec-script.js'

let document = self.document = workerdom();
for (let i in document.defaultView) if (document.defaultView.hasOwnProperty(i)) {
    self[i] = document.defaultView[i];
}

let url = '/';

let location = {
    _current: '/',
    get href() {
        return url;
    },
    get pathname() {
        return url.replace(/^(([a-z0-9]+\:)?\/\/[^/]+|[?#].*$)/g, '');
    },
    get search() {
        return (url.match(/\?([^#]*)(#.*)?$/) || [])[1];
    },
    get hash() {
        return (url.match(/#(.*)$/) || [])[1];
    }
};

let history = {
    pushState(a, b, url) {
        send({ type: 'pushState', url });
    },
    replaceState(a, b, url) {
        send({ type: 'replaceState', url });
    }
};


// used to create UUIDs for Elements
let COUNTER = 0;

/** MutationObserver properties to sanitize as (collections of) DOM Elements */
const TO_SANITIZE = ['addedNodes', 'removedNodes', 'nextSibling', 'previousSibling', 'target'];

/** Properties to strip when serializing for postMessage */
const PROP_BLACKLIST = ['children', 'parentNode', '__handlers', '_component', '_componentConstructor'];

/** Mapping of global IDs to Elements */
const NODES = new Map();


/** Returns the worker DOM Element corresponding to a serialized Element object.
 *	@param {String|Object} node		An `id`, or an object with an `__id` property.
 *	@returns {Element} element
 */
function getNode(node) {
    let id;
    if (node && typeof node === 'object') id = node.__id;
    if (typeof node === 'string') id = node;
    if (!id) return null;
    if (node.nodeName === 'BODY') return document.body;
    return NODES.get(id);
}


/** Receives Event messages and refires them in the worker's DOM. */
function handleEvent(event) {
    let target = getNode(event.target);
    if (target) {
        event.target = target;
        event.bubbles = true;
        target.dispatchEvent(event);
    }
}


/** Normalize messages (MutationRecords mainly)
 *  Replaces previously-sent Elements with their IDs.
 */
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


/** Observe DOM mutations and send MutationRecords to parent page. */
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


/** Send messages to the page */
function send(message) {
    console.log(message)
    postMessage(JSON.parse(JSON.stringify(message)));
}


/** Receive messages from the page */
addEventListener('message', ({ data }) => {
    switch (data.type) {
        case 'init':
            url = data.url;
            break;
        case 'event':
            handleEvent(data.event);
            break;
    }
});

const ref = {
    modules: {},
    global: {
        Page: {},
    },
    fre: {
        h, render, useEffect, useState, Fragment, Text: (props) => {
            return h('span', {}, props.children)
        }
    },
    JSSDK: {
        readFileSync(path) {
            var request = new XMLHttpRequest();
            request.open('GET', path, false);
            request.send(null);
            if (request.status === 200) {
                return request.responseText
            }
        }
    }
}

const manifest = ref.JSSDK.readFileSync('demo/manifest.json')

const scripts = JSON.parse(manifest).pages[1].scripts

console.log(scripts)

// execScript('demo' + scripts[0], ref)
execScript('demo' + scripts[1], ref)

console.log(ref)

const comp = ref.modules['demo' + scripts[1]].default

// execScript(, ref)

render(h(comp, null), document.body)