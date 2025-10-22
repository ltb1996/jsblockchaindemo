const messageType = {
  REQUEST_LATEST_BLOCK: 0, // 请求最新的区块
  RECEIVE_LATEST_BLOCK: 1, // 响应最新区块（将最新区块发送给请求方）
  REQUEST_BLOCKCHAIN: 2,  // 请求整个区块链
  RECEIVE_BLOCKCHAIN: 3,  // 响应区块链（将整个区块链发送给请求方）
};

module.exports = messageType;