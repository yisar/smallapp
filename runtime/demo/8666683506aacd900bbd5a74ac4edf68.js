// ../demo/pages/child/index.js
Page.id = "3";
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
  }
});


