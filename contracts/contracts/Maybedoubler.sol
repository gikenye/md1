// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AirnodeRrpV0} from "@api3/airnode-protocol/contracts/rrp/AirnodeRrpV0.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MDoubleGame is AirnodeRrpV0, ReentrancyGuard {
    // --- Configurable Parameters ---
    uint256 public houseEdgeBp = 200;        // House edge in basis points (e.g. 200 = 2%)
    uint256 public constant BP_DIVISOR = 10000;
    uint256 public maxBetDivisor = 50;       // No bet > 1/N of pool (e.g. 50 = 2%)
    address public owner;
    address public pendingOwner;
    bool public paused;

    // --- API3 QRNG Parameters ---
    address public airnode;                  // Airnode address for QRNG
    bytes32 public endpointId;              // Endpoint ID for random number request
    address public sponsorWallet;            // Sponsor wallet for gas costs

    // --- Storage ---
    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => uint256) public totalPlayerBalances;
    mapping(address => uint256) public minReserve;  // Min reserve per token (address(0) for ETH)
    mapping(bytes32 => Bet) private pendingBets;    // Use bytes32 for API3 request IDs

    // --- Structs ---
    struct Bet {
        address player;
        address token;
        uint256 wager;
    }

    // --- Events ---
    event BetPlaced(bytes32 indexed requestId, address indexed player, address indexed token, uint256 wager);
    event Played(address indexed player, address indexed token, uint256 wager, bool doubled, uint256 payout, uint256 newBalance, uint256 poolAfter);
    event Withdraw(address indexed player, address indexed token, uint256 amount, address to);
    event HouseEdgeChanged(uint256 newHouseEdgeBp);
    event MaxBetDivisorChanged(uint256 newMaxBetDivisor);
    event MinReserveChanged(address indexed token, uint256 newReserve);
    event Paused(bool status);
    event AirnodeParametersUpdated(address airnode, bytes32 endpointId, address sponsorWallet);
    event OwnershipTransferInitiated(address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    modifier whenNotPaused() {
        require(!paused, "Game paused");
        _;
    }

    constructor(
        address _airnodeRrp,
        address _airnode,
        bytes32 _endpointId,
        address _sponsorWallet
    ) AirnodeRrpV0(_airnodeRrp) {
        owner = msg.sender;
        airnode = _airnode;
        endpointId = _endpointId;
        sponsorWallet = _sponsorWallet;
        minReserve[address(0)] = 5 ether;  // Default for ETH
    }

    // --- Main Play Logic ---

    function playWithETH() external payable whenNotPaused {
        require(msg.value > 0, "No ETH sent");

        address token = address(0);
        uint256 amount = msg.value;
        uint256 wager = takeHouseEdge(amount);

        // Calculate pool before deposit with overflow protection
        uint256 contractBalance = address(this).balance;
        require(contractBalance >= amount + totalPlayerBalances[token], "Invalid balance state");
        uint256 poolBal = contractBalance - amount - totalPlayerBalances[token];

        // Enforce bet size with division by zero protection
        require(maxBetDivisor > 0, "Invalid divisor");
        require(wager <= poolBal / maxBetDivisor, "Bet too large for pool");

        // Enforce reserve with overflow protection
        require(poolBal + amount >= 2 * wager, "Insufficient funds for payout");
        require(poolBal + amount - 2 * wager >= minReserve[token], "Reserves too low");

        // Request QRNG
        bytes32 requestId = airnodeRrp.makeFullRequest(
            airnode,
            endpointId,
            address(this),
            sponsorWallet,
            address(this),
            this.fulfill.selector,
            "" // No additional parameters needed for QRNG
        );

        pendingBets[requestId] = Bet({
            player: msg.sender,
            token: token,
            wager: wager
        });

        emit BetPlaced(requestId, msg.sender, token, wager);
    }

    function playWithERC20(address token, uint256 amount) external whenNotPaused {
        require(token != address(0), "Bad token");
        require(amount > 0, "Amount must be > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 wager = takeHouseEdge(amount);

        // Calculate pool before deposit with overflow protection
        uint256 contractBalance = IERC20(token).balanceOf(address(this));
        require(contractBalance >= amount + totalPlayerBalances[token], "Invalid balance state");
        uint256 poolBal = contractBalance - amount - totalPlayerBalances[token];

        // Enforce bet size with division by zero protection
        require(maxBetDivisor > 0, "Invalid divisor");
        require(wager <= poolBal / maxBetDivisor, "Bet too large for pool");

        // Enforce reserve with overflow protection
        require(poolBal + amount >= 2 * wager, "Insufficient funds for payout");
        require(poolBal + amount - 2 * wager >= minReserve[token], "Reserves too low");

        // Request QRNG
        bytes32 requestId = airnodeRrp.makeFullRequest(
            airnode,
            endpointId,
            address(this),
            sponsorWallet,
            address(this),
            this.fulfill.selector,
            "" // No additional parameters needed for QRNG
        );

        pendingBets[requestId] = Bet({
            player: msg.sender,
            token: token,
            wager: wager
        });

        emit BetPlaced(requestId, msg.sender, token, wager);
    }

    // --- QRNG Callback ---
    function fulfill(bytes32 requestId, bytes calldata data) external onlyAirnodeRrp {
        Bet memory bet = pendingBets[requestId];
        require(bet.wager > 0, "No pending bet");

        delete pendingBets[requestId];

        // Decode random number from QRNG response (uint256)
        uint256 randomNumber = abi.decode(data, (uint256));
        bool doubled = randomNumber % 2 == 0;
        uint256 payout = doubled ? bet.wager * 2 : bet.wager / 2;

        balances[bet.player][bet.token] += payout;
        totalPlayerBalances[bet.token] += payout;

        uint256 poolAfter = getPoolBalance(bet.token);

        emit Played(bet.player, bet.token, bet.wager, doubled, payout, balances[bet.player][bet.token], poolAfter);
    }

    // --- Withdrawals ---
    function withdraw(address token, uint256 amount, address to) external nonReentrant {
        require(to != address(0), "Bad receiver");
        require(balances[msg.sender][token] >= amount && amount > 0, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        totalPlayerBalances[token] -= amount;

        if (token == address(0)) {
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "ETH withdrawal failed");
        } else {
            require(IERC20(token).transfer(to, amount), "ERC20 withdrawal failed");
        }
        emit Withdraw(msg.sender, token, amount, to);
    }

    // --- House Edge Logic ---
    function takeHouseEdge(uint256 amount) internal view returns (uint256) {
        return amount - (amount * houseEdgeBp / BP_DIVISOR); // deduct edge from the wager
    }

    // --- Helper ---
    function getPoolBalance(address token) public view returns (uint256) {
        if (token == address(0)) {
            uint256 contractBalance = address(this).balance;
            uint256 playerBalance = totalPlayerBalances[token];
            return contractBalance >= playerBalance ? contractBalance - playerBalance : 0;
        } else {
            uint256 contractBalance = IERC20(token).balanceOf(address(this));
            uint256 playerBalance = totalPlayerBalances[token];
            return contractBalance >= playerBalance ? contractBalance - playerBalance : 0;
        }
    }

    // --- Admin Controls ---
    function setHouseEdgeBp(uint256 bp) external onlyOwner {
        require(bp < BP_DIVISOR / 2, "Too high"); // <50%
        houseEdgeBp = bp;
        emit HouseEdgeChanged(bp);
    }

    function setMaxBetDivisor(uint256 div) external onlyOwner {
        require(div > 0, "divisor must be > 0");
        maxBetDivisor = div;
        emit MaxBetDivisorChanged(div);
    }

    function setMinReserve(address token, uint256 reserve) external onlyOwner {
        minReserve[token] = reserve;
        emit MinReserveChanged(token, reserve);
    }

    function pause(bool state) external onlyOwner {
        paused = state;
        emit Paused(state);
    }

    function setAirnodeParameters(
        address _airnode,
        bytes32 _endpointId,
        address _sponsorWallet
    ) external onlyOwner {
        require(_airnode != address(0), "Invalid airnode address");
        require(_sponsorWallet != address(0), "Invalid sponsor wallet");
        airnode = _airnode;
        endpointId = _endpointId;
        sponsorWallet = _sponsorWallet;
        emit AirnodeParametersUpdated(_airnode, _endpointId, _sponsorWallet);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        pendingOwner = newOwner;
        emit OwnershipTransferInitiated(newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        address previousOwner = owner;
        owner = pendingOwner;
        pendingOwner = address(0);
        emit OwnershipTransferred(previousOwner, owner);
    }

    receive() external payable {
        // Only accept ETH for liquidity, not for betting
    }
}