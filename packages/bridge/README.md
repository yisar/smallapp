# @voe/bridge

> 基于 proxy 的跨线程通信方案

```js
import { docuemnt } from '@voe/bridge'

const div = document.createElement('div')
div.innerHTML = 'hello voe'
document.body.appendChild(div)
```
原理是通过 Proxy 劫持 document 对象以及 createElement 等方法，往主线程发送命令，最终主线程对应操作 dom
