// miniprogram/pages/my/my.js
wx.cloud.init();
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
      counter: 1,
      cnews: [],
      show: false,
      actives: {
        0: false,
        1: false,
        2: false,
        3: false,
        4: false,
        5: false
      },
      active: '1',
      focus: false,
      placeholder: '请输入想要搜索的内容',
      num: 0,
      datas: {}
    },
     /**
     * 从数据库获取每次要求获取的数据并保存到data.news中
     */
    getDatas: function(collection) { // 从数据库获取新闻信息获取新闻
      let count = this.data.count
      wx.cloud.callFunction({
        name: collection,
        data: {
          count
        }
      }).then(res => {
        // console.log(res)
        let news = this.data.news
        let data = res.result.data
        // console.log(data)
        for(let i = 0; i < data.length; i++) {
          // console.log(data[i].date)
          data[i].date = data[i].date.slice(0, 10)
          news.push(data[i])
          // console.log(data[i].images)
          this.imgCheck(data[i].images, data.new_id, 'news')
        }
        this.setData({
          hiddenLoading: true,
          news: news,
          count: count+1
        })
      })
    },
    imgCheck: function(images, new_id, title) { // 检查图片是否和合法
      // console.log(images)
      wx.cloud.callFunction({
        name: 'imgCheck',
        data: {
          images
        }
      }).then(res => {
        // console.log(res);
        // console.log(JSON.parse(res.result.body))
        let result = JSON.parse(res.result.body);
        let results = result.result_list;
        // console.log(results.result_list)
        // console.log(results)
        if(results){
          for(res of results) {
            if(res.data.result == 1){
              // console('is porn image');
              db.collection(title).doc({
                new_id: new_id
              }).remove({
                success: function(res) {
                  wx.showToast({
                    title: '由于文章内含有非法信息已被删除!'
                  })
                }
              })
            }
          }
        }
      })
    },
    module: function(title) {
      let counter = this.data.counter
      // console.log(title)
      wx.cloud.callFunction({
        name: 'module',
        data: {
          counter: counter,
          title: title
        }
      }).then(res => {
        // console.log(res)
        let cnews = this.data.cnews
        let data = res.result.data
        // console.log(data)
        for(let i = 0; i < data.length; i++) {
          // console.log(data[i].date)
          data[i].date = data[i].date.slice(0, 10)
          cnews.push(data[i])
          this.imgCheck(data[i].images, data.new_id, title)
        }
        // console.log(data)
        this.setData({
          hiddenLoading: true,
          cnews: cnews,
          counter: counter+1
        })
      })
    },
    onChange(event) { // 获取tab改变事件来使获取不同主题的新闻
      // console.log(event)
      // console.log(this.data.active.one);
      let index = event.detail.index;
      let title = event.detail.title;
      let active = this.data.actives[index];
      let setting = 'actives['+index+']';
      if(!active){
        this.setData({
          hiddenLoading: false,
          [setting]: true,
          cnews: []
        })

        if(title == "财经"){
          this.module('finance')
        }else if(title == "股票"){
          this.module('stock')
        }else if(title == "军事"){
          this.module('military')
        }else{
          this.getDatas("getData")
        }
      }
      // console.log(active)
      // console.log(this.data.actives);
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
          topDate: top.date.slice(0,10)
        })
      })
    },
    showDetail: function(e) { // 点文章显示文章详情
      let item = e.currentTarget.dataset.item;
      // console.log(e)
      wx.navigateTo({
        url:`../detail/detail?contentId=${item}`
      })
    },
    showMore: function(e){
      let show = this.data.show
      this.setData({
        show: !show
      })
    },
    navigateToSearch: function() {
      // wx.navigateTo({
      //   url: '../search/search'
      // })
      let num = this.data.num;
      let datas = this.data.datas[0];
      // console.log(datas[0])
      if(num == 5) {
        this.setData({
          num: 0
        })
        num = 0
      }
      this.setData({
        placeholder: datas[num],
        num: num + 1
      })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      this.getTopping()
      this.getDatas("getData")
      db.collection('hots').get()
        .then(res => {
          this.setData({
            datas: res.data
          })
          // console.log(res.data[0])
        });
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
    onPullDownRefresh: function () { // 监听下拉动作来获取最新新闻信息
      wx.showToast({
        title: '推荐中',
        image: '../../../image/加载.png'
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
    onReachBottom: function () { // 上拉显示更多新闻
      wx.showToast({
        title: '加载更多',
        image: '../../../image/加载.png'
      })
      this.getDatas("getData")
    },
  
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
      
    }
  })