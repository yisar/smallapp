export function Input(props) {
    props.type = "text"
    props.style = {
        width: "90%",
        border: " 0px",
        padding: " 5px",
        "box-sizing": " border-box",
        outline: " none",
        "border-radius": "2px",
    }
    return fre.h("input", props)
}