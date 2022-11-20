const app = getApp()

Page({
  data: {
    items: [
      { name: "USA", value: "美国" },
      { name: "CHN", value: "中国", checked: "true" },
      { name: "BRA", value: "巴西" },
      { name: "JPN", value: "日本" },
      { name: "ENG", value: "英国" },
      { name: "TUR", value: "法国" },
    ],
  },
  radioChange(e) {
    console.log("radio发生change事件，携带value值为：", e.detail.value)
  },
  showPicker(e) {
    wx.showPicker({
      title: "嘿嘿嘿",
      change: (index) => {
        console.log(index)
      },
      success: (index) => {
        console.log(index)
      },
    })
  },
  showToast(e) {
    wx.showToast({ title: '啦啦啦' })
  }
})
