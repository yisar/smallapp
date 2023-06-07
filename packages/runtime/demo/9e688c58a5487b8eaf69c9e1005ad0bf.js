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
    url: "",
    gacha_type: 1,
    count: 0,
    five: []
  },
  changeUrl(e) {
    this.setData({
      url: e.detail.value
    });
  },
  radioChange(e) {
  },
  analyse() {
    const search = new URL(this.data.url).search;
    const api = "https://miniapp.deno.dev/xingtie_chouka" + search + `&gacha_type=${this.data.gacha_type}&size=20&page=${this.data.page}`;
    wx.request(api).then((res) => {
      for (const v in res.data.list) {
        if (v.rank_type === 5) {
          this.setData({
            five: this.five.concat([v, this.data.count])
          });
        } else {
          this.setData({
            count: this.data.count + 1
          });
        }
      }
      this.setData({
        page: this.data.page + 1
      });
    });
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
Component.id = "7";
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
Component.pid = "7";
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


