(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-runtime/core-js/json/stringify'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('mitt')) :
	typeof define === 'function' && define.amd ? define(['babel-runtime/core-js/json/stringify', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'mitt'], factory) :
	(global.webviewBus = factory(global._JSON$stringify,global._classCallCheck,global._createClass,global.mitt));
}(this, (function (_JSON$stringify,_classCallCheck,_createClass,mitt) { 'use strict';

_JSON$stringify = _JSON$stringify && _JSON$stringify.hasOwnProperty('default') ? _JSON$stringify['default'] : _JSON$stringify;
_classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
_createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
mitt = mitt && mitt.hasOwnProperty('default') ? mitt['default'] : mitt;

/**
 * WebviewBus 类
 */

var WebviewBus$1 = function () {
  /**
   * 构造函数
   * @param  {Object} host 宿主（window 或 webview 实例）
   */
  function WebviewBus() {
    var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
    var env = arguments[1];

    _classCallCheck(this, WebviewBus);

    // 宿主（window 或 webview 实例）
    this.host = host;
    // 环境
    this.env = env === 'native' || !!this.host.injectJavaScript ? 'native' : 'web';
    // 事件总线
    this.bus = mitt();

    this.messageCache = {};

    // 初始化绑定相关事件
    this._bindEvents();
  }

  /**
   * 绑定相关事件
   */


  _createClass(WebviewBus, [{
    key: '_bindEvents',
    value: function _bindEvents() {
      var _this = this;

      // 判断当前宿主是否为 native 环境
      if (this.env === 'native') {
        // 如果为 native 环境，则代理 _onMessage 事件处理方法
        this.host.onMessage = this.host._onMessage = function (e) {
          // 处理事件消息
          _this.proccessMessage(e.nativeEvent.data);
          // 处理 props 绑定的消息
          var onMessage = _this.host.props.onMessage;

          onMessage && onMessage(e);
        };
      } else {
        // 如果为 web 环境，则监听 document.onmessage 事件
        document.addEventListener('message', function (e) {
          _this.proccessMessage(e.data);
        });
      }
    }

    /**
     * 添加事件监听器
     * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
     * @param  {Function} handler 事件处理器
     */

  }, {
    key: 'on',
    value: function on(event, handler) {
      this.bus.on(event, handler);
    }

    /**
     * 添加单次事件监听器
     * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
     * @param  {Function} handler 事件处理器
     */

  }, {
    key: 'once',
    value: function once(event, handler) {
      var _this2 = this;

      var callback = function callback(evt, data) {
        handler && handler(evt, data);
        _this2.bus.off(event, callback);
      };
      this.bus.on(event, callback);
    }

    /**
     * 触发事件
     * @param  {String} event   事件名称（支持通配符 * 监听所有事件）
     * @param  {Object} data    要传递的数据
     */

  }, {
    key: 'emit',
    value: function emit(event, data) {
      try {
        var msg = _JSON$stringify({
          event: event,
          data: data,
          _env: this.env
        });

        var chunkSize = 5000;
        var page = Math.ceil(msg.length / chunkSize);
        if (page < 1) {
          // 单次发送
          this.host.postMessage(msg, '*');
        } else {
          // 分批次发送
          var id = Math.random().toString(32).replace('0.', '');
          for (var i = 0; i < page; i++) {
            this.host.postMessage(_JSON$stringify({
              id: id,
              event: event,
              chunk: msg.substr(i * chunkSize, chunkSize),
              end: i + 1 === page,
              _env: this.env
            }), '*');
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    /**
     * 处理消息
     * @param  {String} message 消息内容
     */

  }, {
    key: 'proccessMessage',
    value: function proccessMessage(message) {
      if (!message) return;
      try {
        // 转换消息内容
        var msg = JSON.parse(message);
        // 排除非正常的 message
        if (!msg._env || msg._env === this.env) return;

        // 判断是否为分批消息
        if (msg.chunk) {
          // 保存到消息缓存
          this.messageCache[msg.id] = this.messageCache[msg.id] || '';
          this.messageCache[msg.id] += msg.chunk;
          // 判断是否未结束
          if (msg.end) {
            // 转换完整消息内容
            var msgBody = JSON.parse(this.messageCache[msg.id]);
            // 触发事件
            this.bus.emit(msgBody.event, msgBody.data);
            // 清理缓存
            delete this.messageCache[msg.id];
          }
        } else {
          // 触发事件
          this.bus.emit(msg.event, msg.data);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }]);

  return WebviewBus;
}();

return WebviewBus$1;

})));
//# sourceMappingURL=react-native-webview-bus.js.map
