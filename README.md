# Doubledown 🎰

A decentralized gambling game where players can double their stake or lose half - built with Next.js frontend and Solidity smart contracts.

## 🎮 Game Concept

Doubledown is a simple yet thrilling 50/50 gambling game:
- **Win**: Double your stake (2x payout)
- **Lose**: Get half your stake back (0.5x payout)
- Powered by Chainlink VRF for provably fair randomness
- Supports both ETH and ERC20 tokens

## 🏗️ Project Structure

```
mbdoubler/
├── app/                    # Next.js app directory
├── components/             # React components
│   └── maybe-doubler-game.tsx  # Main game interface
├── contracts/              # Smart contract development
│   ├── contracts/          # Solidity contracts
│   │   └── Doubledown.sol   # Main game contract
│   ├── scripts/            # Deployment scripts
│   └── hardhat.config.js   # Hardhat configuration
└── lib/                    # Utility functions
```

## 🚀 Quick Start

### Frontend Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the game interface.

### Smart Contract Development

```bash
# Navigate to contracts directory
cd contracts

# Install contract dependencies
pnpm install

# Compile contracts
pnpm hardhat:compile

# Deploy to Base network
pnpm deploy:base
```

## 📋 Contract Details

**Deployed Contract**: `0x09Be2a345CB6Cdf533b04D0bA135E1f723939Bb6` (Base Mainnet)

### Security Features
- ✅ Reentrancy protection
- ✅ Integer overflow/underflow protection
- ✅ Two-step ownership transfer
- ✅ Pausable functionality
- ✅ Configurable house edge and bet limits

### Game Mechanics
- **House Edge**: 2% (configurable)
- **Max Bet**: 2% of pool (configurable)
- **Randomness**: Chainlink VRF v2
- **Payout Logic**: 50% chance to double, 50% chance to get half back

## 🔧 Configuration

### Environment Variables

Create `.env` files in both root and `contracts/` directories:

```bash
# contracts/.env
PRIVATE_KEY=your_wallet_private_key
```

### Chainlink VRF Setup

1. Create VRF subscription at [vrf.chain.link](https://vrf.chain.link)
2. Add contract as consumer
3. Fund subscription with LINK tokens
4. Update subscription ID in contract

## 🌐 Supported Networks

- **Base Mainnet** (Primary)
- **Celo** (Configured)
- Easy to add more networks in `hardhat.config.js`

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons

### Smart Contracts
- **Solidity ^0.8.20** - Contract language
- **Hardhat** - Development framework
- **OpenZeppelin** - Security libraries
- **Chainlink VRF** - Verifiable randomness

## 📜 Smart Contract Functions

### Player Functions
- `playWithETH()` - Bet with ETH
- `playWithERC20(token, amount)` - Bet with ERC20 tokens
- `withdraw(token, amount, to)` - Withdraw winnings

### Admin Functions
- `setHouseEdgeBp(bp)` - Set house edge
- `setMaxBetDivisor(div)` - Set max bet size
- `setMinReserve(token, reserve)` - Set minimum reserves
- `pause(state)` - Pause/unpause game

## 🔒 Security Considerations

- Contract audited for common vulnerabilities
- Reentrancy guards on all external calls
- Overflow protection on all arithmetic
- Configurable limits to protect house funds
- Emergency pause functionality

## 📈 Future Enhancements

- [ ] Web3 wallet integration
- [ ] Real-time blockchain interaction
- [ ] Multi-token support in UI
- [ ] Leaderboard and statistics
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## ⚠️ Disclaimer

This is a gambling application. Please gamble responsibly and only with funds you can afford to lose. The smart contract has been security reviewed but use at your own risk.

## 📄 License

MIT License - see LICENSE file for details.