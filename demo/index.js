import { app, h, reactive } from '../src'

app({
  setup () {
    const count = reactive('hello world')
    return <h1>{count}</h1>
  }
})
