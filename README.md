# voe
Fast 3kb Vue-like  web component compiler

留坑，大概明年实现，将 vue 的 模板引擎移除掉，取而代之 web component 的 runtime

和 fre 不同，voe 是 vue-like，不是 fiber 调度，但是仍然会实现 时间切片，和优先级调度

和 vue 的 class API 争取保持不多的改变，但是不打算完全兼容
