这里是根据 vue3 的 class API rfc 来推敲 voe 的 API

* 只复现 class API
* 使用 web-component 替代 vue 的 runtime

[vue-class-API](https://github.com/vuejs/rfcs/blob/class-api/active-rfcs/0000-class-api.md)

## class API

```js
import Voe from 'voe'

class myApp extends Voe {
  // data 直接声明
  count = 0

  // 生命周期
  created() {
    console.log(this.count)
  }

  // get 函数用来定义 computed
  get plusOne() {
    return this.count + 1
  }

  // 普通函数
  increment() {
    this.count++
  }

  render() {
    return (
      <div>
        <h1>{this.count}</h1>
        <button onClick={() => {this.increment()}}>+</button>
      </div>
    )
  }
}

Voe.render(<my-app />, document.body)
```
### render

> 约定：class 必须为两个以上单词的驼峰，在 jsx 中，驼峰会变成连字符，然后注册 customElement

```js
class EPlayer {
  # to do ...
}
```

```js
render() {
  return <e-player />
}
```

### data

为了更好的符合语义化，data 可以通过方法定义

```js
class myApp extends Voe {
  data() {
    return {
      count: 1,
    }
  }
}
```

但是这个方法并没有什么卵用，它最终会被代理到 this 下

### private value

私有属性，它需要在前面加`#`，不会被劫持

```js
class myApp extends Voe {
  #ep = new Eplayer() //不会被劫持，不是响应的
}
```

### props

props 需要事先声明 static 数组，默认从 web component 传下来，然后代理到 this 上，顺便劫持它

```js
class myApp extends Voe {
  static props = [msg]
  
  created() {
    console.log(this.msg)
  }
}
```

### computed

通过 get 关键字声明的方法为 computed 方法

```js
class myApp extends Voe {
  get plusOne() {
    console.log(this.count)
  }
}
```

### function

任何不是生命周期 或 render 的函数都是普通函数

```js
class myApp extends Voe {
  //生命周期
  mounted() {
    document.title = this.count
  }
  // 普通函数
  increment() {
    this.count++
  }
}
```

### JSX

默认使用 jsx 而不是模板，即 render 函数

```jsx
class myApp extends Voe {
  render() {
    return (
      <div>
        <h1>{this.count}</h1>
        <button onClick={() => {this.increment()}}>+</button>
      </div>
    )
  }
}
```
