import {h, useState} from '../fre-esm'

export default function Switch(props) {
    const [checked, setChecked] = useState(props.checked)
    const onChange = e => {
      setChecked(e.checked)
      props.onChange && props.onChange({ detail: { value: e.checked } })
    }
    return (
      <input type="checkbox" tag="switch" onInput={onChange} checked={checked}></input>
    )
  }
  