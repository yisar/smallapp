# voe

> Double thread framework has the same API with Vue

### Introduction

voe （发音 `/vəʊ/`） 的双线程是小程序的底层架构，它通过 web-worker 隔离 web 环境，屏蔽 dom 能力，从而做到绝对的控制力

顺便实现了 vue3 的响应式，依赖收集，状态更新等，但本质不同

### Use

```js
import { h, app, reactive } from "..";

app({
  setup() {
    const count = reactive(0)
    return () => (
      <main>
        {count}
        <button onClick={() => count++}>+</button>
      </main>
    )
  }
})
```


