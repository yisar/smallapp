import {h} from '../fre-esm'

function Icon(props) {
    const { size=24, color='var(--primary-color)', type, ...rest } = props
    return (
      <i
        {...rest}
        type={type}
        style={{
          color: props.color,
          height: props.size + 'px',
          width: props.size + 'px',
        }}
      ></i>
    )
  }
  export default Icon
  