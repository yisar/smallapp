import { upgradeElement } from '../ignore/worker-dom'
upgradeElement(document.getElementById('upgrade-me'), './dist/worker/worker.mjs')
