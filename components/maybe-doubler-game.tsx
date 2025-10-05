"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type GameState = "idle" | "spinning" | "result"
type Result = "win" | "lose" | null

export default function DoubledownGame() {
  const [stake, setStake] = useState<string>("10")
  const [balance, setBalance] = useState<number>(100)
  const [gameState, setGameState] = useState<GameState>("idle")
  const [result, setResult] = useState<Result>(null)
  const [resultAmount, setResultAmount] = useState<number>(0)
  const [rotation, setRotation] = useState<number>(0)

  const createConfetti = () => {
    const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#3b82f6"]
    const confettiCount = 50

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti-piece"
      confetti.style.left = Math.random() * 100 + "vw"
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 0.5 + "s"
      confetti.style.animationDuration = Math.random() * 2 + 2 + "s"
      document.body.appendChild(confetti)

      setTimeout(() => confetti.remove(), 3500)
    }
  }

  const handleSpin = () => {
    const stakeAmount = Number.parseFloat(stake)

    if (isNaN(stakeAmount) || stakeAmount <= 0) {
      alert("Please enter a valid stake amount")
      return
    }

    if (stakeAmount > balance) {
      alert("Insufficient balance!")
      return
    }

    setGameState("spinning")
    setResult(null)

    // Deduct stake from balance
    setBalance((prev) => prev - stakeAmount)

    // Random result: 50% chance to win or lose
    const isWin = Math.random() > 0.5

    // Calculate rotation (multiple full spins + final position)
    const baseRotation = 1800 // 5 full rotations
    const finalRotation = isWin ? 0 : 180 // Win at top, lose at bottom
    const newRotation = rotation + baseRotation + finalRotation
    setRotation(newRotation)

    // Show result after spin animation
    setTimeout(() => {
      setGameState("result")
      setResult(isWin ? "win" : "lose")

      if (isWin) {
        const winAmount = stakeAmount * 2
        setResultAmount(winAmount)
        setBalance((prev) => prev + winAmount)
        createConfetti()
      } else {
        const loseAmount = stakeAmount * 0.5
        setResultAmount(loseAmount)
        setBalance((prev) => prev + loseAmount)
      }

      // Reset to idle after showing result
      setTimeout(() => {
        setGameState("idle")
        setResult(null)
      }, 3000)
    }, 3000)
  }

  const resetGame = () => {
    setBalance(100)
    setStake("10")
    setGameState("idle")
    setResult(null)
    setRotation(0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <Card className="w-full max-w-2xl p-8 md:p-12 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-balance">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Doubledown
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">Double your stake or lose half. Take the risk!</p>
        </div>

        {/* Balance Display */}
        <div className="bg-muted rounded-xl p-6 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
          <p className="text-4xl font-bold text-foreground">${balance.toFixed(2)}</p>
        </div>

        {/* Spinner */}
        <div className="relative mb-8 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            {/* Spinner Circle */}
            <div
              className={`absolute inset-0 rounded-full border-8 border-border shadow-2xl overflow-hidden transition-transform duration-[3000ms] ${
                gameState === "spinning" ? "ease-out" : ""
              }`}
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Win Half (Top) - Green */}
              <div className="absolute top-0 left-0 w-full h-1/2 bg-secondary flex items-end justify-center pb-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-secondary-foreground mb-2">2x</div>
                  <div className="text-sm md:text-base font-semibold text-secondary-foreground">DOUBLE!</div>
                </div>
              </div>

              {/* Lose Half (Bottom) - Red */}
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-destructive flex items-start justify-center pt-8">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-destructive-foreground mb-2">0.5x</div>
                  <div className="text-sm md:text-base font-semibold text-destructive-foreground">HALF</div>
                </div>
              </div>
            </div>

            {/* Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-card rounded-full border-4 border-primary shadow-lg z-10 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full"></div>
            </div>

            {/* Pointer Arrow */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-accent drop-shadow-lg"></div>
            </div>

            {/* Glow Effect when spinning */}
            {gameState === "spinning" && <div className="absolute inset-0 rounded-full pulse-glow"></div>}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div className={`mb-8 text-center bounce-in ${result === "win" ? "text-secondary" : "text-destructive"}`}>
            <div className="text-5xl md:text-6xl font-bold mb-2">
              {result === "win" ? "🎉 YOU WON!" : "😅 HALF BACK"}
            </div>
            <div className="text-3xl md:text-4xl font-bold">
              {result === "win" ? "+" : "+"} ${resultAmount.toFixed(2)}
            </div>
          </div>
        )}

        {/* Input and Controls */}
        <div className="space-y-4">
          <div>
            <label htmlFor="stake" className="block text-sm font-medium mb-2 text-foreground">
              Enter Your Stake
            </label>
            <Input
              id="stake"
              type="number"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              disabled={gameState !== "idle"}
              className="text-2xl h-14 text-center font-bold"
              placeholder="10"
              min="0.01"
              step="0.01"
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSpin}
              disabled={gameState !== "idle" || balance <= 0}
              className="flex-1 h-16 text-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              {gameState === "spinning" ? "SPINNING..." : "SPIN NOW!"}
            </Button>

            <Button
              onClick={resetGame}
              disabled={gameState !== "idle"}
              variant="outline"
              className="h-16 px-8 text-lg font-semibold bg-transparent"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Quick Bet Buttons */}
        <div className="mt-6 flex gap-2 justify-center flex-wrap">
          {[5, 10, 25, 50].map((amount) => (
            <Button
              key={amount}
              onClick={() => setStake(amount.toString())}
              disabled={gameState !== "idle"}
              variant="secondary"
              size="sm"
              className="font-semibold"
            >
              ${amount}
            </Button>
          ))}
        </div>

        {/* Game Rules */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-center">
          <p className="font-semibold mb-2 text-foreground">How to Play:</p>
          <p>
            Enter your stake and spin! You have a 50/50 chance to either{" "}
            <span className="text-secondary font-semibold">double your stake</span> or get{" "}
            <span className="text-destructive font-semibold">half back</span>.
          </p>
        </div>
      </Card>
    </div>
  )
}
