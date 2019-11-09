let postToMain = null
let postToWorker = null
let mainQueue = []
let workerQueue = []
let messageHandlers = {}

export function connectMain (postMessage, callback) {
  postToWorker = postMessage

  if (typeof callback === 'function') {
    callback('main')
  }

  while (workerQueue.length) {
    postToWorker(workerQueue.shift())
  }

  workerQueue = null
}

export function connectWorker (postMessage, callback) {
  postToMain = postMessage

  if (typeof callback === 'function') {
    callback('worker')
  }

  while (mainQueue.length) {
    postToMain(mainQueue.shift())
  }

  mainQueue = null
}

export function postMessageToMain (message) {
  if (typeof postToMain === 'function') {
    return postToMain(message)
  }

  mainQueue.push(message)
}

export function postMessageToWorker (message) {
  if (typeof postToWorker === 'function') {
    return postToWorker(message)
  }

  workerQueue.push(message)
}

export function handleMessage (type, data) {
  var messageHandler = messageHandlers[type]

  if (messageHandler) {
    messageHandler(data)
  }
}

export function on (type, messageHandler) {
  messageHandlers[type] = messageHandler
}
