self.addEventListener(
  'message',
  e=> {
    self.postMessage(222)
  },
  false
)
