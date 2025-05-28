import fakedom from './dom/fake-dom.js'
// import './dom/proxy-dom.js'
import { handleWxEvent } from './wxapi'
import { init } from './init'

try {
  console.log(window)
} catch (error) {
  var window = { isAndroid: false }
}

self.send = function send(message) {
  try {
    if (window.isAndroid) {
      AndroidJSViewBridge.postMessage(JSON.stringify(message))
    }
  } catch (error) {
    postMessage(JSON.stringify(message))
  }
}

self.document = fakedom()
globalThis.document = self.document

for (let i in document.defaultView) if (document.defaultView.hasOwnProperty(i)) {
  self[i] = document.defaultView[i]
}

let COUNTER = 0

const TO_SANITIZE = ['addedNodes', 'removedNodes', 'nextSibling', 'previousSibling', 'target']

const PROP_BLACKLIST = ['children', 'parentNode', '__handlers', '_component', '_componentConstructor']

const NODES = new Map()

function getNode(node) {
  let id
  if (node && typeof node === 'object') id = node.__id
  if (typeof node === 'string') id = node
  if (!id) return null
  if (node.nodeName === 'BODY') return document.body
  return NODES.get(id)
}

function handleEvent(event) {
  let target = getNode(event.target)
  if (target) {
    event.target = target
    event.bubbles = true
    target.dispatchEvent && target.dispatchEvent(event)
  }
}

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj

  if (Array.isArray(obj)) return obj.map(sanitize)

  if (obj instanceof document.defaultView.Node) {
    let id = obj.__id
    if (!id) {
      id = obj.__id = String(++COUNTER)
    }
    NODES.set(id, obj)
  }

  let out = {}
  for (let i in obj) {
    if (obj.hasOwnProperty(i) && PROP_BLACKLIST.indexOf(i) < 0) {
      out[i] = obj[i]
    }
  }
  if (out.childNodes && out.childNodes.length) {
    out.childNodes = sanitize(out.childNodes)
  }
  return out
}

(new MutationObserver(mutations => {
  for (let i = mutations.length; i--;) {
    let mutation = mutations[i]
    for (let j = TO_SANITIZE.length; j--;) {
      let prop = TO_SANITIZE[j]
      mutation[prop] = sanitize(mutation[prop])
    }
  }
  send({ type: 'MutationRecord', mutations })
})).observe(document, { subtree: true, childList: true })

function _message(data) {
  if (typeof data === "string") {
    data = JSON.parse(data)
  }
  switch (data.type) {
    case "init":
      init(data.manifest ? data.manifest : window.manifest)
      break
    case "event":
      handleEvent(data.event)
      break
    case "wxcallback":
      handleWxEvent(data.payload)
      break
  }
}

try {
  if (window.isAndroid) {
    AndroidJSViewBridge.onmessage = function (data) {
      _message(data)
    }
  }
} catch (error) {
  addEventListener("message", ({ data }) => {
    _message(data)
  })
}
