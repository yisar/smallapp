import { h, render } from './web_modules/fre.esm.js'
import { context } from './web_modules/fard.master.js'

self.document = context.document
self.window = context.window

render(h('h1', {foo:'foo'}, 'hello fre'), document.body)
