export function Button(props) {
    const { type = "primary", size = "default", disabled } = props

    const Button = fre.styled("button")`
        background: ${type === "primary"
            ? "var(--primary-color)"
            : type === "default"
                ? "var(--default-color)"
                : "var(--warn-color)"};
        color: ${type === "default" ? "#2577e3" : "#fff"};
        border: 1px solid;
        border-color: ${type === "primary"
            ? "var(--primary-border-color)"
            : type === "default"
                ? "var(--default-border-color)"
                : "var(--warn-border-color)"};
        width: ${size === "default" ? "184px" : "auto"};
        opacity: ${disabled ? 0.5 : 1};
        text-align: center;
        border-radius: 2px;
        padding: 8px ${size === "mini" ? "24px" : "0"};
        margin: 10px;
        font-size: 16px;
        font-weight: bold;
      `
    return fre.h(Button, props)
}