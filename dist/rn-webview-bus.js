(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-runtime/core-js/json/stringify'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('mitt')) :
	typeof define === 'function' && define.amd ? define(['babel-runtime/core-js/json/stringify', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'mitt'], factory) :
	(global.priv = factory(global._JSON$stringify,global._classCallCheck,global._createClass,global.mitt));
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

    _classCallCheck(this, WebviewBus);

    // 宿主（window 或 webview 实例）
    this.host = host;
    // 是否为 native 环境
    this.isNative = !!this.host.injectJavaScript;
    // 事件总线
    this.bus = mitt();

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
      if (this.isNative) {
        // 如果为 native 环境，则监听 webview.onMessage 事件
        this.host.props.onMessage = function (e) {
          _this.proccessMessage(e.nativeEvent.data);
        };
      } else {
        // 如果为 web 环境，则监听 document.onmessage 事件
        document.addEventListener('message', function (e) {
          this.proccessMessage(e.data);
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
      var _arguments = arguments,
          _this2 = this;

      this.bus.on(event, function () {
        handler && handler.apply(undefined, _arguments);
        _this2.bus.off(event, handler);
      });
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
          data: data
        });
        this.host.postMessage(msg, '*');
      } catch (err) {
        console.error(err);
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
        // 类型转换
        var msg = JSON.parse(message);
        // 触发事件
        bus.emmit(msg.event, msg.data);
      } catch (err) {
        console.error(err);
      }
    }
  }]);

  return WebviewBus;
}();

return WebviewBus$1;

})));
//# sourceMappingURL=rn-webview-bus.js.map
