let postToMain = null
let postToWorker = null
let mainQueue = []
let workerQueue = []
let messageHandlers = {}

function connectMain (postMessage, callback) {
  postToWorker = postMessage

  if (typeof callback === 'function') {
    callback('main')
  }

  while (workerQueue.length) {
    postToWorker(workerQueue.shift())
  }

  workerQueue = null
}

function connectWorker (postMessage, callback) {
  postToMain = postMessage

  if (typeof callback === 'function') {
    callback('worker')
  }

  while (mainQueue.length) {
    postToMain(mainQueue.shift())
  }

  mainQueue = null
}

function postMessageToMain (message) {
  if (typeof postToMain === 'function') {
    return postToMain(message)
  }

  mainQueue.push(message)
}

function postMessageToWorker (message) {
  if (typeof postToWorker === 'function') {
    return postToWorker(message)
  }

  workerQueue.push(message)
}

function handleMessage (type, data) {
  var messageHandler = messageHandlers[type]

  if (messageHandler) {
    messageHandler(data)
  }
}

function on (type, messageHandler) {
  messageHandlers[type] = messageHandler
}

export default { connectMain, connectWorker, postMessageToMain, postMessageToWorker, handleMessage, on }
