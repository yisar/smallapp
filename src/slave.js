
function app (props) {
  let setup = props.setup
  let state = props.state
  let lock = false
  let node = document.body

  let dispatch = function (action) {
    return typeof action === 'function' ? dispatch(action(state)) : setState(action)
  }

  function setState (newState) {
    if (state !== newState) {
      state = newState
      if (!lock) {
        render()
        lock = true
      }
    }
    return state
  }

  function render () {
    lock = false
    node = diff(node.parentNode, node, (vdom = setup(state)))
  }

  dispatch(setup)
}
