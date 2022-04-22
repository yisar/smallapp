import { h } from '../fre-esm'

function Label(props) {
    const { children, ...rest } = props
    return <label {...rest}>{children}</label>
}

export default Label