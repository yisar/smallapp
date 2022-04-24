const Asset = require("./asset")
const { lex, parse, generate } = require("../../wxml/index.js")
const {compile} = require('../../../wxml-parser/pkg/wxml_parser')

module.exports = class Wxml extends Asset {
  constructor(path, type, name) {
    super(path, type, name)
  }
  async transform(input) {
    const tokens = lex(input)
    const ast = parse(tokens)
    this.ast = ast
    this.code = compile(`<view wx:for="{{list}}">
    hello {{item}}!
    <text wx:if="{{a}}">a</text>
    <text wx:elseif="{{b}}">b</text>
    <text bind:tap="aaa" />
</view>`)
    console.log(this.code)
    let { imports, blocks } = generate(this)
    this.blocks = blocks
    imports.forEach((i) => this.dependencies.add({ path: i, ext: ".wxml" }))
  }
}
