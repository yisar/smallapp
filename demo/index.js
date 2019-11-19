import { render, h, reactive } from '../dist/voe'

function App (props) {
  const state = reactive({ count: 0 })
  return () => (
    <view>
      <text>{state.count}</text>
      <button onClick={e => {
        localStorage.setItem('name','132')
        state.count++
      }}>+</button>
    </view>
  )
}

render(<App />)
