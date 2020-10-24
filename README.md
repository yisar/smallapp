<p align="center"><img src="https://ae01.alicdn.com/kf/HTB1gg8cc8aE3KVjSZLeq6xsSFXaQ.jpg" alt="fard logo" width="200px"></p>

# fard [![NPM version](https://img.shields.io/npm/v/fard.svg?style=flat-square)](https://npmjs.com/package/fard) [![NPM downloads](https://img.shields.io/npm/dt/fard.svg?style=flat-square)](https://npmjs.com/package/fard) [![QQ](https://img.shields.io/badge/qq.group-813783512-ff69b4.svg?maxAge=2592000&style=flat-square)](https://jq.qq.com/?_wv=1027&k=5Zyggbc)

🎃 Multi thread javascript framework - 多线程小程序引擎

> 工作日只处理 issue，节假日玩耍~

```js

基本原理很简单，通过 worker 实现多线程，然后将 fre 和业务逻辑跑在 worker 中，从而隔离 dom 环境
```

### Feature

- 基于 Proxy 的跨线程通信思路

- 使用 worker 作为沙箱环境

- 跑 fre 框架

- no bundle server

- electron ide

### Run

```js

$ cd runtime
$ yarn start
$ cd ../ide
$ run start

```

### References


- [基于 Proxy 的线程通信新方案](https://zhuanlan.zhihu.com/p/198989762)

- [小程序 ide 新思路：no webpack](https://zhuanlan.zhihu.com/p/203670830)

- [基于 web worker 的双线程架构](https://github.com/132yse/voe/issues/2)

- [Run vdom in web worker](https://zhuanlan.zhihu.com/p/91594153)


### License

MIT
