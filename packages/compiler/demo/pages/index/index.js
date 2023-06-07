import { a } from './a.js'
import d from './a.js'

function b() {
  a()
}
b()

const app = getApp()

Page({
  data: {
    url: ""
  },
  changeUrl(e) {
    this.setData({
      url: e.detail.value
    })
  },
  radioChange(e) {

  },
  analyse() {
    console.log(this.data)
  },
  showPicker(e) {

    wx.showPicker({
      title: "嘿嘿嘿",
      change: (index) => {
        console.log(index)
      },
      success: (index) => {
        console.log(index)
      }
    })

  }
})