import { app, h, reactive } from '../src'

const App = {
  setup () {
    const add = () => {
      state.count++
    }
    let state = reactive({ count: 0 })
    return () => (
      <div>
        <h1>{state.count}</h1>
        <button onClick={add}>+</button>
      </div>
    )
  }
}

app(App)
