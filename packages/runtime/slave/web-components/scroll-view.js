import {loadingStr} from './c-loading'

const attr = function (dom) {
    return window.getComputedStyle(dom, null)
}
const debounce = (fn) => {
    let lock = false
    return (e) => {
        if (!lock) {
            lock = true
            requestAnimationFrame(() => { // 用 raf 防抖，不会破坏 css 动画
                fn(e)
                lock = false
            })
        }

    }
}
class ScrollView extends HTMLElement {
    constructor() {
        super()
        this.host = this.attachShadow({ mode: "open" }).host

        //  ["_id", "class", "scrolly", "refresherenabled", "refresherthreshold", "refresherdefaultstyle", "refresherbackground", "refreshertriggered", "style"]

        this.pos = { // 位置计算相关
            height: 0,
            clientY: 0,
            isPulling: false,
            hasTouched: false
        }

    }
    attr(key) {
        return this.getAttribute(key)
    }
    connectedCallback() {
        const that = this
        setTimeout(this.defer.bind(that), 0)
    }

    defer() {

        this.scroll = { // scroll 事件相关
            scrollX: (0, eval)(this.attr("scrollx")) || false,
            scrollY: (0, eval)(this.attr("scrolly")) || true,
            height: this.attr("height") || "100vh",
            upperThreshold: parseInt(this.attr("upperthreshold")) || 50,
            lowerThreshold: parseInt(this.attr("lowsthreshold")) || 50,
            enableFlex: (0, eval)(this.attr("enableflex")) || false,
        }

        this.touch = { // touch 相关
            enabled: (0, eval)(this.attr('refresherenabled')) || false,
            threshold: parseInt(this.attr('refresherthreshold')) || 50,
            defaultStyle: this.attr('refresherdefaultstyle') || "",
            background: this.attr('refresherbackground') || "#fff",
            triggered: this.attr('refreshertriggered')
        }

        console.log(this.touch,this.scroll)

        this.shadowRoot.innerHTML = `
        <div class="refresher">${loadingStr}</div>
        ${this.innerHTML}
        `
        this.innerHTML = null
        this.refresher = this.shadowRoot.querySelector('.refresher')
        this.events = window.registryClintEvent({
            key: this.attr("_id"),
            callback: (coreMsg) => {
                console.log('[scroll-view]', coreMsg)
            }
        })


        this.host.style = `height:${this.scroll.height};display:${this.scroll.enableFlex ? "flex" : "block"
            };overflow:scroll;transition: 0.3s;`

        this.refresher.style = `height:0px;${this.touch.defaultStyle};background:${this.touch.background};display:flex;align-items:center;overflow:hidden;`


        if (this.touch.enabled) { // 移动端一律走 touch 事件，不走 scroll 事件
            this.host.addEventListener('scroll', (e) => e.stopPropagation())
            this.host.addEventListener('touchstart', this.touchStart.bind(this))
            this.host.addEventListener('touchmove', debounce(this.touchMove.bind(this)))
            this.host.addEventListener('touchend', this.touchEnd.bind(this))
        }
    }

    transform(height, transition) {
        this.refresher.style.transition = transition ? '0.3s' : '0s'
        this.pos.height = height
        this.refresher.style.height = height + 'px'
    }

    touchStart(e) {
        console.warn('touch start')
        this.pos.isPulling = this.host.scrollTop <= 0
        this.pos.clientY = e.touches[0].clientY
        this.refresher.style.transition = '0s'
        this.pos.hasTouched = false
    }
    touchMove(e) {
        console.warn('touch move')

        if (this.pos.hasTouched) {
            return
        }
        const { threshold } = this.touch
        const { height } = this.pos
        let delta = e.touches[0].clientY - this.pos.clientY
        if (height <= 0 && delta <= 0) {
            return
        }
        this.pos.isPulling = this.host.scrollTop <= 0

        if (this.pos.isPulling) {
            let temp = 0
            if (delta > 0) {
                if (height > threshold) {
                    temp = height + delta / (height - threshold)
                } else {
                    temp = height + delta
                }
            } else {
                temp = height + delta
                if (temp <= 0) {
                    temp = 0
                }
            }
            this.transform(temp, false)
            this.pos.clientY = e.touches[0].clientY
        }
    }
    touchEnd(e) {
        console.warn('touch end')

        this.pos.hasTouched = true
        let timer = null
        const { threshold } = this.touch
        let { height } = this.pos

        if (height >= threshold && this.pos.isPulling) {

            this.transform(threshold, true)
            new Promise((resolve, reject) => {
                timer = setTimeout(() => resolve(111), 1000)
            }).then((res) => {
                clearTimeout(timer)
                console.log(res)
                this.transform(0, true)
            })
        } else {
            this.pos.clientY = 0
            this.transform(0, true)
            this.scrolling()
        }
    }

    sendCoreMessage = (type) => {
        this.events.send({
            type,
        });
    };

    scrolling(e) {
        let {
            scrollX,
            upperThreshold,
            lowerThreshold,
        } = this.scroll

        let scrollValue = this.host[scrollX ? "scrollLeft" : "scrollTop"]
        let scrollAttr = this.host[scrollX ? "scrollWidth" : "scrollHeight"]

        this.sendCoreMessage('onScroll')

        let clientAttr = parseFloat(
            attr(this.host)[scrollX ? "width" : "height"]
        )

        if (scrollValue <= upperThreshold && !this.touch.enabled) {
            console.log('触顶')
            this.sendCoreMessage('onScrollToUpper')
            // const fn = this.scrollToUpper.bind(this)
        }

        if (scrollValue >= scrollAttr - clientAttr - lowerThreshold) {
            console.log('触底')
            this.sendCoreMessage('onScrollToLower')
            // const fn = this.scrollToLower.bind(this)
            // fn()
        }
    }

    scrollToItem(itemIndex) {
        let { scrollX } = this.scroll
        if (this.host) {
            let child = this.host.childNodes
            if (itemIndex > child.length - 1) return
            let offsetAttr =
                child[itemIndex][scrollX ? "offsetLeft" : "offsetTop"]
            this.host[this.attr] = offsetAttr
        }
    }

    aaa() {
        console.log('触顶')
    }

    bbb() {
        console.log('触底')
    }
}

window.customElements.define("scroll-view", ScrollView)
