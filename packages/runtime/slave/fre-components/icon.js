export function Icon(props) {
    const target = document.head
    fre.useEffect(() => {
        if (target.lastChild.nodeName !== "LINK") {
            let link = document.createElement("link")
            link.setAttribute(
                "href",
                "//at.alicdn.com/t/font_2365862_1fzp0ur9aqn.css"
            )
            link.setAttribute("rel", "stylesheet")
            target.appendChild(link)
        }
    }, [])
    props.class = `iconfont icon-${props.type}`
    props.style = {
        color: "var(--default-border-color)",
        display: 'block'
    }
    return fre.h("i", props)
}