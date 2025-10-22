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
  // 响应最新区块的消息（将最新区块发送给请求方）
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
  // 响应区块链的消息（将整个区块链发送给请求方）
  static sendBlockchain(blockchain) {
    return {
      type: RECEIVE_BLOCKCHAIN,
      data: blockchain
    };
  }
}

module.exports = Messages;