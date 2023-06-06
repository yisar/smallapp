// demo/pages/index/a.js
Page.id = "2";
function a() {
  console.log(123);
}

// demo/pages/index/index.js
Page.id = "2";
function b() {
  a();
}
b();
var app = getApp();
Page({
  data: {
    items: [
      { name: "USA", value: "\u7F8E\u56FD" },
      { name: "CHN", value: "\u4E2D\u56FD", checked: "true" },
      { name: "BRA", value: "\u5DF4\u897F" },
      { name: "JPN", value: "\u65E5\u672C" },
      { name: "ENG", value: "\u82F1\u56FD" },
      { name: "TUR", value: "\u6CD5\u56FD" }
    ]
  },
  radioChange(e) {
    console.log("radio\u53D1\u751Fchange\u4E8B\u4EF6\uFF0C\u643A\u5E26value\u503C\u4E3A\uFF1A", e.detail.value);
  },
  showPicker(e) {
    wx.showPicker({
      title: "\u563F\u563F\u563F",
      change: (index) => {
        console.log(index);
      },
      success: (index) => {
        console.log(index);
      }
    });
  }
});


// demo/pages/item/index.js
Component.id = "10";
Component.pid = "2";
Component.tag = "use-item";
var app = getApp();
Component({
  properties: {
    iitem: {
      type: Object,
      value: {}
    }
  },
  methods: {
    clickIco(e) {
      console.log(123);
      this.triggerEvent("myevent", e);
    },
    clear(e) {
      this.triggerEvent("clear", e);
    }
  },
  lifetimes: {
    attached: function() {
      console.log(233);
    },
    detached: function() {
    }
  }
});


// demo/pages/kid/index.js
Component.id = "14";
Component.pid = "10";
Component.tag = "child-child";
Component({
  properties: {},
  data: {},
  methods: {
    emmm() {
      this.triggerEvent("eee");
    }
  }
});


