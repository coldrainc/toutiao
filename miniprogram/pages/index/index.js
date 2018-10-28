// miniprogram/pages/my/my.js
const db = wx.cloud.database()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      hidden: false,
      hiddenLoading: false, 
      hasMore: true,
      news: [],
      count: 1,
    },
     /**
     * 从数据库获取每次要求获取的数据并保存到data.news中
     */
    getDatas: function() { // 获取新闻
      let count = this.data.count
      wx.cloud.callFunction({
        name: 'getData',
        data: {
          count
        }
      }).then(res => {
        // console.log(res)
        let news = this.data.news
        let data = res.result.data
        for(let i = 0; i < data.length; i++) {
          news.push(data[i])
        }
        this.setData({
          hiddenLoading: true,
          news: news,
          count: count+1
        })
      })
    },
    onChange(event) { // 获取tab改变事件来使获取不同主题的新闻
      console.log(event)
      // wx.showToast({
      //   title: `切换到标签 ${event.detail.index + 1}`,
      //   icon: 'none'
      // });
    },
    getTopping: function() { // 获取置顶的新闻 
      wx.cloud.callFunction({
        name: 'getTopping'
      }).then(res => {
        let top = res.result.data[0]
        // console.log(top)
        this.setData({
          topTitle: top.title,
          topContent: top.content,
          images: top.images,
          topComment: top.comments,
          topAuthor: top.author,
          topDate: top.date
        })
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getTopping()
      this.getDatas()
    },
  
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
  
    },
  
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
  
    },
  
  
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
      wx.showToast({
        title: '推荐中',
        image: '../../image/加载.png'
      })
      wx.cloud.callFunction({
        name: 'getData',
        data: {
          count: 1
        }
      }).then(res => {
        // console.log(res)
        let news = this.data.news
        let datas = res.result.data
        let data = datas.concat(news)
        this.setData({
          hiddenLoading: true,
          news: data,
        })
      })
    },
  
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      wx.showToast({
        title: '加载更多',
        image: '../../image/加载.png'
      })
      this.getDatas()
    },
  
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
      
    }
  })