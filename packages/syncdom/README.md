同步 dom 操作实现思路

```js
jscore  document.createElement 同步代码，往 service worker 发同步请求，然后 server worker 中 await webiveiw 的内容，然后同步请求返回给 jscore
```