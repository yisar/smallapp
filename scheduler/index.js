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
  // Let's see if this invalidates any work that
  // has already been staged.
  if (job.status === 2 /* PENDING_COMMIT */) {
    // staged job invalidated
    invalidateJob(job)
    // re-insert it into the stage queue
    requeueInvalidatedJob(job)
  } else if (job.status !== 1 /* PENDING_STAGE */) {
    // a new job
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
  // post commit hooks (updated, mounted)
  // this queue is flushed in reverse becuase these hooks should be invoked
  // child first
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
// The original nextTick now needs to be reworked so that the callback only
// triggers after the next commit, when all node ops and post effects have been
// completed.
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
// Internals -------------------------------------------------------------------
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
    // all done, time to commit!
    for (var i = 0; i < commitQueue.length; i++) {
      commitJob(commitQueue[i])
    }
    commitQueue.length = 0
    flushEffects()
    // some post commit hook triggered more updates...
    if (stageQueue.length > 0) {
      if (getNow() - flushStartTimestamp > frameBudget) {
        return flushAfterMacroTask()
      } else {
        // not out of budget yet, flush sync
        return flush()
      }
    }
    // now we are really done
    hasPendingFlush = false
    for (var i = 0; i < nextTickQueue.length; i++) {
      nextTickQueue[i]()
    }
    nextTickQueue.length = 0
  } else {
    // got more job to do
    // shouldn't reach here in compat mode, because the stageQueue is
    // guarunteed to have been depleted
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
  // inherit parent job's expiration deadline
  job.expiration = currentJob ? currentJob.expiration : getNow() + 500 /* NORMAL */
  stageQueue.push(job)
  job.status = 1 /* PENDING_STAGE */
}
function invalidateJob (job) {
  // recursively invalidate all child jobs
  var children = job.children
  for (var i = 0; i < children.length; i++) {
    var child = children[i]
    if (child.status === 2 /* PENDING_COMMIT */) {
      invalidateJob(child)
    } else if (child.status === 1 /* PENDING_STAGE */) {
      stageQueue.splice(stageQueue.indexOf(child), 1)
      child.status = 0 /* IDLE */
    }
  }
  if (job.cleanup) {
    job.cleanup()
    job.cleanup = null
  }
  resetJob(job)
  // remove from commit queue
  commitQueue.splice(commitQueue.indexOf(job), 1)
  job.status = 0 /* IDLE */
}
function requeueInvalidatedJob (job) {
  // With varying priorities we should insert job at correct position
  // based on expiration time.
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
