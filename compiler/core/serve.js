const fs = require('fs')
const path = require('path')
const express = require('express')
const { PORT = 5000 } = process.env

module.exports = function serve(options) {
  const basetdir = path.join(__dirname, '../../runtime/dist')
  const distdir = path.join(options.i, options.o)
  const defaultCss = fs.readFileSync(path.join(__dirname, 'css', 'default.css'), 'utf-8')
  const app = express()
    .use(express.static(basetdir))
    .use(express.static(distdir))
    .get('/', (req, res) => {
      const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fre miniapp</title>
    <style>${defaultCss}</style>
</head>
<body>
    <script src="app.js"></script>
    <script src="slave.js"></script>
    <script>
        const worker = new Worker('/master.js')
        workerdomView({ worker })
    </script>
</body>

</html>`
      res.end(html)
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
