export function Text(props) {
    const userSelect = props["user-select"]
    return fre.h("span", {
      style: {
        display: userSelect ? "inline-block" : "inline",
      },
      ...props,
    })
  }