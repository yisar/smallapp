import { app, h, reactive } from '../src'

app({
  setup () {
    const count = reactive('hello world')
    return <h1 onClick={() => count++}>{count}</h1>
  }
})
