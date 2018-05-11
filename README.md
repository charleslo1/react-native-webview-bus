# rn-webview-bus
> 让 React Native 与 webview 页面互通的 Event bus，帮助快速实现 Hybrid 应用

# Install

``` sh
npm install rn-webview-bus --save

```

# Api
* WebviewBus：WebviewBus 类，var webviewBus = new WebviewBus(window or webview)
* webviewBus.on(event, handler)：添加跨端的事件监听器，如 web 端调用则监听 native 端发送的事件，反之亦然
* webviewBus.once(event, handler)：添加跨端的单次事件监听器，同 webviewBus.on
* webviewBus.off(event, handler)：取消跨端的事件监听器
* webviewBus.emit(event, data)：触发跨端事件，如 web 端调用则 native 触发对应事件

# Usage

## React Native 端组件

``` js
// App.js
import React, { Component } from 'react'
import { View, Text, WebView } from 'react-native'
import styles from './styles'
import * as WeChat from 'react-native-wechat';
import WebviewBus from 'rn-webview-bus'

type Props = {}
export default class Page extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      title: '分享收客',
      url: 'https://crm.demo.keketour.com/test.html'
    }
  }

  /**
   * 组件生命周期事件 componentDidMount
   */
  componentDidMount () {
    // 创建 WebviewBus 实例
    this.webviewBus = new WebviewBus(this.refs.webview)

    // 监听 webview 页面发出的事件
    this.webviewBus.on('title-change', this.setTitle)
    this.webviewBus.on('share-timeline', this.shareToTimeline)
  }

  /**
   * 返回
   */
  goBack () {
    this.webviewBus.emit('back', { text: '返回' })
  }

  /**
   * 设置标题
   * @param {Object} data 数据
   */
  setTitle (data) {
    this.setState({ title: data.title })
  }

  /**
   * 分享朋友圈
   * @param {Object} data 数据
   */
  shareToTimeline (data) {
    WeChat.shareToTimeline({
      type: 'news', 
      title: data.title,
      description: data.desc,
      webpageUrl: data.link,
      imageUrl: data.imgUrl
    }).then(() => {
      console.log('分享成功:', result);
    })
  }


// Code example to share text message:
try {
  let result = await WeChat.shareToTimeline({
    type: 'text', 
    description: 'hello, wechat'
  });
  console.log('share text message to time line successful:', result);
} catch (e) {
  if (e instanceof WeChat.WechatError) {
    console.error(e.stack);
  } else {
    throw e;
  }
}
  /**
   * 渲染组件
   */
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
            <Button style={styles.back} onPress={this.goBack}>返回</Button>
            <Text style={styles.title}>{this.state.title}</Text>
        </View>
        <WebView
          ref="webview"
          style={styles.webview}
          source={{uri: this.state.url, method: 'GET'}}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          mixedContentMode="always"
          bounces={false}
          initialScale={100}
          decelerationRate="normal"
          onMessage={this.onMessage}
          onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
          onNavigationStateChange={this.onNavigationStateChange}
          automaticallyAdjustContentInsets={false}>
        </WebView>
      </View>
    );
  }
}

```

# web 端页面（以 Vue 页面为例）

``` js
<template>
  <section>
    <button @click="setTitle">更改标题</button>
    <button @click="shareToTimeline">分享到朋友圈</button>
  </section>
</template>

<script>
import WebviewBus from 'rn-webview-bus'

export default {
  data () {
    return { }
  },

  mounted () {
    // 创建 WebviewBus 实例
    this.webviewBus = new WebviewBus(window)

    // 监听 Native 的 back 事件
    this.webviewBus.on('back', (data) => {
      window.history.back()
      console.log(data.text)
    })
  }

  methods: {
    /**
     * 设置 Native 标题
     */
    setTitle () {
      this.webviewBus.emit('title-change', { title: '新标题' })
    },

    /**
     * 调用 Native 分享到朋友圈
     */
    shareToTimeline () {
      this.webviewBus.emit('share-timeline', {
        title: '分享标题',
        desc: '分享文章摘要',
        imgUrl: 'https://img.weixin.qq.com/img.png',
        link: 'https://img.weixin.qq.com/news.html'
      })
    }
  }
}
</script>

```


