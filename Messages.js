const messageType = require("./message-type.js");
const {
  REQUEST_LATEST_BLOCK,
  RECEIVE_LATEST_BLOCK,
  REQUEST_BLOCKCHAIN,
  RECEIVE_BLOCKCHAIN,
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS
} = messageType;

class Messages {
  // 请求最新区块的消息
  static getLatestBlock() {
    return {
      type: REQUEST_LATEST_BLOCK
    };
  }
  // 发送最新区块的消息
  static sendLatestBlock(block) {
    return {
      type: RECEIVE_LATEST_BLOCK,
      data: block
    };
  }
  // 请求整个区块链的消息
  static getBlockchain() {
    return {
      type: REQUEST_BLOCKCHAIN
    };
  }
  // 发送整个区块链的消息
  static sendBlockchain(blockchain) {
    return {
      type: RECEIVE_BLOCKCHAIN,
      data: blockchain
    };
  }
}

module.exports = Messages;