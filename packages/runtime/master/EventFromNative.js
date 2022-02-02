import { getPageByGuid } from "./PageInit"

export function bindNativeEvnets() {
    JSSDK.addEventListener('onResume', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onShow) {
            page.onShow.call(page)
        }

    })
    JSSDK.addEventListener('onBack', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onBack) {
            page.onBack.call(page)
        }

    })
    JSSDK.addEventListener('onDismiss', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onClose) {
            page.onClose.call(page)
        }
    })

    JSSDK.addEventListener('onHide', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onHide) {
            page.onHide.call(page)
        }
    })

    JSSDK.addEventListener('onUnload', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onUnload) {
            page.onUnload.call(page)
        }
    })

    JSSDK.addEventListener('onShareAppMessage', (ret) => {
        const { guid } = ret
        const page = getPageByGuid(guid)
        if (page.onShareAppMessage) {
            page.onShareAppMessage.call(page)
        }
    })


    JSSDK.addEventListener('onAppLifecycleChanged', (ret) => {
        // 这个是干嘛的

    });

    JSSDK.addEventListener('webviewLoadComplete', (res = {}) => {
        console.log('webview loaded')
    });


    JSSDK.addEventListener('webviewLoadFail', (res = {}) => {
        console.error('webview load error', res)

    })
}