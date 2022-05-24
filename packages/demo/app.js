App({
  onLaunch: () => {
    const logs = wx.getStorageSync("logs") || [];
    logs.unshift(Date.now());
    wx.setStorageSync("logs", logs);
    wx.navigateTo({
      url: "/pages/index/index",
    });
  },
});
