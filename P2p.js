const net = require("net"); // 引入Node.js的网络模块，用于创建TCP连接
const messageType = require("./message-type.js"); // 引入消息类型定义
const {
  REQUEST_LATEST_BLOCK,    // 请求最新区块消息类型
  RECEIVE_LATEST_BLOCK,    // 接收最新区块消息类型
  REQUEST_BLOCKCHAIN,      // 请求整个区块链消息类型
  RECEIVE_BLOCKCHAIN,      // 接收整个区块链消息类型
  REQUEST_TRANSACTIONS,    // 请求交易消息类型（未使用）
  RECEIVE_TRANSACTIONS     // 接收交易消息类型（未使用）
} = messageType;
const Messages = require("./Messages.js"); // 引入消息构造器

// P2P网络通信类
class PeerToPeer {
  // 构造函数，初始化P2P网络
  constructor(blockchain) {
    this.peers = [];         // 存储已连接的节点
    this.blockchain = blockchain; // 引用区块链实例
  }

  // 启动服务器监听指定端口
  startServer(port) {
    const server = net
      .createServer(socket => {
        this.initConnection(socket); // 初始化新连接
      })
      .listen(port); // 监听指定端口
    console.log(`P2P server listening on port ${port}`);
  }

  // 发现对等节点功能（当前版本未实现）
  discoverPeers() {
    // 发现对等节点功能已移除，需要手动连接节点
    console.log("发现对等节点功能需要手动实现，请使用 'connect' 命令连接其他节点");
  }

  // 连接到指定的对等节点
  connectToPeer(host, port) {
    const socket = net.connect(port, host, () => {
      console.log(`Connected to peer at ${host}:${port}`);
      this.initConnection(socket); // 初始化连接
    });
    
    socket.on('error', (err) => {
      console.error(`Failed to connect to ${host}:${port}:`, err.message);
    });
  }

  // 关闭所有连接
  closeConnection() {
    this.peers.forEach(peer => {
      try {
        peer.end(); // 关闭每个连接
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    });
    this.peers = []; // 清空连接数组
    console.log('All connections closed');
  }

  // 广播最新区块
  broadcastLatest() {
    this.broadcast(Messages.sendLatestBlock(this.blockchain.latestBlock));
  }

  // 向所有连接的节点广播消息
  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message));
  }

  // 向指定节点发送消息
  write(peer, message) {
    peer.write(JSON.stringify(message)); // 将消息序列化为JSON字符串后发送
  }

  // 初始化新连接
  initConnection(connection) {
    // 检查是否已经连接过这个对等节点
    const existingPeer = this.peers.find(peer => 
      peer.remoteAddress === connection.remoteAddress && 
      peer.remotePort === connection.remotePort
    );
    
    if (!existingPeer) {
      this.peers.push(connection); // 添加到连接数组
      this.initMessageHandler(connection); // 初始化消息处理器
      this.initErrorHandler(connection);   // 初始化错误处理器
      this.write(connection, Messages.getLatestBlock()); // 发送请求最新区块的消息
      console.log(`New peer connected: ${connection.remoteAddress}:${connection.remotePort}`);
    }
  }

  // 初始化消息处理器
  initMessageHandler(connection) {
    let buffer = ''; // 用于处理TCP粘包的数据缓冲区
    
    connection.on("data", data => {
      buffer += data.toString("utf8"); // 将接收到的数据添加到缓冲区
      
      // 处理可能包含多个JSON消息的缓冲区
      let boundary = buffer.indexOf('}{');
      while (boundary !== -1) {
        // 提取第一个完整的JSON消息
        const messageStr = buffer.substring(0, boundary + 1);
        buffer = buffer.substring(boundary + 1);
        
        try {
          const message = JSON.parse(messageStr);
          this.handleMessage(connection, message); // 处理消息
        } catch (err) {
          console.error('Error parsing message:', err.message);
        }
        
        boundary = buffer.indexOf('}{');
      }
      
      // 处理缓冲区中剩余的单个消息
      if (buffer.length > 0) {
        try {
          const message = JSON.parse(buffer);
          this.handleMessage(connection, message);
          buffer = '';
        } catch (err) {
          // 可能消息还不完整，等待更多数据
        }
      }
    });
  }

  // 初始化错误处理器
  initErrorHandler(connection) {
    connection.on("error", err => {
      throw err;
    });
  }

  // 处理接收到的消息
  handleMessage(peer, message) {
    switch (message.type) {
      case REQUEST_LATEST_BLOCK:
        // 当收到请求最新区块的消息时，发送最新区块
        this.write(peer, Messages.sendLatestBlock(this.blockchain.latestBlock));
        break;
      case REQUEST_BLOCKCHAIN:
        // 当收到请求整个区块链的消息时，发送整个区块链
        this.write(peer, Messages.sendBlockchain(this.blockchain.get()));
        break;
      case RECEIVE_LATEST_BLOCK:
        // 当收到最新区块时，处理该区块
        this.handleReceivedLatestBlock(message, peer);
        break;
      case RECEIVE_BLOCKCHAIN:
        // 当收到整个区块链时，处理该区块链
        this.handleReceivedBlockchain(message);
        break;
      default:
        throw "Received invalid message.";
    }
  }

  // 处理接收到的最新区块
  handleReceivedLatestBlock(message, peer) {
    const receivedBlock = message.data;      // 获取接收到的区块
    const latestBlock = this.blockchain.latestBlock; // 获取本地最新区块

    // 如果接收到的区块可以连接到当前链
    if (latestBlock.hash === receivedBlock.previousHash) {
      try {
        this.blockchain.addBlock(receivedBlock); // 添加新区块
      } catch(err) {
        throw err;
      }
    } else if (receivedBlock.index > latestBlock.index) {
      // 如果接收到的区块索引更大，说明可能有更长的链，请求整个区块链
      this.write(peer, Messages.getBlockchain());
    } else {
      // 其他情况不做处理
    }
  }

  // 处理接收到的整个区块链
  handleReceivedBlockchain(message) {
    const receivedChain = message.data; // 获取接收到的区块链
    
    try {
      this.blockchain.replaceChain(receivedChain); // 替换本地区块链
    } catch(err) {
      throw err;
    }
  }
}

module.exports = PeerToPeer; // 导出P2P类