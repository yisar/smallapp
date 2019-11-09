# voe

> Double thread framework has the same API with Vue

### p.s.

一边复现 vue3 核心，一边寻找新的灵感和思路，目前已知：

- web worker 和 主线程 通信
- 精彩的 vdom diff 算法
- 和 vue3 几乎一致的 API

```js
import { h, ref } from '..'

export default {
  setup() {
    const count = ref(0)

    return (
      <main>
        {count.value}
        <button onClick={() => count.value++}>+</button>
      </main>
    )
  },
}
```
