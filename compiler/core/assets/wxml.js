const Asset = require("./asset")
const { lex, parse, generate } = require("../../wxml/index.js")

module.exports = class Wxml extends Asset {
  constructor(path, type, name) {
    super(path, type, name)
  }
  async transform(input) {
    const tokens = lex(this.addStateToWxmlVariable(input))
    const ast = parse(tokens)
    this.ast = ast
    let { imports, blocks } = generate(this)
    this.blocks = blocks
    imports.forEach((i) => this.dependencies.add({ path: i, ext: ".wxml" }))
  }

  addStateToWxmlVariable(wxml) {
    const modifiedWxml = wxml.replace(/wx:for="\{\{(.*)\}\}"/g, (match, p1) => {
      const regex = /item\.(.*)/;
      if (regex.test(p1)) {
        return match;
      } else {
        return `wx:for="{{state.${p1}}}"`;
      }
    }).replace(/{{item\.(.*)}}/g, "{{item.$1}}").replace(/{{(.*)}}/g, "{{state.$1}}")
    return modifiedWxml
  }
}
