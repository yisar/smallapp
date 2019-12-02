import { render, h, reactive } from '../dist/voe'

const Hello = (props) => {
  return <view>{props.count}</view>
}

function App(props) {
  const state = reactive({ count: 0,flag:true })
  return () => (
    <view class='main'>
      <text>{state.count}</text>
      <button
        onClick={e => {
          // localStorage.setItem('name', '132')
          state.count++
          // state.flag = !state.flag
        }}
      >
        +
      </button>
      {state.flag&&<Hello count={state.count}/>}
    </view>
  )
}

render(<App />)
