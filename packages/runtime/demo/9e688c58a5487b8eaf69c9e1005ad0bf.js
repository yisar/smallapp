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
    type: 0,
    count: 0,
    page: 1,
    end_id: 0,
    five: [],
    role: "\u672A\u51FA",
    map: {
      0: "\u9650\u5B9A\u5361\u6C60",
      1: "\u5E38\u9A7B\u5361\u6C60",
      2: "\u65B0\u624B\u5361\u6C60"
    },
    title: ""
  },
  changeUrl(e) {
    this.setData({
      url: e.detail.value
    });
  },
  radioChange(e) {
  },
  async analyse() {
    const search = new URL(this.data.url).search;
    let type = this.data.type;
    if (type === 0) {
      type = 11;
    }
    const api = "https://miniapp.deno.dev/xingtie_chouka" + search + `&gacha_type=${type}&size=20&page=${this.data.page}&end_id=${this.data.end_id}`;
    const data = await wx.request(api);
    const list = data.data.list;
    for (const v of list) {
      if (v.rank_type === "5") {
        const role = this.data.role;
        this.setData({
          role: v.name,
          five: this.data.five.concat([[role, this.data.count + 1]]),
          count: 0
        });
      } else {
        this.setData({
          count: this.data.count + 1
        });
      }
    }
    if (list.length < 5) {
      if (this.data.type >= 2) {
        console.log("\u5206\u6790\u7ED3\u675F");
      } else {
        const role = this.data.role;
        this.setData({
          role: "\u672A\u51FA",
          five: this.data.five.concat([[role, this.data.count + 1]]),
          count: 0
        });
        this.medal();
      }
    } else {
      this.setData({
        page: this.data.page + 1,
        end_id: list[list.length - 1].id
      });
      await new Promise((r) => setTimeout(() => {
        r();
      }, 1e3));
      await this.analyse();
    }
  },
  medal() {
    const nums = this.data.five.map((i) => i[1]);
    const realNums = nums.slice(1);
    const average = realNums.reduce((a2, b2) => a2 + b2) / realNums.length;
    let title = "";
    if (average > 80) {
      title = "\u7EC8\u6781\u65E0\u654C\u81F3\u5C0A\u975E\u914B\u738B";
    } else if (average > 70) {
      title = "\u975E\u914B\u738B";
    } else if (average > 60) {
      title = "\u5927\u975E\u914B";
    } else if (average > 50) {
      title = "\u5C0F\u975E\u914B";
    } else if (average > 40) {
      title = "\u5C0F\u6B27\u7687";
    } else if (average > 30) {
      title = "\u5927\u6B27\u7687";
    } else if (average > 20) {
      title = "\u6B27\u7687\u738B";
    } else {
      title = "\u7EC8\u6781\u65E0\u654C\u81F3\u5C0A\u6B27\u7687\u738B";
    }
    this.setData({
      title
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


