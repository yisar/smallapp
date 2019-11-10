import { app, h, reactive } from '../src'

const App = {
  setup () {
    const add = () => {
      state.count++
    }
    let state = reactive({ count: 0 })
    return <button onClick={add}>{state.count}</button>
  }
}

app(App)
