<p align="center"><img src="https://ws1.sinaimg.cn/large/0065Zy9ely1g8xk4ktgctj30eg0cit9a.jpg" alt="voe logo" width="120"></p>
<h1 align="center">Voe <a href="https://npmjs.com/package/voe"><img src="https://img.shields.io/npm/v/voe.svg?label=" alt="npm-v"></a></h1>
<p align="center">:jack_o_lantern: Double thread javascript framework has the same API with Vue3.</p>

### Introduction

voe （发音 `/vəʊ/`） 的双线程是小程序的底层架构，它通过 web-worker 隔离 web 环境，屏蔽 dom 能力，从而做到绝对的控制力

顺便实现了 vue3 的响应式，依赖收集，状态更新等，但本质不同

- [基于 web worker 的双线程架构](https://github.com/132yse/voe/issues/2)

- [Run vdom in web worker](https://zhuanlan.zhihu.com/p/91594153)

### Use

```console
yarn add voe
```

```js
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
```

#### p.s.

由于用户代码都在 worker 中运行，所以 document、window 等都不能用

但是可以使用 fetch 和 indexDB，双线程的目的就在于此，不是不让用，而是真的没得用

```console
目前还是原型阶段，等我慢慢完善……
```


