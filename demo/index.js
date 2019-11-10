import { app, h, reactive } from '../src'

app({
  setup () {
    const count = reactive(0)
    return (
      <div>
        {count}
      </div>
    )
  }
})
