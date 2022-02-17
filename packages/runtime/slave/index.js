const EVENT_BLACKLIST = 'mousewheel wheel animationstart animationiteration animationend devicemotion deviceorientation deviceorientationabsolute'.split(' ');


const EVENT_OPTS = {
    capture: true,
    passive: true
};


function workerdom({ worker }) {
    const NODES = new Map();

    function getNode(node) {
        if (!node) return null;
        if (node.nodeName === 'BODY') return document.body;
        return NODES.get(node.__id);
    }

    let supportsPassive = false;
    try {
        addEventListener('test', null, {
            get passive() { supportsPassive = true; }
        });
    } catch (e) { }



    for (let i in window) {
        let m = i.substring(2);
        if (i.substring(0, 2) === 'on' && i === i.toLowerCase() && EVENT_BLACKLIST.indexOf(m) < 0 && (window[i] === null || typeof window[i] === 'function')) {
            addEventListener(m, proxyEvent, supportsPassive ? EVENT_OPTS : true);
        }
    }


    let touch;

    function getTouch(e) {
        let t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]) || e;
        return t && { pageX: t.pageX, pageY: t.pageY };
    }

    function proxyEvent(e) {
        if (e.type === 'click' && touch) return false;

        let event = { type: e.type };
        if (e.target) {
            event.target = e.target.__id;
        }
        event.detail = {
            value: e.target.value,
            checked: e.target.checked,
        }
        event.dataset = {}
        for (let d in e.target.dataset) {
            event.dataset[d] = e.target.dataset[d]
        }
        for (let i in e) {
            let v = e[i];
            if (typeof v !== 'object' && typeof v !== 'function' && i !== i.toUpperCase() && !event.hasOwnProperty(i)) {
                event[i] = v;
            }
        }
        worker.postMessage({
            type: 'event',
            event
        });

        if (e.type === 'touchstart') {
            touch = getTouch(e);
        }
        else if (e.type === 'touchend' && touch) {
            let t = getTouch(e);
            if (t) {
                let delta = Math.sqrt(Math.pow(t.pageX - touch.pageX, 2) + Math.pow(t.pageY - touch.pageY, 2));
                if (delta < 10) {
                    event.type = 'click';
                    worker.postMessage({ type: 'event', event });
                }
            }
        }
    }


    function createNode(skel) {
        let node;
        if (skel.nodeType === 3) {
            node = document.createTextNode(skel.data);
        }
        else if (skel.nodeType === 1) {
            node = document.createElement(skel.nodeName);
            if (skel.className) {
                node.className = skel.className;
            }
            if (skel.style) {
                for (let i in skel.style) if (skel.style.hasOwnProperty(i)) {
                    node.style[i] = skel.style[i];
                }
            }
            if (skel.attributes) {
                for (let i = 0; i < skel.attributes.length; i++) {
                    let a = skel.attributes[i];
                    // @TODO .ns
                    node.setAttribute(a.name, a.value);
                }
            }
            if (skel.childNodes) {
                for (let i = 0; i < skel.childNodes.length; i++) {
                    node.appendChild(createNode(skel.childNodes[i]));
                }
            }
        }
        node.__id = skel.__id;
        NODES.set(skel.__id, node);
        return node;
    }


    const MUTATIONS = {
        childList({ target, removedNodes, addedNodes, previousSibling, nextSibling }) {
            let parent = getNode(target);
            if (removedNodes) {
                for (let i = removedNodes.length; i--;) {
                    parent.removeChild(getNode(removedNodes[i]));
                }
            }
            if (addedNodes) {
                for (let i = 0; i < addedNodes.length; i++) {
                    let newNode = getNode(addedNodes[i]);
                    if (!newNode) {
                        newNode = createNode(addedNodes[i]);
                    }
                    parent.insertBefore(newNode, nextSibling && getNode(nextSibling) || null);
                }
            }
        },
        attributes({ target, attributeName }) {
            let val;
            for (let i = target.attributes.length; i--;) {
                let p = target.attributes[i];
                if (p.name === attributeName) {
                    val = p.value;
                    break;
                }
            }
            getNode(target).setAttribute(attributeName, val);
        },
        characterData({ target, oldValue }) {
            getNode(target).nodeValue = target.data;
        }
    };


    function applyMutation(mutation) {
        MUTATIONS[mutation.type](mutation);
    }

    let timer;

    let MUTATION_QUEUE = [];

    function isElementInViewport(el, cache) {
        if (el.nodeType === 3) el = el.parentNode;
        let bbox = el.getBoundingClientRect();
        return (
            bbox.bottom >= 0 &&
            bbox.right >= 0 &&
            bbox.top <= (cache.height || (cache.height = window.innerHeight)) &&
            bbox.left <= (cache.width || (cache.width = window.innerWidth))
        );
    }


    if (!self.requestIdleCallback) {
        const IDLE_TIMEOUT = 10;
        self.requestIdleCallback = cb => {
            let start = Date.now();
            setTimeout(() => cb({
                timeRemaining: () => Math.max(0, IDLE_TIMEOUT - (Date.now() - start))
            }), 1);
        };
    }


    function processMutationQueue(deadline) {
        clearTimeout(timer);
        let q = MUTATION_QUEUE,
            start = Date.now(),
            isDeadline = deadline && deadline.timeRemaining,
            cache = {},
            useVis = (document.getElementById('#use-vis') || cache).checked,
            i;
        for (i = 0; i < q.length; i++) {
            if (isDeadline ? deadline.timeRemaining() <= 0 : (Date.now() - start) > 1) break;

            let m = q[i];

            if (useVis && (m.type === 'characterData' || m.type === 'attributes')) {
                let target = getNode(m.target);
                if (target && !isElementInViewport(target, cache)) continue;
            }

            applyMutation(q.splice(i--, 1)[0]);
        }

        if (q.length) doProcessMutationQueue();
    }


    function doProcessMutationQueue() {
        clearTimeout(timer);
        timer = setTimeout(processMutationQueue, 100);
        requestIdleCallback(processMutationQueue);
    }


    function queueMutation(mutation) {
        if (mutation.type === 'characterData' || mutation.type === 'attributes') {
            for (let i = MUTATION_QUEUE.length; i--;) {
                let m = MUTATION_QUEUE[i];
                if (m.type == mutation.type && m.target.__id == mutation.target.__id) {
                    if (m.type === 'attributes') {
                        MUTATION_QUEUE.splice(i + 1, 0, mutation);
                    }
                    else {
                        MUTATION_QUEUE[i] = mutation;
                    }
                    return;
                }
            }
        }
        if (MUTATION_QUEUE.push(mutation) === 1) {
            doProcessMutationQueue();
        }
    }


    worker.onmessage = ({ data }) => {
        if (data.type === 'MutationRecord') {
            for (let i = 0; i < data.mutations.length; i++) {
                queueMutation(data.mutations[i]);
            }
        } else if (data.type === 'wxapi') {
            if (typeof window.chrome.webview !== 'undefined') {
                window.chrome.webview.postMessage(data)
            }
        }
    };

    if (typeof window.chrome.webview !== 'undefined') { // 接受来自 webview 的消息
        window.chrome.webview.addEventListener('message', function (id) {
            worker.postMessage({ type: 'wxcallback', id })

        })
    }


    worker.postMessage({
        type: 'init',
        location: {
            pathname: location.pathname,
            href: location.href,
            search: location.search
        }
    });
};

workerdom.umd = true