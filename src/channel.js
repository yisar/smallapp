function channel (callback) {
  var postToMain = null
  var postToWorker = null
  var mainQueue = []
  var workerQueue = []
  var messageHandlers = {}

  function connectMain (postMessage) {
    postToWorker = postMessage

    if (typeof callback === 'function') {
      callback('main')
    }

    while (workerQueue.length) {
      postToWorker(workerQueue.shift())
    }

    workerQueue = null
  }

  function connectWorker (postMessage) {
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

    if (messageHandler != null) {
      messageHandler(data)
    }
  }

  function on (type, messageHandler) {
    messageHandlers[type] = messageHandler
  }

  return { connectMain, connectWorker, handleMessage, postMessageToMain, postMessageToWorker, on }
}
