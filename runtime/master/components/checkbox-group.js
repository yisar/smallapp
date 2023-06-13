import { createContext } from '../context'
import {h} from '../fre-esm'

export const CheckboxContext = createContext()

function CheckboxGroup(props) {
  const { onChange } = props

  return (
    <CheckboxContext.Provider value={{ change: onChange, value: [] }}>
      <div>{props.children}</div>
    </CheckboxContext.Provider>
  )
}

export default CheckboxGroup
