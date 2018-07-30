import mitt from 'mitt'

/**
 * WebviewBus 类
 */
class WebviewBus {
  /**
   * 构造函数
   * @param  {Object} host 宿主（window 或 webview 实例）
   */
  constructor (host = window, env) {
    // 宿主（window 或 webview 实例）
    this.host = host
    // 环境
    this.env = (env === 'native' || !!this.host.injectJavaScript) ? 'native' : 'web'
    // 事件总线
    this.bus = mitt()

    this.messageCache = {}

    // 初始化绑定相关事件
    this._bindEvents()
  }

  /**
   * 绑定相关事件
   */
  _bindEvents () {
    // 判断当前宿主是否为 native 环境
    if (this.env === 'native') {
      // 如果为 native 环境，则代理 _onMessage 事件处理方法
      this.host.onMessage = this.host._onMessage = (e) => {
        // 处理事件消息
        this.proccessMessage(e.nativeEvent.data)
        // 处理 props 绑定的消息
        const {onMessage} = this.host.props
        onMessage && onMessage(e)
      }
    } else {
      // 如果为 web 环境，则监听 document.onmessage 事件
      document.addEventListener('message', (e) => {
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
    let callback = (evt, data) => {
      handler && handler(evt, data)
      this.bus.off(event, callback)
    }
    this.bus.on(event, callback)
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
        data: data,
        _env: this.env
      })

      let chunkSize = 5000
      let page = Math.ceil(msg.length / chunkSize)
      if (page <= 1) {
        // 单次发送
        this.host.postMessage(msg, '*')
      } else {
        // 分批次发送
        let id = Math.random().toString(32).replace('0.', '')
        for (let i = 0; i < page; i++) {
          this.host.postMessage(JSON.stringify({
            id: id,
            event: event,
            chunk: msg.substr(i * chunkSize, chunkSize),
            end: (i + 1) === page,
            _env: this.env
          }), '*')
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * 处理消息
   * @param  {String} message 消息内容
   */
  proccessMessage (message) {
    if (!message) return
    try {
      // 转换消息内容
      let msg = JSON.parse(message)
      // 排除非正常的 message
      if (!msg._env || msg._env === this.env) return

      // 判断是否为分批消息
      if (msg.chunk) {
        // 保存到消息缓存
        this.messageCache[msg.id] = this.messageCache[msg.id] || ''
        this.messageCache[msg.id] += msg.chunk
        // 判断是否未结束
        if (msg.end) {
          // 转换完整消息内容
          let msgBody = JSON.parse(this.messageCache[msg.id])
          // 触发事件
          this.bus.emit(msgBody.event, msgBody.data)
          // 清理缓存
          delete this.messageCache[msg.id]
        }
      } else {
        // 触发事件
        this.bus.emit(msg.event, msg.data)
      }
    } catch (err) {
      console.log(err)
    }
  }
}

export default WebviewBus
