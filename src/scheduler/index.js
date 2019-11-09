var currentJob = null
var hasPendingFlush = false
var flushStartTimestamp = 0
var frameBudget = 1000 / 60
var getNow = function () {
  return performance.now()
}

var stageQueue = []
var commitQueue = []
var postEffectsQueue = []
var nextTickQueue = []

var p = Promise.resolve()
function flushAfterMicroTask () {
  flushStartTimestamp = getNow()
  return p.then(flush)
}
var key = '$vueTick'
window.addEventListener(
  'message',
  function (event) {
    if (event.source !== window || event.data !== key) {
      return
    }
    flushStartTimestamp = getNow()
    try {
      flush()
    } catch (e) {
      throw e
    }
  },
  false
)
function flushAfterMacroTask () {
  window.postMessage(key, '*')
}

function queueJob (rawJob) {
  var job = rawJob
  if (currentJob) {
    currentJob.children.push(job)
  }

  if (job.status === 2) {
    invalidateJob(job)
    requeueInvalidatedJob(job)
  } else if (job.status !== 1) {
    queueJobForStaging(job)
  }
  if (!hasPendingFlush) {
    hasPendingFlush = true
    flushAfterMicroTask()
  }
}
function queuePostEffect (fn) {
  if (currentJob) {
    currentJob.postEffects.push(fn)
  } else {
    postEffectsQueue.push(fn)
  }
}
function flushEffects () {
  var i = postEffectsQueue.length
  while (i--) {
    postEffectsQueue[i]()
  }
  postEffectsQueue.length = 0
}
function queueNodeOp (op) {
  if (currentJob) {
    currentJob.ops.push(op)
  } else {
    applyOp(op)
  }
}
function nextTick (fn) {
  return new Promise(function (resolve, reject) {
    p.then(function () {
      if (hasPendingFlush) {
        nextTickQueue.push(function () {
          resolve(fn ? fn() : undefined)
        })
      } else {
        resolve(fn ? fn() : undefined)
      }
    }).catch(reject)
  })
}

function flush () {
  var job
  while (true) {
    job = stageQueue.shift()
    if (job) {
      stageJob(job)
    } else {
      break
    }

    var now = getNow()
    if (now - flushStartTimestamp > frameBudget && job.expiration > now) {
      break
    }
  }
  if (stageQueue.length === 0) {
    for (var i = 0; i < commitQueue.length; i++) {
      commitJob(commitQueue[i])
    }
    commitQueue.length = 0
    flushEffects()
    if (stageQueue.length > 0) {
      if (getNow() - flushStartTimestamp > frameBudget) {
        return flushAfterMacroTask()
      } else {
        return flush()
      }
    }
    hasPendingFlush = false
    for (var i = 0; i < nextTickQueue.length; i++) {
      nextTickQueue[i]()
    }
    nextTickQueue.length = 0
  } else {
    flushAfterMacroTask()
  }
}
function resetJob (job) {
  job.ops.length = 0
  job.postEffects.length = 0
  job.children.length = 0
}
function queueJobForStaging (job) {
  job.ops = job.ops || []
  job.postEffects = job.postEffects || []
  job.children = job.children || []
  resetJob(job)
  job.expiration = currentJob ? currentJob.expiration : getNow() + 500 /* NORMAL */
  stageQueue.push(job)
  job.status = 1
}
function invalidateJob (job) {
  var children = job.children
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.status === 2) {
      invalidateJob(child)
    } else if (child.status === 1) {
      stageQueue.splice(stageQueue.indexOf(child), 1)
      child.status = 0
    }
  }
  if (job.cleanup) {
    job.cleanup()
    job.cleanup = null
  }
  resetJob(job)
  commitQueue.splice(commitQueue.indexOf(job), 1)
  job.status = 0
}
function requeueInvalidatedJob (job) {
  for (var i = 0; i < stageQueue.length; i++) {
    if (job.expiration < stageQueue[i].expiration) {
      stageQueue.splice(i, 0, job)
      job.status = 1
      return
    }
  }
  stageQueue.push(job)
  job.status = 1
}
function stageJob (job) {
  if (job.ops.length === 0) {
    currentJob = job
    job.cleanup = job()
    currentJob = null
    commitQueue.push(job)
    job.status = 2
  }
}
function commitJob (job) {
  var ops = job.ops

  var postEffects = job.postEffects
  for (var i = 0; i < ops.length; i++) {
    applyOp(ops[i])
  }
  if (postEffects) {
    postEffectsQueue.push.apply(postEffectsQueue, postEffects)
  }
  resetJob(job)
  job.status = 0
}
function applyOp (op) {
  var fn = op[0]
  if (op.length <= 3) {
    fn(op[1], op[2], op[3])
  } else {
    fn(op[1], op[2], op[3], op[4], op[5], op[6], op[7], op[8])
  }
}
