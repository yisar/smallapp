import { a } from './a.js'
import d from './a.js'

function b() {
  a()
}
b()

const app = getApp()

Page({
  data: {
    url: "",
    gacha_type: 1, // 1 常驻 2 新手池 11 限定卡池
    count: 0,
    five: []
  },
  changeUrl(e) {
    this.setData({
      url: e.detail.value
    })
  },
  radioChange(e) {

  },
  analyse() {
    // https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?gacha_type=11&authkey_ver=1&default_gacha_type=1&lang=zh-cn&authkey=EGWjU%2BK2jFTOmgkC9%2FcS4y1b1X5FJkFOxNJXOd1CiQ%2BU7V1hLp8mzX6qsWYWoUvFiPRiREclt5LcMIkWo4Ugvvt574HIzlfWnEK72620SOzO130Zkm%2BO1d9IOv9PtiVR7NBQYw93PsOf9Kqp6PAmWI1MGlgKlkrcMcWGS8LfDck3ctWD96EbfZzZjrHQoeJFlqGJCoEvCsjYzq5deg56Z1AtOn2ZsuQjeSOoL%2BbzEFuNu14Av0kUdY%2FOIyvvAEoaWJ4fa6sWzs1YAjHngkWxcl3L3lfPiqDHz%2B%2BFxU4TzWc9v5v%2BOzg1rD775xLSG%2F73o%2F%2BGfOHODFlDoXTiiE0wz4P0xzpnbel6n2Tb8LyOV7GP6lCu4AdnDnTO%2BRqJfFlBHWRNmTWx1oEXzckxPcIZZnpGo5g9GvO4IDbdVwxLj5hc74P0YQFK2MiVdOUgkMF1LT0HnFO4mWlY0Sbn6kfOHIeP%2FQ8DG6hCRcMRqIpDFgw%2Bl8sES7VCLuQAIaoDMSMmdAh1j8k5Wrju21%2FfyIlp8lsQPWBscSFD3wEAsoTGvKru96OuKmLQlMYq%2BQ7qJd34RUqYaoBs2Hzp5Cv%2BMHrk4VdOsUcFOgk7AwZC6c%2BPTVip1n2Est06s7drOr0At8BTyMdxNRNQzAOhP5BaRVZxta9MX%2FfEb1jYeROHxXaoeHA%3D&game_biz=hkrpg_cn&page=1&size=20
    const search = new URL(this.data.url).search
    const api = 'https://miniapp.deno.dev/xingtie_chouka' + search + `&gacha_type=${this.data.gacha_type}&size=20&page=${this.data.page}`
    wx.request(api).then(res => {
      for (const v in res.data.list) {
        if (v.rank_type === 5) {
          this.setData({
            five: this.five.concat([v, this.data.count])
          })
        } else {
          this.setData({
            count: this.data.count + 1
          })
        }
      }

      this.setData({
        page: this.data.page + 1
      })
    })
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