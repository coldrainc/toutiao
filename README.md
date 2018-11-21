# 微信下程序云开发

    头条案例
![小程序](https://user-gold-cdn.xitu.io/2018/11/18/16724889e9ac15e2?w=546&h=287&f=jpeg&s=26044)
&nbsp;&nbsp;&nbsp;&nbsp;最近自己正做一个小程序，是基于小程序云开发的，在做小程序项目的时候使用云开发确实方便是很多。有关于云开发后面我也会讲到，毕竟这个项目就是使用的云开发，更多的有关云开发内容有需要的小伙伴可以去看官方文档，
<a href="https://www.baidu.com/link?url=2hcmAcemVSOn8U7zwwX7FTlBU4Hy7aEXtFBCmCL7qpv9WhMqF4EFMzDGaD1WouxtubKMN-Ngyy5tkiH3SO_jItszHh41pGymupsfSJ6Ovxam8GADfmC2CCSS_6ABMGbT&wd=&eqid=c526facf0006b1c9000000065be525ec" title="Title">云开发文档</a>。
<br>
&nbsp;&nbsp;&nbsp;&nbsp;项目的开发也有一段时间了虽然只是实现了部分功能，但是我还是忍不住来写篇文章来分享一下这段时间的成果和项目中遇到的问题，后面我也会逐步的完善项目。项目源码在github上，如果小伙伴们觉得不错可以给个star，<a href="https://github.com/chenyuhan1/toutiao">仿头条项目地址</a>。<br>
### 项目详解
&nbsp;&nbsp;&nbsp;&nbsp;下面将详细的介绍项目，虽然使用的云开发节省了很多时间但是前后端的东西都需要做工作量有点大，在这短时间内我没有完成整个项目，只是实现了首页，详情页，和登录页等主要功能<br>
&nbsp;&nbsp;&nbsp;&nbsp;我首先将界面需要获取数据的地方设计好数据库为后面数据的获取做准备，数据库使用的是小程序云开发的MongoDB数据库，将数据存储在云数据库上，并且使用云函数来操作数据库
#### 新闻首页
&nbsp;&nbsp;&nbsp;&nbsp;首页相对于详情页要简单一些，在头部使用了一个搜索框和搜索按钮，然后下面是一个tab标签栏含有多个标签页，每一个标签页显示标签对应有关的新闻信。在标签页的右边有一个按钮，点击按钮会出现一个弹出框。这里有个特别的地方，就是在推荐页的顶部设置了一个置顶的新闻<br>

![](https://user-gold-cdn.xitu.io/2018/11/12/1670608302241c64?w=321&h=550&f=png&s=103573)
&nbsp;&nbsp;&nbsp;&nbsp;输入框绑定了一个tap事件，使得在点击输入框但不输入值的时候改变placeholder的值。<br>
&nbsp;&nbsp;&nbsp;&nbsp;在tab栏的右边有一个按钮点击按钮将会出现一个弹出层，前面的gif中有演示，是新闻种类的选择框，点击关闭按钮可以关闭弹出层<br>
&nbsp;&nbsp;&nbsp;&nbsp;最后就是首页最重要的新闻显示页面了，为了节省项目的时间，这里使用了有赞的框架vant-weapp有兴趣的小伙伴可以去了解下。在tab标签栏设置了6个标签页，但是只会显示4个标签页想要显示其他的可以左右拖动标签栏，这里将推荐页设置为了默认激活的。由于每个每个标签页代码基本都相同的，只是在推荐页是的第一栏是置顶信息，还有就是获取的数据不同，有关数据获取在下面介绍代码将会细讲，为了提高代码的复用，这里使用了模板，将复用的代码写在写在另外的文件下，使用时直接调用就可以了。<br>
&nbsp;&nbsp;&nbsp;&nbsp;每个标签对应都创建了一个集合，这里我为置顶新闻也另外创建了一个集合，并且给每条信息设计好需要用的字段方便自己获取数据和使用数据，由于云数据库是可以导入json文件或者csv文件，并且每个新闻也都需要上拉加载数据需要更多的数据，自己造数据费时间又麻烦，所以我这里自己写了爬虫爬取自己需要的数据并保存到json文件中，直接将数据导入到数据库中。<br>
&nbsp;&nbsp;&nbsp;&nbsp;这样设计数据库也是使得从数据库获取数据方便了一些。写一个module函数就可以获取每个标签的数据。<br>
每条数据的字段如下，其中news_id起到很重要的作用，将首页的每条新闻和对应的详情页面联系起来。
![](https://user-gold-cdn.xitu.io/2018/11/13/1670d9c7b2210250?w=915&h=387&f=png&s=45250)
&nbsp;&nbsp;&nbsp;&nbsp;在每一个标签页使用模板，并且设置了一个data（给不同页面传入需要显示的对应新闻信息，用于在页面显示），由于默认激活页面是推荐页所以在onload事件触发时将默认加载推荐页的数据，同时将推荐页设置为已被激活页面，数据加载这里写了一个加载函数
```
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
    }
```
传入一个title就是当前显示的标签的标题，默认的是推荐，使用一个counter计数，每次只会加载5条新闻条数据，从数据库获取新闻的信息是由一个云函数来解决的
```
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    return await db.collection(event.title).skip((event.counter-1)*5).limit(5).get()
}
```
给云函数传入两个数据，一个是title就是从对应集合获取信息，还有一个就是counter用来计算获取信息的位置，因为，在向上拉取加载更多新闻的时候需要加载数据，我这里设置每次加载5条数据，所以传递给云函数一个counter，每次调用了云函数从与数据库获取一次数据counter就会+1，从而使得每次上拉加载数据时忽略已经加载的数据从后面加载数据。每次加载数据都会更新一次保存数据的数组，在主页的index.wxml页面将会判断并获取数据使用一个for循环将数据显示到对应的标签页<br>
在置顶新闻那部分在数据获取的数据其实也没很特别，我只是将置顶新闻集合中最新的新闻从云数据库拿下来，然后展示页面中<br>
这里也实现了下拉刷新，使用了小程序的onPullDownRefresh函数下拉刷新将会获取最新的数据，并且将最新的数据插显示在最上部分，由于每次下拉需要插入数据到集合的前面，所以我这里显示不明显<br>
```
  onPullDownRefresh: function () { // 监听下拉动作来获取最新新闻信息
      wx.showToast({
        title: '推荐中',
        image: '../../../image/加载.png'
      })
      let title = this.data.title;
      wx.cloud.callFunction({
        name: 'module',
        data: {
          counter: 1,
          title: title
        }
      }).then(res => {
        // console.log(res)
        let cnews = this.data.cnews
        let datas = res.result.data
        let data = datas.concat(cnews)
        this.setData({
          hiddenLoading: true,
          cnews: data,
        })
      })
    }
```
在module函数有使用了一个图片鉴黄功能，使用了腾讯的一个图片识别接口，毕竟不是什么图片都能显示出来，所以写了一个imgCheck函数来检测每一条新闻的所有图片，当图片不合格的时候则将这条新闻删除。我没有使用图片去测试，更不可能展示出来是吧，相信大家都懂（猥琐笑）。<br>
<br>
当不同标签页进行切换的时候会有一个onchange事件，onchange事件会获得title和index。并且将onchange之后的数据保存到一个数组中，在onchange事件里面使用module函数来获取对应的title的数据并且判断这条数据是否是最近加载过的，如果是上次onchange事件加载过的函数将会显示上次事件保存的数据，在wxml中也会判断是否是上次激活的页面来显示对应的数据。<br>
&nbsp;&nbsp;&nbsp;&nbsp;前面一直再讲后端的东西，我也这篇文章也是为了讲云开，说实话有了云开发真的方便了很多，一个人就可以搞定前后端的东西。不过为了方便大家的理解，我还是讲一下界面的内容。<br>
&nbsp;&nbsp;&nbsp;&nbsp;既然前都已经将数据拿过来了，最后要做的就是将数据展示出来了，每条数据
```
<van-tab title="推荐" >
      <!-- 推荐tab标签页的置顶新闻框  每一个新闻框可以点击进入到详情页-->
      <van-panel class="topping" title="{{topTitle}}" status="置顶" use-footer-slot bind:tap="showTopDetail" data-item="{{topNew_id}}">
        <view class="images">
            <image src="{{images[0]}}" />
            <image src="{{images[1]}}" />
            <image src="{{images[2]}}" />
          </view>
          <view solt="footer" class="footer">
            <view class="author">{{topAuthor}}</view>
            <view class="comment">评论{{topComment}}</view>
            <view class="Date">{{topDate}}</view>
          </view>
      </van-panel>

      <template is="container" data="{{news: active1 == 'news'?news:cnews, hiddenLoading}}"></template>
    </van-tab>
```

```
<template name="container">
    <view class="container">
        <loading hidden="{{hiddenLoading}}"></loading>
        <view class="news" wx:for="{{news}}" wx:for-item="info" wx:key="info.new_id">
            <van-panel class="new" title="{{info.title}}" bind:tap="showDetail" use-footer-slot data-item="{{info.new_id}}">
                <view class="images" wx:if="{{info.images.length > 0}}">
                    <image src="{{info.images[0]}}"/>
                    <image src="{{info.images[1]}}"/>
                    <image src="{{info.images[2]}}"/>
                </view>
                <view solt="footer" class="footer">
                    <view class="author">{{info.author}}</view>
                    <view class="comment">评论{{info.comments}}</view>
                    <view class="Date">{{info.date}}</view>
                </view>
            </van-panel>
        </view>
    </view>
</template>
```
这里用的就是MVVM思想，将数据绑定到UI界面，在js文件中获取到数据后，这里将数据拿过来使用。<br>
这里由于每条新闻的图片数量是不确定的，并且最多只显示三张图片。所以直接固定了3个image标签并且固定了image的大小，当图片没有的时候就不会显示图片。
#### 详情页
很多在首页讲过的东西我在详情页也就不再多说了，大家有不懂可以去看源码，毕竟讲那么多废话就是浪费时间，我尽量挑出最精彩的部分来写。
![](https://user-gold-cdn.xitu.io/2018/11/14/167105ac17197a8b?w=347&h=621&f=gif&s=3874261)
在首页的每一条新闻都绑定了一个跳转tap事件，当点击新闻后将会跳转到详情页，并且将新闻的id和title作为参数传给详情页。<br>
```
  showDetail: function(e) { // 点文章显示文章详情
      let item = e.currentTarget.dataset.item;
      let title = this.data.title;
      // console.log(e)
      wx.navigateTo({
        url:`../detail/detail?contentId=${item}&title=${title}`
      })
    }
```
在点击跳转到详情页后，将会在onload的事件中获取到对应的新闻id，并将id存到data里面。由于在爬取详情页的时候没有爬下来，所以我随便将一些简单的内容放在content里面。

详情页这部分我将页面分为了内容部分和评论。然后还有就是使用了一个fixed将输入框等按钮固定在屏幕底部<br>
&nbsp;&nbsp;&nbsp;&nbsp;内容部分又分为了四部分，分别是标题部分，作者头像和昵称，内容部分，点赞转发部分。

第二部分为显示像和昵称我使用了一个flex的浮动布局将并且将昵称部分的flex设置为1使得头像和关注按钮分别在两边。头像使用了一个image标签并且将image标签的大小固定，毕竟用户上传的图片肯定大小不一样。第四部分只要使用4个view在把图片和内容放进去再使用一个flex布局就可以搞定。<br>
既然界面布局已经搞定现在就是要拿数据了，在点击新闻进入来详情页的时候会的到新闻的id和title，这样可以通过唯一id（每条doc的id）的和title（集合的名字）从云数据库拿出对应新闻数据。这里代码就不贴出来了，跟前面首页的差不多，有需要的可以去github看源码。<br> 

接下来就是评论部分的内容了，个人认为这个地方还是挺有趣而且在更新数据库的时候还有权限问题，前面没有讲这个问题就是打算放到评论部分一起来讲。
在页面的底部固定了一个评论框，包含输入框，跳转到评论的按钮，收藏按钮，转发按钮。

![](https://user-gold-cdn.xitu.io/2018/11/15/16715786c73acd9f?w=323&h=544&f=png&s=131156)
点击转发按钮会出现一个弹窗，可以选择需要转发到的渠道，并且给弹出层背景添加了蒙层效果，只有在点击蒙层或者取消按钮弹出框才会消失。<br>
这里只实现了转发到微信的功能，只需要调用一下微信小程序的onShareAppMessage接口就可以搞定，当点击微信的图标后可以转发给朋友或者微信群。

![](https://user-gold-cdn.xitu.io/2018/11/15/167157cf434b04ed?w=320&h=518&f=png&s=128384)
&nbsp;&nbsp;&nbsp;&nbsp;收藏按钮我就是用了一个wx:if来判断显示的是那个image点击一个队bool值取反。
点击评论按钮可以从直接跳转到评论的顶部，使用一个scrollview将整个详情包裹住然后
使用它的一个属性scroll-into-view当点击底部的评论按钮时将评论部分的id赋值给scroll-into-view就可以实现锚点跳转了。在这个地方我踩了一个坑，没有给scroll-into-view设置一个高度导致效果一直出不来，由于详情页需要评论页面高度是改变的，所以直接给它设置一个100vh就可以完美搞定这个地方的锚点跳转了。<br>
&nbsp;&nbsp;&nbsp;&nbsp;最后就是输入框了点击输入框或者左边的输入按钮就可以弹出评论输入框了，当输入框内有值的时候发布按钮会改变颜色。当未授权登录将无法发布评论
![](https://user-gold-cdn.xitu.io/2018/11/15/167171dfb36cab57?w=349&h=600&f=gif&s=5067778)
这里就需要在我的页面点击登录进行授权，获取获取用户信息。<br>
登录功能的实现在页面登录按钮设置属性为open-type=getUserInfo,bindgetuserinfo=getUserInfo
点击登录按钮授权登录将会获取用户信息，并将用户信息保存到全局上，这样在详情页面便可以判断或者使用用户信息。
![](https://user-gold-cdn.xitu.io/2018/11/15/16717eba50b4ee1b?w=348&h=607&f=gif&s=5238575)
授权就可以发布新闻评论了，由于在登录的时候获取到了用户使用，所以在评论的是就有用户avatar和nickname。当在评论输入框中输入了值并且用户授权了登录的时候点击发布，同时将数据保存到数据库中。下面就是评论功能函数<br>
```
submit: function() { // 实现评论功能，将发布的评论同步到云数据库
    let value = this.data.inputValue;
    let new_id = this.data.new_id;
    let userInfo = this.data.userInfo
    // let new_id = '6594157273642172936'
    if(userInfo){
      comments.where({
        new_id: new_id
      }).get({
        success: (res) => {
          // console.log(res)
          let comms= res.data[0].comments;
          let people = {
            content: value,
            like: 0,
            avatar: userInfo.avatarUrl,
            nickname: userInfo.nickname
          }
          comms.unshift(people);
          // console.log(comm)
          this.setData({
            comms: comms,
            input: '',
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
  
        }
      })
    }
  }
```
评论部分的数据库我只创建了一个comments集合，开始的新闻new_id就起到作用了，每一comment都有一个new_id，新闻的每一条评论就是设置为一个对象，毕竟评论还包括头像昵称，点赞数，评论内容等。这样设置评论数据库好处就是，只要获取新闻id在一个集合中就可以获取到新闻对应的评论。

![](https://user-gold-cdn.xitu.io/2018/11/15/16718102db2b4777?w=909&h=173&f=png&s=17792)
#### 开始在更新数据库的时候我没有使用云函数，而是在js中直接更新数据，获得返回信息显示是请求成功但是update数为0，但是当我到数据库中查看是发现数据并没有更新成功，查了一下文档发现是权限的问题，因为数据的修改只能是管理者或者数据的创建者，而数据又是我自己手动输入到云数据库的，在js中直接更新的数据库的时候不是创建者而在小程序端又没有管理者权限，所以没有权限修改数据。既然无法是创建者想要修改数据只能是管理员了，所以这里我使用了云函数来修改数据。说到这里大家应该意识到了云函数的权限是什么级别了吧，这里给大家看下官方文档的说明。
![](https://user-gold-cdn.xitu.io/2018/11/16/16718234911f8b48?w=916&h=60&f=png&s=18155)
从官方文档能看出云函数是有多强大了，还就是云函数也不能乱用，毕竟权限是最高的。<br>
&nbsp;&nbsp;
&nbsp;
&nbsp;
#### 既然可以评论那就少不了点赞功能吧，虽然点赞是很普通的功能但是这里涉及到了云数据而且具体实现还是很有趣的。<br>
每条评论都可以点赞一次再次点击时将会取消点赞。评论部分的点赞我这里写的addLike函数绑定到点赞按钮，由于每条评论都绑定了相同的点赞函数，所以需要区分是那条评论被点赞所以给每条评论设置了data-item="{{index}}"i（index是在使用for循环展示评论使所产生的）同时对应了评论在数据库保存的位置，这样一来就方便来区分被点赞的那一条评论了。<br>
当被点赞后点赞按钮将换为红色的按钮，同时数据库中like也要加一。再次点赞按钮则还原，like也将还原。其实点赞功能还是很有趣的，这完全是我个人的想法，可能还有不好的地方，但是我还是推荐大家看一下。下面就是具体实现的代码
```
addLike: function(e) { // 点击点赞图标增加点赞数同时保存到数据库
    let item = e.currentTarget.dataset.item;
    let new_id = this.data.new_id;
    let comms = this.data.comms;
    let likeItem = this.data.likeItem;
    let likebool = 'likeItem['+item+'].bool'
    let liken = 'likeItem['+item+'].n'
    if(typeof(likeItem[item]) == "undefined"){
      this.setData({
        [likebool]: false,
        [liken]: 0,
      })
    }

    if(likeItem[item]){
      likeItem[item].n += 1;
      if(likeItem[item].n%2){
        comms[item].like += 1;
      }else{
        comms[item].like -= 1;
      }
      likeItem[item].bool = !(likeItem[item].bool);
    }else{
      likeItem[item].bool = true;
      likeItem[item].n = 0;
      comms[item].like += 1;
    }

    this.setData({
      comms: comms,
      likeItem: likeItem
    })
    // console.log(comms)
    wx.cloud.callFunction({
      name: 'updateComments',
      data: {
        new_id: new_id,
        comms: comms
      }
    }).then(res =>{
      // console.log(res)
    })
  },
```
在评论输入框的下边栏有一个复选框按钮，图片按钮等这里我使用了了flex布局轻松搞定，这是我实现了下评论插入图片功能，同时将图片保存到云端。其实评论插入图片还需要优化，我在写完文章后也还会继续优化。
我这是使用了小程序云开发的一个文件上传接口wx.cloud.uploadFile，将图片上传后会生成一个fileID，我将fileID（也就是图片地址）保存到当前评论对象的image下，同时更新本地的数据，再通过一个if来判断当前的评论是否含有图片，有的话就将图片显示在评论中。这里代码我就不贴出来，有需要的可以看源码。<br>

#### 由于项目有点大所以我在短时间内只实现了部分功能，在后续的时间我会实现其他功能。其实写这个项目也是为了实战云开发，同时我也体验到了云开发的好处。项目中有些不足的地方欢迎大家指出，有什么好的建议也可以联系我。大家相互学习
