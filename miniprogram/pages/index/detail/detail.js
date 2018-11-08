var WxParse = require('../../../wxParse/wxParse.js');
wx.cloud.init()
const db = wx.cloud.database()
const photos = db.collection('photos')
const comments = db.collection('comments')
// wx.cloud.init();
// var db = wx.cloud.database()
// var collection = db.collection('news')
// 此处碰到的问题可以在写文章的时候也提一下，
// 直接在page的js文件中获取的数据有权限问题
// 需要将需要获取的集合的权限改为所有人才能获取， 或者用云函数获取需要带的集合
Page({

  /**
   * 页面的初始数据
   */
  data: {
    article: '',
    new_id: '',
    detail: '',
    like: 0,
    collect: false,
    show_popup: false,
    input_show: false,
    input_popup: false,
    checked: false,
    focus: false,
    icon: {
      normal: '../../../image/repeat.png',
      active: '../../../image/selected.png'
    },
    selected: false,
    color: '',
    submit: false,
  },
  getDetail: function() { // 获取详情需要展示的信息
    let new_id = this.data.new_id;
    let like = Math.floor(Math.random() * 100);
    // console.log(new_id)
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        new_id: new_id
      }
    }).then(res => {
      // console.log(res);
      let data = res.result.data[0];
      // console.log(data)
      this.setData({
        detail: data,
        like: like
      })
    })
    comments.where({
      new_id: new_id
    }).get({
      success: (res) => {
        let comm = res.data[0].comments;
        console.log(comm)
        this.setData({
          comms: comm
        })
      }
    })
    // console.log(this.data.detail)
  },
  selected: function() {
    let selected = this.data.selected;
    this.setData({
      selected: !selected
    })
  },
  inputContent: function() { // 点击输入框和图标控制是否弹出
    this.setData({
      input_popup: !this.data.input_popup,
      input_show: !this.data.input_show,
      focus: true
    })
  },
  bindKeyInput: function(e) { // 获取输入框的值，有值的话将改变按钮的颜色
      // console.log(e)
    if(e.detail.value){
      this.setData({
        inputValue: e.detail.value,
        color: '#1080C4',
        submit: true
      })
    }else{
      this.setData({
        color: 'color: rgb(187, 177, 177);',
        submit: false
      })
    }
  },

  submit: function() { // 实现评论功能，将发布的评论同步点到数据
    let value = this.data.inputValue;
    let new_id = this.data.new_id;
    // let new_id = '6594157273642172936'
    comments.where({
      new_id: new_id
    }).get({
      success: (res) => {
        // console.log(res)
        let comms= res.data[0].comments;
        let people = {
          content: value,
          like: 0
        }
        comms.unshift(people);
        // console.log(comm)
        this.setData({
          comms: comms
        })
        wx.cloud.callFunction({
          name: 'updateComments',
          data: {
            new_id: new_id,
            comms: comms
          }
        }).then(res =>{
          console.log(res)
        })
        // console.log(new_id, comm)
        // comments.where({
        //   new_id: new_id
        // }).update({
        //   data:{
        //     comments: comm
        //   },
        //   success: (res) => {
        //     console.log(res)
        //   }
        // })
        
        // console.log(comments)
      }
    })
  },
  addLike: function(e) { // 点击点赞图标增加点赞数同时保存到数据库
    let like = e.currentTarget.dataset.item;
    let new_id = this.data.new_id;
    // console.log(e)
    let comms = this.data.comms;
    comms[like].like = comms[like].like + 1;
    this.setData({
      comms: comms
    })
    // console.log(comms)
    wx.cloud.callFunction({
      name: 'updateComments',
      data: {
        new_id: new_id,
        comms: comms
      }
    }).then(res =>{
      console.log(res)
    })
  },
  selectEmoji: function() { // 点击emoji图标显示选择emoji框

  },
  clickComment: function() { // 跳到当前页面的评论区
    this.setData({
      toView: 'test'
    })
    console.log(this.data.toView)
  },
  clickCollect: function() {// 是否收藏文章
    let collect = this.data.collect;
    this.setData({
      collect: !collect
    })
  },
  clickShare: function() { // 分享弹出框
    let show_popup = this.data.show_popup;
    this.setData({
      show_popup: !show_popup
    })
  },
  onChange(event) { // 发布评论时复选框
    this.setData({
      checked: event.detail
    });
  },
  upload: function() {
    // 手机 摄像头 相册
    // IOS Android， 小程序，
    wx.chooseImage({
      count: 4, // 最多可以选择的图片张数，默认9
      sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
      success: function(res){
        // success
        // console.log(res);
        const tempFilePaths = res.tempFilePaths;
        // 文件上传的流程
        for(let i = 0; i < tempFilePaths.length; i++){
          // 1. 取一个不会重复的文件名 一般使用时间戳
          let randString = Math.floor(Math.random() * 1000000) + '.png';
          console.log("tempFile " + tempFilePaths)
          wx.cloud.uploadFile({
            cloudPath: randString,
            filePath: tempFilePaths[i],
            success: res => {
              // console.log(res);
              photos.add({
                data: {
                  image: res.fileID
                }
              }).then(res => {
                wx.showToast({
                  title: '上传成功',
                  icon: 'success'
                })
              })
            },
            fail: console.err
          })
        }
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })
  },
  getValue: function(e) {
    console.log(e);
  },
  setpop: function() {
    this.setData({
      input_popup: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    // setTimeout(() => {
    //   this.setData({
    //     toView: 'test'
    //   })
    //   console.log('dfdfsdf');
    // }, 2000);
    // console.log(options)
    this.setData({
      new_id: options.contentId
    });
    // console.log(this.data.new_id)
    this.getDetail();
    // console.log(this.data.detail)
    // var that = this;
    // var article = this.data.article;
    // wx.request({
    //   url: options.contentId,
    //   method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    //   // header: {}, // 设置请求的 header
    //   // header:{
    //   //   "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36",
    //   //   "Accept": "text/html,application/xhtml+xml,application/xml; q=0.9,image/webp,*/*;q=0.8"
    //   // },
    //   header: {
    //     'user-agent': 'Mozilla / 5.0(Windows NT 10.0; WOW64) AppleWebKit / 537.36(KHTML, likeGecko) Chrome / 53.0.2785.104Safari / 537.36Core / 1.53.4882.400QQBrowser / 9.7.13059.400',
    //     'Accept': "text/html,application/xhtml+xml,application/xml; q=0.9,image/webp,*/*;q=0.8"
    //   },
    //   success: function(res){
    //     // success
    //     // console.log(res);
    //     var Reg = /index-middle">(.*?)<div ad-cursor/g;
    //     var artical = res.data;
    //     var patt = Reg.test(artical);
    //     // console.log(options.contentId)
    //     console.log(artical)
    //     // console.log(patt);
    //     // WxParse.wxParse('article', 'html', artical, that, 5)
    //   },
    //   fail: function() {
    //     // fail
    //   },
    //   complete: function() {
    //     // complete
    //   }
    // })
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
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('获取更多评论');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})