# voe

> Double thread framework has the same API with Vue

### Introduction

voe （发音 `/vəʊ/`） 的双线程是小程序的底层架构，它通过 web-worker 隔离 web 环境，屏蔽 dom 能力，从而做到绝对的控制力

顺便实现了 vue3 的响应式，依赖收集，状态更新等，但本质不同

* [基于 web worker 的双线程架构](https://github.com/132yse/voe/issues/2)

* [Run vdom in web worker](https://zhuanlan.zhihu.com/p/91594153)

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
#### p.s.

由于用户代码都在 worker 中运行，所以 document、window、cookie、fetch，localstorage 等都不能用

但是可以可以使用 xhr 和 indexDB，可以通过它们来模拟




