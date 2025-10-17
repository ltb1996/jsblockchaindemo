const messageType = require('./message-type.js');
const Messages = require('./Messages.js');
const Block = require('./Block.js');

console.log('=== 消息类型和消息工厂测试开始 ===\n');

try {
  // 测试1: 消息类型枚举
  console.log('1. 测试消息类型枚举:');
  console.log('  - REQUEST_LATEST_BLOCK:', messageType.REQUEST_LATEST_BLOCK);
  console.log('  - RECEIVE_LATEST_BLOCK:', messageType.RECEIVE_LATEST_BLOCK);
  console.log('  - REQUEST_BLOCKCHAIN:', messageType.REQUEST_BLOCKCHAIN);
  console.log('  - RECEIVE_BLOCKCHAIN:', messageType.RECEIVE_BLOCKCHAIN);
  console.log('✓ 消息类型枚举正常\n');

  // 测试2: 请求最新区块消息功能
  console.log('2. 测试请求最新区块消息功能:');
  const requestLatestBlockMsg = Messages.getLatestBlock();
  console.log('  - 消息类型:', requestLatestBlockMsg.type);
  console.log('  - 是否为请求最新区块类型:', requestLatestBlockMsg.type === messageType.REQUEST_LATEST_BLOCK);
  console.log('  - 消息结构:', JSON.stringify(requestLatestBlockMsg));
  console.log('✓ 请求最新区块消息功能创建正常\n');

  // 测试3: 发送最新区块消息功能
  console.log('3. 测试发送最新区块消息功能:');
  const testBlock = Block.genesis;
  const sendLatestBlockMsg = Messages.sendLatestBlock(testBlock);
  console.log('  - 消息类型:', sendLatestBlockMsg.type);
  console.log('  - 是否为接收最新区块类型:', sendLatestBlockMsg.type === messageType.RECEIVE_LATEST_BLOCK);
  console.log('  - 包含的数据:', JSON.stringify(sendLatestBlockMsg.data));
  console.log('  - 数据是否为创世区块:', sendLatestBlockMsg.data.index === 0);
  console.log('  - 消息结构:', JSON.stringify(sendLatestBlockMsg));
  console.log('✓ 发送最新区块消息功能创建正常\n');

  // 测试4: 请求整个区块链消息功能
  console.log('4. 测试请求整个区块链消息功能:');
  const requestBlockchainMsg = Messages.getBlockchain();
  console.log('  - 消息类型:', requestBlockchainMsg.type);
  console.log('  - 是否为请求整个区块链类型:', requestBlockchainMsg.type === messageType.REQUEST_BLOCKCHAIN);
  console.log('  - 消息结构:', JSON.stringify(requestBlockchainMsg));
  console.log('✓ 请求整个区块链消息功能创建正常\n');

  // 测试5: 发送整个区块链消息功能
  console.log('5. 测试发送整个区块链消息功能:');
  const testChain = [Block.genesis];
  const sendBlockchainMsg = Messages.sendBlockchain(testChain);
  console.log('  - 消息类型:', sendBlockchainMsg.type);
  console.log('  - 是否为接收整个区块链类型:', sendBlockchainMsg.type === messageType.RECEIVE_BLOCKCHAIN);
  console.log('  - 包含的数据长度:', sendBlockchainMsg.data.length);
  console.log('  - 数据是否包含创世区块:', sendBlockchainMsg.data[0].index === 0);
  console.log('  - 消息结构:', JSON.stringify(sendBlockchainMsg));
  console.log('✓ 发送整个区块链消息功能创建正常\n');

  // 测试6: 消息类型完整性检查
  console.log('6. 测试消息类型完整性:');
  const allMessageTypes = Object.keys(messageType);
  console.log('  - 定义的消息类型数量:', allMessageTypes.length);
  console.log('  - 消息类型列表:', allMessageTypes.join(', '));
  console.log('✓ 消息类型完整性检查通过\n');

  console.log('=== 所有测试通过! ===');
  console.log('\n提示: 你的 message-type.js 和 Messages.js 文件运行正常！');

} catch (error) {
  console.error('\n❌ 测试失败!');
  console.error('错误信息:', error);
  console.error('\n请检查你的代码:');
  console.error('1. 确认 message-type.js 是否正确导出了消息类型枚举');
  console.error('2. 确认 Messages.js 是否正确引入了消息类型');
  console.error('3. 检查 Messages 类中的静态方法是否正确实现');
  console.error('4. 检查语法错误和逻辑错误');
  process.exit(1);
}