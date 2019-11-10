import { app, h, reactive } from '../src'

app({
  setup () {
    const add = () => count++
    const count = reactive('hello world')
    return <h1 onClick={add}>{count}</h1>
  }
})
