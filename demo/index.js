import { render, h, reactive } from '../src'

function App () {
  const state = reactive({ count: 0 })
  return () => (
    <div>
      <h1>{state.count}</h1>
      <button onClick={e => state.count++}>+</button>
    </div>
  )
}

render(<App/>)
