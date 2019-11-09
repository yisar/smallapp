# voe

> Double thread framework has the same API with Vue

### p.s.

一边复现 vue3 核心，一边寻找新的灵感和思路，用于学习和交流

- web worker 和 主线程 通信
- 一个精彩的 vdom diff 算法
- 和 vue3 几乎一致的 API
- web-components

```js
import { h, ref, app } from '..'

app({
  setup() {
    const count = ref(0)
    return (
      <main>
        {count.value}
        <button onClick={() => count.value++}>+</button>
      </main>
    )
  },
})
```
