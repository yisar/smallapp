import { bindNativeEvnets } from './EventFromNative'
import { setApp, App, getApp } from './App'

export function initCore() {
    bindNativeEvnets()

    /* 这里需要初始化 message channel */

    try {
        var content = JSSDK.readFileSync('/v3demo/manifest.json')
        if (content.length) {
            if (getApp() === null) {
                var app = new App(content)
                setApp(app)
            }

            app._init()
        } else {
            console.error('[master] 找不到 minafest.json')
        }
    } catch (e) {
        console.error(e)
    }


}