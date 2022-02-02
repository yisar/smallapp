export function Slider(props) {
    const [range, setRange] = fre.useState(50)
    const r = fre.useRef(null)
    props.type = "range"
    props.onchange = (e) => {
        const width = r.current.clientWidth
        const px = (e.target.value / 100) * width
        const p = (px / width) * 100
        setRange(p)
        props.bindchange && props.bindchange(e)
    }
    props.onMousemove = (e) => {
        props.bindchanging && props.bindchanging(e)
    }
    props.value = range

    delete props.bindchange
    delete props.bindchanging

    const Slider = fre.styled("input")`
            outline: none;
            width: 90%;
            background-image: linear-gradient(
              to right,
              var(--primary-border-color) ${range}%,
              var(--default-border-color) 0%
            );
            border-radius: 50%;
            -webkit-appearance: none;
            -moz-appearance: none;
            transition: all 0.2s ease;
            position: relative;
            height: 2px;
            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              cursor: default;
              height: 20px;
              width: 20px;
              transform: translateY(0px);
              border-radius: 50%;
              box-shadow: 2px 0px 2px #d4dae4;
              background: #fff;
            }
          `
    return fre.h(Slider, {
        ...props,
        ref: r,
    })
}
