这里是根据 vue3 的 class API rfc 来推敲 voe 的 API

[vue-class-API](https://github.com/vuejs/rfcs/blob/class-api/active-rfcs/0000-class-api.md)

## class API

```jsx
class App extends Voe {
  // 通过 static 定义的属性，不会被劫持
  static tag = 'v-app'

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
```

### data

为了更好的符合语义化，data 可以通过方法定义

```js
class App extends Voe {
  data() {
    return {
      count: 1,
    }
  }
}
```

但是这个方法并没有什么卵用，它最终会被代理到 this 下

### static value

静态属性，通过 static 关键字声明，它不会被劫持

```js
class App extends Voe {
  static ep = new Eplayer() //不会被劫持，不是响应的
}
```

### props

props 需要事先声明，才会被代理到 this 上

```js
class App extends Voe {
  static props = {
    msg: String,
  }
  created() {
    console.log(this.msg)
  }
}
```

### computed

通过 get 关键字声明的方法为 computed 方法

```js
class App extends Voe {
  get plusOne() {
    console.log(this.count)
  }
}
```

### 函数

任何不是生命周期 或 render 的函数都是普通函数

```js
class App extends Voe {
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
class App extends Voe {
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
