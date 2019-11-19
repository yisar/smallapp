import { render, h, reactive } from '../dist/voe'

function App (props) {
  const state = reactive({ count: 0 })
  return () => (
    <view>
      <text>{state.count}</text>
      <button onClick={e => {
        fetch('https://api.clicli.us/rank').then(res => res.json())
        .then(data => {
         console.log(data)
        })
        state.count++
      }}>+</button>
    </view>
  )
}

render(<App />)
