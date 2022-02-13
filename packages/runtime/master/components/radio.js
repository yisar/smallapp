import { useState,h, useContext } from '../fre-esm'

function Radio(props) {
  let { color, id, style, value } = props

  const onChange = e => {
    if (props.onChange) {
      props.onChange({
        detail: {
          value: value,
          checked: e.checked,
        },
      })
    }
  }

  return (
    <input
      id={id}
      type="radio"
      style={checkStyle}
      checked={props.checked}
      onClick={onClick}
      onChange={onChange}
      style={{ color, ...style }}
    />
  )
}

export default Radio