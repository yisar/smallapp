import { execScript } from './exec-script.js'
import { getCurrentPage } from './page.js'
import { global as ref } from './global'
import { render, h, useEffect } from './fre-esm'

export function init(location) {
    let path = location.pathname

    let p = ''

    const manifest = ref.native.readFileSync('demo/manifest.json')
    const pages = JSON.parse(manifest).pages
    if (path === '/') {
        p = pages[0]
    } else {
        p = pages.find(i => i.path === path)
    }

    const { scripts, styles } = p


    execScript('demo' + scripts[1], ref)
    execScript('demo' + scripts[0], ref)

    const page = getCurrentPage()

    const c = ref.modules['demo' + scripts[1]].default


    render(h(() => {
        useEffect(() => {
            let link = document.createElement('link')
            link.setAttribute('href', '/' + 'demo' + styles[0])
            link.setAttribute('rel', 'stylesheet')
            document.body.appendChild(link)
        }, [])
        return h(c, { data: page.data })
    }), document.body)
}