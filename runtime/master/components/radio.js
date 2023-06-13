import { h } from '../fre-esm'
import { useContext } from '../context'
import { RadioContext } from './radio-group'

function Radio(props) {
  const change = useContext(RadioContext)
  let { color, id, style, value } = props

  const onClick = e => {
    if (props.onClick) {
      props.onClick(e)
    }
  }

  const onChange = e => {
    e.stopPropagation && e.stopPropagation()
    change && change({ detail: { value } })
    if (props.onChange) {
      props.onChange({
        detail: {
          value: value,
          checked: e.target.checked,
        },
      })
    }
  }

  if (props.checked === 'undefined'){  // why??
    props.checked = false 
  }

  return (
    <input
      id={id}
      type="radio"
      checked={props.checked}
      onClick={onClick}
      onChange={onChange}
      style={{ color, ...style }} />
  )
}

export default Radio