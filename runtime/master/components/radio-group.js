import { createContext } from '../context'
import {h} from '../fre-esm'

export const RadioContext = createContext()

function RadioGroup(props) {
  const { onChange } = props

  return <RadioContext.Provider value={onChange}><div>{props.children}</div></RadioContext.Provider>
}

export default RadioGroup