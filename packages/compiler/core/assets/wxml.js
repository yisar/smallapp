const Asset = require("./asset")
const {compile} = require('../../../wxml/pkg/wxml_parser')

module.exports = class Wxml extends Asset {
  constructor(path, type, name) {
    super(path, type, name)
  }
  async transform(input) {
    this.code = compile(input, this.parent.id)
    // console.log(compile(this.path,this.parent.id))
  }
}
