import proxy from './ww.js'

let document = proxy.document

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

ctx.fillStyle = 'green'
ctx.fillRect(10, 10, 150, 100)