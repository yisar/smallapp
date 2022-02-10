const EVENT_BLACKLIST = 'mousewheel wheel animationstart animationiteration animationend devicemotion deviceorientation deviceorientationabsolute'.split(' ');


const EVENT_OPTS = {
    capture: true,
    passive: true
};


export default ({ worker }) => {
    const NODES = new Map();

    /** Returns the real DOM Element corresponding to a serialized Element object. */
    function getNode(node) {
        if (!node) return null;
        if (node.nodeName === 'BODY') return document.body;
        return NODES.get(node.__id);
    }


    // feature-detect support for event listener options
    let supportsPassive = false;
    try {
        addEventListener('test', null, {
            get passive() { supportsPassive = true; }
        });
    } catch (e) { }


    /** Loop over all "on*" event names on Window and set up a proxy handler for each. */
    // eslint-disable-next-line guard-for-in
    for (let i in window) {
        let m = i.substring(2);
        if (i.substring(0, 2) === 'on' && i === i.toLowerCase() && EVENT_BLACKLIST.indexOf(m) < 0 && (window[i] === null || typeof window[i] === 'function')) {
            addEventListener(m, proxyEvent, supportsPassive ? EVENT_OPTS : true);
        }
    }


    let touch;

    /** Derives {pageX,pageY} coordinates from a mouse or touch event. */
    function getTouch(e) {
        let t = (e.changedTouches && e.changedTouches[0]) || (e.touches && e.touches[0]) || e;
        return t && { pageX: t.pageX, pageY: t.pageY };
    }

    /** Forward a DOM Event into the Worker as a message */
    function proxyEvent(e) {
        if (e.type === 'click' && touch) return false;

        let event = { type: e.type };
        if (e.target) event.target = e.target.__id;
        // eslint-disable-next-line guard-for-in
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


    /** Apply MutationRecord mutations, keyed by type. */
    const MUTATIONS = {
        /** Handles element insertion & deletion */
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
        /** Handles attribute addition, change, removal */
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
        /** Handles Text node content changes */
        characterData({ target, oldValue }) {
            getNode(target).nodeValue = target.data;
        }
    };


    /** Apply a MutationRecord to the DOM */
    function applyMutation(mutation) {
        MUTATIONS[mutation.type](mutation);
    }

    let timer;

    // stores pending DOM changes (MutationRecord objects)
    let MUTATION_QUEUE = [];

    // Check if an Element is at least partially visible
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


    // requestIdleCallback sortof-polyfill
    if (!self.requestIdleCallback) {
        const IDLE_TIMEOUT = 10;
        self.requestIdleCallback = cb => {
            let start = Date.now();
            setTimeout(() => cb({
                timeRemaining: () => Math.max(0, IDLE_TIMEOUT - (Date.now() - start))
            }), 1);
        };
    }


    // Attempt to flush & process as many MutationRecords as possible from the queue
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

            // if the element is offscreen, skip any text or attribute changes:
            if (useVis && (m.type === 'characterData' || m.type === 'attributes')) {
                let target = getNode(m.target);
                if (target && !isElementInViewport(target, cache)) continue;
            }

            // remove mutation from the queue and apply it:
            applyMutation(q.splice(i--, 1)[0]);
        }

        // still remaining work to be done
        if (q.length) doProcessMutationQueue();
    }


    function doProcessMutationQueue() {
        // requestAnimationFrame(processMutationQueue);
        clearTimeout(timer);
        timer = setTimeout(processMutationQueue, 100);
        requestIdleCallback(processMutationQueue);
    }


    // Add a MutationRecord to the queue
    function queueMutation(mutation) {
        // for single-node updates, merge into pending updates
        if (mutation.type === 'characterData' || mutation.type === 'attributes') {
            for (let i = MUTATION_QUEUE.length; i--;) {
                let m = MUTATION_QUEUE[i];
                // eslint-disable-next-line eqeqeq
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
        }
    };


    worker.postMessage({
        type: 'init',
        location: location.href
    });
};