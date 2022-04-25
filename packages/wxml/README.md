# wxml-parser

[wean-wxml](https://github.com/ctripcorp/wean/tree/master/wxml) rust version, compile wxml source to [fre](https://github.com/yisar/fre) jsx code.

- [Playground](https://yisar.github.io/wxml/)

### Usage

```rust
pub mod lexer;
pub mod parser;
pub mod generator;

fn main() {
    let mut parser = parser::Parser::new("<view wx:for=\"{{list}}\">
    hello {{item}}!
    <text wx:if=\"{{a}}\">a</text>
    <text wx:elseif=\"{{b}}\">b</text>
    <text wx:else />
</view>");
    let ast = parser.parse_all().unwrap();
    let mut gen = generator::Generator::new(ast);
    let code = gen.generate_fre();
    println!("{:#?}", code)
    // <>{list.map((item)=><View>hello {item}!{a?<Text>a</Text>:b?<Text>b</Text>:ture?<Text/>:null}</View>)}</>
}
```
