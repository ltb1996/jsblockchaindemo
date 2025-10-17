const messageType = {
  REQUEST_LATEST_BLOCK: 0, // 请求最新的区块
  RECEIVE_LATEST_BLOCK: 1, // 接收到最新的区块
  REQUEST_BLOCKCHAIN: 2,  // 请求整个区块链
  RECEIVE_BLOCKCHAIN: 3,  // 接收到整个区块链
};

module.exports = messageType;