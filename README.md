# Doubledown 🎰

A decentralized gambling game where players can double their stake or lose half.

## 🎮 Game Concept

Doubledown is a simple yet thrilling 50/50 gambling game:
- **Win**: Double your stake (2x payout)
- **Lose**: Get half your stake back (0.5x payout)
- Powered by Chainlink VRF for provably fair randomness
- Supports both ETH and ERC20 tokens

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

## ⚠️ Disclaimer

This is a gambling application. Please gamble responsibly and only with funds you can afford to lose. The smart contract has been security reviewed but use at your own risk.

## 📄 License

MIT License - see LICENSE file for details.