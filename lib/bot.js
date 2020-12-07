'use strict';

const axios = require('axios');
const sign = require('./sign');

/**
 * 飞书机器人 WebHook：用于支持飞书机器人消息发送
 *
 * 官方文档：https://www.feishu.cn/hc/en-us/articles/360024984973-Use-Bots-in-group-chat
 */
class ChatBot {
  /**
   * 机器人工厂，所有的消息推送项目都会调用 this.webhook 接口进行发送
   *
   * @param {String} options.webhook 完整的接口地址
   * @param {String} options.secret secret
   * @param {*} options.httpclient 例如 urllib / axios
   */
  constructor(options) {
    options = options || {};
    if (!options.webhook) {
      throw new Error('options.webhook is required');
    }
    this.httpclient = options.httpclient || axios;
    // 优先使用 options.webhook
    // 次之将由 options.baseUrl 和 options.accessToken 组合成一个 webhook 地址
    this.webhook = options.webhook;
    this.secret = options.secret;
  }

  /**
   * 发送飞书消息
   *
   * @param {Object} content 发动的消息对象
   * @return {Promise}
   */
  send(content) {
    const { httpclient } = this;
    let signData = {};

    if (this.secret) {
      let signStr = '';
      const timestamp = Date.now();
      signStr =
        '&timestamp=' +
        timestamp +
        '&sign=' +
        sign(this.secret, timestamp + '\n' + this.secret);
      signData = { timestamp: timestamp, sign: signStr };
    }

    return httpclient.request(this.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },

      data: JSON.stringify({
        ...signData,
        content: content
      })
    });
  }

  /**
   * 发送纯文本消息，支持@群内成员
   *
   * @param {String} content 消息内容
   * @return {Promise}
   */
  text(content) {
    return this.send({
      msg_type: 'text',
      content: {
        text: content
      }
    });
  }

  /**
   * 发送富文本消息
   *
   * @param {String} post.zh_cn.title 标题
   * @param {Array} post.zh_cn.content 内容
   * @return {Promise}
   */
  richText(post) {
    return this.send({
      msg_type: 'post',
      content: {
        post
      }
    });
  }

  /**
   * 发送群名片
   *
   * @param {String} shareChatId 群 id
   * @return {Promise}
   */
  shareChat(shareChatId) {
    return this.send({
      msg_type: 'share_chat',
      content: {
        share_chat_id: shareChatId
      }
    });
  }

  /**
   * 发送图片
   *
   * @param {String} imageKey 可以通过图片上传接口获得
   * @return {Promise}
   */
  image(imageKey) {
    return this.send({
      msg_type: 'image',
      content: {
        image_key: imageKey
      }
    });
  }

  /**
   * 发送消息卡片
   *
   * @param {Object} card
   * @return {Promise}
   */
  interactive(card) {
    return this.send({
      msg_type: 'interactive',
      card: card
    });
  }
}

module.exports = ChatBot;
