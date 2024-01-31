const path = require('path')
const express = require('express')
const { getIndexHtmlCode } = require('./packagers/util') 
const { PORT = 5000 } = process.env

module.exports = function serve(options) {
  const basetdir = path.join(__dirname, '../../runtime/dist')
  const distdir = path.join(options.i, options.o)

  const app = express()
    .use(express.static(basetdir))
    .use(express.static(distdir))
    .get('/', (req, res) => {
      getIndexHtmlCode().then((data) => {
        res.end(data)
      })
    })
    .use(redirect)
    .get("/hello", (req, res) => {
      res.end('hello world')
    })
    .get("*", (req, res) => {
      res.end('404')
    })
    .listen(PORT, (err) => {
      if (err) throw err
      console.log(`serve on http://localhost:${PORT}`)
    })

  return app.server
}

const redirect = function (req, res, next) {
  res.redirect = (location) => {
    let str = `Redirecting to ${location}`
    res.writeHead(302, {
      Location: location,
      "Content-Type": "text/plain",
      "Content-Length": str.length,
    })
    res.end(str)
  }
  next()
}
