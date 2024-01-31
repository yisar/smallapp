const fs = require('fs')
const path = require('path')

function toHump(name) {
  return name.replace(/\-(\w)/g, (all, letter) => letter.toUpperCase())
}

const titleCase = (str) => str.slice(0, 1).toUpperCase() + toHump(str).slice(1)

const random = function randomString(len) {
  len = len || 6
  var $chars = "abcdefhijkmnprstwxyz"
  var letter = ""
  for (i = 0; i < len; i++) {
    letter += $chars.charAt(Math.floor(Math.random() * $chars.length))
  }
  return letter
}

function getId(asset) {
  let p = asset.parent
  while (p && p.type === 'wxml') {
    p = p.parent
  }
  return p ? p.id : null
}

async function getIndexHtmlCode() {
  const defaultCss = fs.readFileSync(path.join(__dirname, '../css', 'default.css'), 'utf-8')
  return `<!DOCTYPE html>
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
        if (window.AndroidJSServiceBridge) {
          setTimeout(() => {
            workerdomView({ worker: AndroidJSServiceBridge })
          }, 1000)
        } else {
          const worker = new Worker('/master.js')
          workerdomView({ worker })
        }
    </script>
</body>

</html>`
}

module.exports = {
  titleCase: titleCase,
  random: random,
  getId: getId,
  getIndexHtmlCode: getIndexHtmlCode
}
