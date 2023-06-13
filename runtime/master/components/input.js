import { h } from '../fre-esm'

export default function Input(props) {
    return <input
        style={{
            border: " 0px",
            padding: " 5px",
            "box-sizing": " border-box",
            outline: " none",
            "border-radius": "2px",
            ...props.style
        }}
        type="text"
        {...props}
    ></input>
}