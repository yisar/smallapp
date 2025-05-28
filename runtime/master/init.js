import { execScript } from './exec-script.js'
import { getCurrentPage } from './page.js'
import { global as ref } from './global'
import { render, h, useEffect } from './fre-esm'

export function init(manifest) {
    let path = '/'
    let p = ''
    const pages = manifest.pages
    if (path === '/') {
        p = pages[0]
    } else {
        p = pages.find(i => i.path === path)
    }

    const { scripts, styles } = p
    let link = document.createElement('link')
    link.setAttribute("href", "." + styles[0]);
    link.setAttribute("rel", "stylesheet");
    document.body.appendChild(link);
    execScript(scripts[1], ref);
    execScript(scripts[0], ref);

    const page = getCurrentPage()

    const c = ref.modules[scripts[1]].default

    const wrapComp = () => {
        useEffect(() => {
            page.onLoad && page.onLoad()
            return () => {
                page.unLoad && page.unLoad()
            }
        }, [])

        return h(c, { data: page.data })
    }


    render(h(wrapComp, {}), globalThis.document.body)
}