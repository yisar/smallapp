self.addEventListener('fetch', event => {
  if (event.request.url === '/fre') {
    postMessage(event.data)
    event.respondWith(new Promise(resolve => {
      self.addEventListener('message', data => {
        resolve(data)
      })
    }))
  } else {
    event.respondWith(fetch(event.request))
  }
})

const postMessage = (data) => {
  self.clients.matchAll()
    .then((clients) => {
      if (clients && clients.length) {
        clients.forEach( (client)=> {
          client.postMessage(data)
        })
      }
    })
}