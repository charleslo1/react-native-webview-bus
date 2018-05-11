import mitt from 'mitt'

/**
 * WebviewBus 类
 */
class WebviewBus {
  /**
   * 构造函数
   * @param  {Object} host 宿主（window 或 webview 实例）
   */
  constructor (host = window) {
    // 宿主（window 或 webview 实例）
    this.host = host
    // 是否为 native 环境
    this.isNative = !!this.host.injectJavaScript
    // 事件总线
    this.bus = mitt()

    // 初始化绑定相关事件
    this._bindEvents()
  }

  /**
   * 绑定相关事件
   */
  _bindEvents () {
    // 判断当前宿主是否为 native 环境
    if (this.isNative) {
      // 如果为 native 环境，则监听 webview.onMessage 事件
      this.host.props.onMessage = (e) => {
        this.proccessMessage(e.nativeEvent.data)
      }
    } else {
      // 如果为 web 环境，则监听 document.onmessage 事件
      document.addEventListener('message', function (e) {
        this.proccessMessage(e.data)
      })
    }
  }

  /**
   * 添加事件监听器
   * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
   * @param  {Function} handler 事件处理器
   */
  on (event, handler) {
    this.bus.on(event, handler)
  }

  /**
   * 添加单次事件监听器
   * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
   * @param  {Function} handler 事件处理器
   */
  once (event, handler) {
    this.bus.on(event, () => {
      handler && handler(...arguments)
      this.bus.off(event, handler)
    })
  }

  /**
   * 触发事件
   * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
   * @param  {Object} data    要传递的数据
   */
  emit (event, data) {
    try {
      let msg = JSON.stringify({
        event: event,
        data: data
      })
      this.host.postMessage(msg, '*')
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * 处理消息
   * @param  {String} message 消息内容
   */
  proccessMessage (message) {
    if (!message) return
    try {
      // 类型转换
      let msg = JSON.parse(message)
      // 触发事件
      bus.emmit(msg.event, msg.data)
    } catch (err) {
      console.error(err)
    }
  }
}

export default WebviewBus