const net = require("net");
const messageType = require("./message-type.js");
const {
  REQUEST_LATEST_BLOCK,
  RECEIVE_LATEST_BLOCK,
  REQUEST_BLOCKCHAIN,
  RECEIVE_BLOCKCHAIN,
  REQUEST_TRANSACTIONS,
  RECEIVE_TRANSACTIONS
} = messageType;
const Messages = require("./Messages.js");

class PeerToPeer {
  constructor(blockchain) {
    this.peers = [];
    this.blockchain = blockchain;
  }

  startServer(port) {
    const server = net
      .createServer(socket => {
        this.initConnection(socket);
      })
      .listen(port);
    console.log(`P2P server listening on port ${port}`);
  }

  discoverPeers() {
    // 发现对等节点功能已移除，需要手动连接节点
    console.log("发现对等节点功能需要手动实现，请使用 'connect' 命令连接其他节点");
  }

  connectToPeer(host, port) {
    const socket = net.connect(port, host, () => {
      console.log(`Connected to peer at ${host}:${port}`);
      this.initConnection(socket);
    });
    
    socket.on('error', (err) => {
      console.error(`Failed to connect to ${host}:${port}:`, err.message);
    });
  }

  closeConnection() {
    this.peers.forEach(peer => {
      try {
        peer.end();
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    });
    this.peers = [];
    console.log('All connections closed');
  }

  broadcastLatest() {
    this.broadcast(Messages.sendLatestBlock(this.blockchain.latestBlock));
  }

  broadcast(message) {
    this.peers.forEach(peer => this.write(peer, message));
  }

  write(peer, message) {
    peer.write(JSON.stringify(message));
  }

  initConnection(connection) {
    // 检查是否已经连接过这个对等节点
    const existingPeer = this.peers.find(peer => 
      peer.remoteAddress === connection.remoteAddress && 
      peer.remotePort === connection.remotePort
    );
    
    if (!existingPeer) {
      this.peers.push(connection);
      this.initMessageHandler(connection);
      this.initErrorHandler(connection);
      this.write(connection, Messages.getLatestBlock());
      console.log(`New peer connected: ${connection.remoteAddress}:${connection.remotePort}`);
    }
  }

  initMessageHandler(connection) {
    let buffer = '';
    
    connection.on("data", data => {
      buffer += data.toString("utf8");
      
      // 处理可能包含多个JSON消息的缓冲区
      let boundary = buffer.indexOf('}{');
      while (boundary !== -1) {
        // 提取第一个完整的JSON消息
        const messageStr = buffer.substring(0, boundary + 1);
        buffer = buffer.substring(boundary + 1);
        
        try {
          const message = JSON.parse(messageStr);
          this.handleMessage(connection, message);
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

  initErrorHandler(connection) {
    connection.on("error", err => {
      throw err;
    });
  }

  handleMessage(peer, message) {
    switch (message.type) {
      case REQUEST_LATEST_BLOCK:
        this.write(peer, Messages.sendLatestBlock(this.blockchain.latestBlock));
        break;
      case REQUEST_BLOCKCHAIN:
        this.write(peer, Messages.sendBlockchain(this.blockchain.get()));
        break;
      case RECEIVE_LATEST_BLOCK:
        this.handleReceivedLatestBlock(message, peer);
        break;
      case RECEIVE_BLOCKCHAIN:
        this.handleReceivedBlockchain(message);
        break;
      default:
        throw "Received invalid message.";
    }
  }

  handleReceivedLatestBlock(message, peer) {
    const receivedBlock = message.data;
    const latestBlock = this.blockchain.latestBlock;

    if (latestBlock.hash === receivedBlock.previousHash) {
      try {
        this.blockchain.addBlock(receivedBlock);
      } catch(err) {
        throw err;
      }
    } else if (receivedBlock.index > latestBlock.index) {
      this.write(peer, Messages.getBlockchain());
    } else {
      // Do nothing.
    }
  }

  handleReceivedBlockchain(message) {
    const receivedChain = message.data;
    
    try {
      this.blockchain.replaceChain(receivedChain);
    } catch(err) {
      throw err;
    }
  }
}

module.exports = PeerToPeer;
