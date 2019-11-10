export function sadism (config) {
  self.onmessage = e => {
    console.log(e.data)
    self.postMessage('from worker')
  }
}
