import { render, h, reactive } from '../src'

function App (props) {
  const state = reactive({ count: 0 })
  return () => (
    <view>
      <text>{state.count}</text>
      <button onClick={e => state.count++}>+</button>
    </view>
  )
}

render(<App />)
