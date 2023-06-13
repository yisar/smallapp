import { h } from '../fre-esm'

function computedStype(str) {
    let out = {}
    let arr = str.split(';')
    arr.forEach(s => {
        const [name, value] = s.split(':')
        out[name] = value
    })
    return out
}

export default function View(props) {
    if (props.style) {
        var style = computedStype(props.style)
        delete props.style
    }

    return <div {...props} style={style}></div>
}