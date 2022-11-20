// ../demo/utils/util.js
Page.id = "3";
var formatTime = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [year, month, day].map(formatNumber).join("/") + " " + [hour, minute, second].map(formatNumber).join(":");
};
var formatNumber = (n) => {
  const s = n.toString();
  return s[1] ? s : "0" + s;
};

// ../demo/pages/logs/logs.js
Page.id = "3";
var app = getApp();
Page({
  data: {
    logs: []
  },
  onLoad() {
    this.setData({
      logs: (wx.getStorageSync("logs") || []).map((log) => {
        return {
          date: formatTime(new Date(log)),
          timeStamp: log
        };
      })
    });
  }
});


