import { diff } from '../src/master'

let oldVnode = {
  type: 'div',
  props: {},
  children: [
    {
      type: 1
    }
  ]
}
let newVnode = {
  type: 'div',
  props: {},
  children: [
    {
      type: 2
    }
  ]
}

diff(oldVnode, newVnode)
