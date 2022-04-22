const fs = require('fs')
const path = require('path')
const express = require('express')
const { PORT = 5000 } = process.env

module.exports = function serve(options) {
  const app = express()
    .use(express.static('../runtime'))
    .use(redirect)
    .get("/",(req,res)=>{
      res.end('hello world')
    })
    .get("*", (req, res) => {
      const html = fs.readFileSync(path.join(__dirname,'../../runtime/index.html')).toString()
      res.end(html)
    })
    .listen(PORT, (err) => {
      if (err) throw err
      console.log(`serve on localhost:${PORT}`)
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
