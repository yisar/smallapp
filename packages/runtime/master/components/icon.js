import {h} from '../fre-esm'

function Icon(props) {
    const { size=24, color='var(--primary-color)', type, ...rest } = props
    return (
      <icon
        {...rest}
        type={type}
        style={{
          color: props.color,
          height: props.size + 'px',
          width: props.size + 'px',
        }}
      ></icon>
    )
  }
  export default Icon
  