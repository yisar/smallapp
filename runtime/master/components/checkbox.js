import { useState, useEffect } from '../fre-esm'
import { useContext } from '../context'
import { CheckboxContext } from './checkbox-group.js'

function Checkbox(props) {
  let { change, value: newValue } = useContext(CheckboxContext)
  const [checked, setChecked] = useState(props.checked)
  let { color, id, style, value } = props

  useEffect(() => {
    if (checked && newValue.indexOf(value) === -1) {
      newValue.push(value)
    } else if (!checked) {
      const index = newValue.indexOf(value)
      newValue.splice(index, 1)
    }
    change && change({ detail: { value: newValue } })
  }, [checked])

  const onChange = e => {
    e.stopPropagation && e.stopPropagation()
    setChecked(e.target.checked)
    if (props.onChange) {
      props.onChange({
        detail: {
          value,
          checked,
        },
      })
    }
  }

  return (
    <input
      id={id}
      type="checkbox"
      tag="checkbox"
      style={{ color, ...style }}
      checked={checked}
      onClick={props.onClick}
      onChange={onChange}
    />
  )
}

export default Checkbox