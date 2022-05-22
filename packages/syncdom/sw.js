self.addEventListener('fetch', event => {
  if (event.request.url === '/fre') {
    event.respondWith(new Promise(resolve => {
      self.addEventListener('message', data => {
        resolve(data)
      })
    }))
  } else {
    event.respondWith(fetch(event.request))
  }
})