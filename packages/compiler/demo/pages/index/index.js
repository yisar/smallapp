import { a } from './a.js'
import d from './a.js'
import { wx } from '../../../../runtime/master/wxapi.js'

function b() {
  a()
}
b()

const app = getApp()

Page({
  data: {
    url: "",
    type: 0, // 1 常驻 2 新手池 11 限定卡池
    count: 0,
    page: 1,
    end_id: 0,
    five: [],
    role: "未出",
    map: {
      0: '限定卡池',
      1: '常驻卡池',
      2: '新手卡池'
    },
    title: ""
  },
  changeUrl(e) {
    this.setData({
      url: e.detail.value
    })
  },
  radioChange(e) {

  },


  async analyse() {
    // https://api-takumi.mihoyo.com/common/gacha_record/api/getGachaLog?gacha_type=11&authkey_ver=1&default_gacha_type=1&lang=zh-cn&authkey=EGWjU%2BK2jFTOmgkC9%2FcS4y1b1X5FJkFOxNJXOd1CiQ%2BU7V1hLp8mzX6qsWYWoUvFiPRiREclt5LcMIkWo4Ugvvt574HIzlfWnEK72620SOzO130Zkm%2BO1d9IOv9PtiVR7NBQYw93PsOf9Kqp6PAmWI1MGlgKlkrcMcWGS8LfDck3ctWD96EbfZzZjrHQoeJFlqGJCoEvCsjYzq5deg56Z1AtOn2ZsuQjeSOoL%2BbzEFuNu14Av0kUdY%2FOIyvvAEoaWJ4fa6sWzs1YAjHngkWxcl3L3lfPiqDHz%2B%2BFxU4TzWc9v5v%2BOzg1rD775xLSG%2F73o%2F%2BGfOHODFlDoXTiiE0wz4P0xzpnbel6n2Tb8LyOV7GP6lCu4AdnDnTO%2BRqJfFlBHWRNmTWx1oEXzckxPcIZZnpGo5g9GvO4IDbdVwxLj5hc74P0YQFK2MiVdOUgkMF1LT0HnFO4mWlY0Sbn6kfOHIeP%2FQ8DG6hCRcMRqIpDFgw%2Bl8sES7VCLuQAIaoDMSMmdAh1j8k5Wrju21%2FfyIlp8lsQPWBscSFD3wEAsoTGvKru96OuKmLQlMYq%2BQ7qJd34RUqYaoBs2Hzp5Cv%2BMHrk4VdOsUcFOgk7AwZC6c%2BPTVip1n2Est06s7drOr0At8BTyMdxNRNQzAOhP5BaRVZxta9MX%2FfEb1jYeROHxXaoeHA%3D&game_biz=hkrpg_cn&page=1&size=20
    const search = new URL(this.data.url).search
    let type = this.data.type
    if (type === 0) {
      type = 11
    }
    const api = 'https://miniapp.deno.dev/xingtie_chouka' + search + `&gacha_type=${type}&size=20&page=${this.data.page}&end_id=${this.data.end_id}`
    const data = await wx.request(api)
    const list = data.data.list
    for (const v of list) {
      if (v.rank_type === '5') {
        const role = this.data.role
        this.setData({
          role: v.name,
          five: this.data.five.concat([[role, this.data.count + 1]]),
          count: 0,
        })
      } else {
        this.setData({
          count: this.data.count + 1
        })
      }
    }

    if (list.length < 5) {
      // console.log(`常驻池分析完毕，开始分析${map[this.data.type]}`)
      if (this.data.type >= 2) {
        console.log('分析结束')
      } else {
        const role = this.data.role
        this.setData({
          role: '未出',
          five: this.data.five.concat([[role, this.data.count + 1]]),
          count: 0,
        })

        this.medal()
      }
    } else {
      this.setData({
        page: this.data.page + 1,
        end_id: list[list.length - 1].id
      })

      await new Promise(r => setTimeout(() => {
        r()
      }, 1000))

      await this.analyse()
    }
  },

  medal() {
    const nums = this.data.five.map(i => i[1])
    const realNums = nums.slice(1)
    const average = realNums.reduce((a, b) => a + b) / realNums.length;

    let title = ''

    if (average > 80) {
      title = '终极无敌至尊非酋王'
    } else if (average > 70) {
      title = '非酋王'
    } else if (average > 60) {
      title = '大非酋'
    } else if (average > 50) {
      title = '小非酋'
    } else if (average > 40) {
      title = '小欧皇'
    } else if (average > 30) {
      title = '大欧皇'
    } else if (average > 20) {
      title = '欧皇王'
    } else {
      title = '终极无敌至尊欧皇王'
    }
    this.setData({
      title,
    })

  },
  toast() {
    wx.showToast({
      title: 'qq群975551446',
      success: () => {
        console.log('success')
      }
    })
  }
})