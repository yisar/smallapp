# smallapp

`smallapp` is a [Chinese miniapp architecture](https://www.w3.org/TR/mini-app-white-paper) implementation.

As of now, there are over 7 million miniapps in China, Chinese people do not like to use browsers or search engines.

Musk envied `WeChat` and he really wanted this miniapp architecture, so I opened it up.

### Syntax

```html
<view>
    <text>{{count}}</text>
    <button bindtap="add">+</button>
</view>
```
```js
Page({
    data: {
        count: 0
    },
    add: () {
        this.setData({
            count: this.data.count + 1
        })

        wx.showToast({ 
            title: 'count is added!' 
        })
    }
})
```

### Demo Video

![suo](https://www.douyin.com/user/MS4wLjABAAAAAUM_j1ax3rc8ANyKLH6JsHYeTqHy8q-crAISyfWmNA0d4Mv_Gl7EHH2Evwzq0k3n?modal_id=7241974043560135968)

### Principle

1. compiler

```
smallapp build -e app.json -o /dist
```

This step will package the miniapp project into js files, which is double threaded. The jsx file is used for rendering threads, and the js file is used for logical threads.

2. worker

The logical thread is responsible for running JavaScript logic, and you need to find a JavaScript runtime, such as worker.

- Web worker
- Cloudflare worker
- quickjs/v8/hermes

As long as it has the standard API and communication mechanism of the worker, it can serve as the logical layer of the miniapp.

3. Native container

Miniapps runs on a super app, such as Wechat/Alipay/Baidu and its API is provided by the native container.
