export function Switch(props) {
    props.type = "checkbox"

    const Switch = fre.styled("input")`
          outline: none;
          width: 60px;
          height: 26px;
          background-color: var(--default-color);
          border-radius: 36px;
          border: none;
          -webkit-appearance: none;
          -moz-appearance:none;
          transition: all .2s ease;
          cursor: pointer;
          position: relative;
          box-shadow: 1px 1px 2px #eaecef inset;
          -webkit-tap-highlight-color:rgba(0,0,0,0);
          &:before{
            content:'';
            position: absolute;
            top: -5px;
            transform: translateX(0);
            width: 36px;
            height: 36px;
            background:#fff;
            border-radius: 50%;
            transition: all .2s ease;
            display: inline-block;
            text-align: center;
            line-height: 36px;
            box-shadow: 2px 0px 2px #d4dae4;
          }
          &:checked{
            background-color: var(--primary-color);
            box-shadow: 1px 1px 2px #1d67dd inset;
          }
          &:checked:before{
            transform: translateX(24px);
          }
          &:focus{
            outline: none;
          }`
    return fre.h(Switch, props)
}