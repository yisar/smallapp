import {h, useState} from '../fre-esm'

export default function Switch(props) {
    const [checked, setChecked] = useState(props.checked)
    const onChange = e => {
      setChecked(e.detail.checked)
      props.onChange && props.onChange({ detail: { value: e.detail.checked } })
    }
    return (
      <input {...props} type="checkbox" tag="switch" onInput={onChange} checked={checked}></input>
    )
  }
  