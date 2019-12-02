import { render, h, reactive } from '../dist/voe'


const Hello = () => {
  return (
    <view>hello</view>
  );
}

function App (props) {
  const state = reactive({ count: 0 })
  return () => (
    <view class="main">
      <text>{state.count}</text>
      <button onClick={e => {
        localStorage.setItem('name','132')
        state.count++
      }}>+</button>
      <Hello/>
    </view>
  )
}

render(<App />)
