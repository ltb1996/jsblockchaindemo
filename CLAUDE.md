# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a JavaScript blockchain educational demo project that implements a simple blockchain with P2P networking capabilities. It's designed for learning blockchain fundamentals through hands-on implementation.

**Teaching/Learning Order**: Files are intended to be built incrementally:
1. `Block.js` - Define block structure
2. `Blockchain.js` - Implement blockchain logic
3. `Messages.js` & `message-type.js` - Define P2P message protocol
4. `P2p.js` - Implement P2P networking
5. `cli.js` - Add command-line interface
6. `index.js` - Entry point

## Commands

### Running the Application
```bash
npm start                    # Start the blockchain CLI
node test-blockchain.js      # Run tests for Block.js and Blockchain.js
```

### CLI Commands (when running)
```bash
blockchain (alias: bc)       # View current blockchain state
mine <data> (alias: m)       # Mine a new block with data
open <port> (alias: o)       # Start P2P server on port
connect <host> <port> (c)    # Connect to another peer
peers (alias: p)             # List connected peers
discover (alias: d)          # Discover peers (manual implementation)
help                         # Show all commands
```

### Multi-Node Testing
To test P2P synchronization, run in separate terminals:
```bash
# Terminal 1
npm start
open 2727
mine "first node data"

# Terminal 2
npm start
open 2728
connect localhost 2727
blockchain  # Should see synchronized data
```

## Architecture

### Core Components

**Block.js**
- Defines the `Block` class with: index, previousHash, timestamp, data, hash, nonce
- `Block.genesis` is a **static getter** that returns a new genesis block instance
- **Important**: When accessing genesis, use `Block.genesis()` with parentheses (it's a getter, not a property)

**Blockchain.js**
- Manages the blockchain array, starting with `[Block.genesis()]`
- Implements Proof of Work (PoW) with configurable difficulty (default: 3 leading zeros)
- Key methods:
  - `mine(data)` - Generate and add new block with PoW
  - `isValidNextBlock()` - Validate block against previous
  - `isValidChain()` - Validate entire chain
  - `replaceChain()` - Replace chain if received chain is longer and valid

**P2p.js**
- Uses Node.js `net` module for raw TCP P2P communication
- Maintains `peers` array of active socket connections
- Message buffering logic handles TCP stream fragmentation (lines 85-117)
- Automatically broadcasts new blocks to all peers
- Longest valid chain wins (consensus mechanism)

**Messages.js & message-type.js**
- Define JSON message protocol for P2P communication
- Message types: REQUEST_LATEST_BLOCK, RECEIVE_LATEST_BLOCK, REQUEST_BLOCKCHAIN, RECEIVE_BLOCKCHAIN

**cli.js**
- Uses `vorpal` library for interactive CLI
- Creates singleton instances of `Blockchain` and `P2p` shared across commands
- When mining, automatically broadcasts new block to peers (line 87)

### Data Flow

1. **Mining**: User runs `mine` → Blockchain.mine() → PoW calculation → Block added → P2p.broadcastLatest()
2. **Syncing**: Peer connects → Request latest block → Compare chains → Request full chain if needed → Replace if longer/valid
3. **Validation**: Every block addition validates: index sequence, previousHash match, hash correctness, PoW difficulty

## Common Issues

### Critical Bug in Original Code
- **Blockchain.js:6** - Must use `Block.genesis()` not `Block.genesis` (it's a getter method)
- **Blockchain.js:19** - Variable `i` declared with `var` inside loop - works due to hoisting but risky for empty hash edge case

### Testing Individual Components
Use `test-blockchain.js` to verify Block.js and Blockchain.js independently before building P2P layer. This allows incremental development and debugging.

## Project Philosophy

This is a **minimal educational implementation** to teach:
- Blockchain core concepts (hash chains, PoW, immutability)
- P2P networking without external libraries
- Distributed consensus (longest chain rule)

NOT included (by design):
- Transactions/wallets
- Merkle trees
- Advanced consensus (PoS, PBFT)
- Persistence layer
- Security hardening