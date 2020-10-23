import { h, render } from './web_modules/fre.js'
import { context } from './web_modules/fard.master.js'

self.document = context.document

render(h('h1', {}, 'hello fre'), document.body)
