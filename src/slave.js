export function masochism (worker, config) {
  worker.onmessge = e => {
    console.log(e.data)
  }
  worker.postMessage('from window')
}
