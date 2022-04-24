const Asset = require("./asset")
const {compile} = require('../../../wxml-parser/pkg/wxml_parser')

module.exports = class Wxml extends Asset {
  constructor(path, type, name) {
    super(path, type, name)
  }
  async transform(input) {
    // const tokens = lex(input)
    // const ast = parse(tokens)
    this.code = compile(input.replace(/\r\n/g,''), this.parent.id)
    // let { imports, blocks } = generate(this)
    // this.blocks = blocks
    // imports.forEach((i) => this.dependencies.add({ path: i, ext: ".wxml" }))
  }
}
