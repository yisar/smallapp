export var PATHNAME = (function () {
  var scripts = document.getElementsByTagName('script')
  return scripts[scripts.length - 1].src
})()
