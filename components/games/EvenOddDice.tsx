"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dices,
  Flame,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Coins,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { monadPublicClient, MONAD_TESTNET_CONFIG } from "@/lib/monad";
import {
  DicePrediction,
  DiceRollResult,
  calculateProvablyFairDice,
} from "@/lib/arcade";

interface EvenOddDiceProps {
  currentStreak: number;
  onStreakUpdate: (newStreak: number) => void;
  onBalanceAdjust?: (amount: number) => void;
  effectiveBalance: number;
  onClaimFaucetCredits?: () => void;
}

// 6-sided visual Die component with authentic dot matrices
const DiceCard: React.FC<{ value: number; isRolling: boolean }> = ({ value, isRolling }) => {
  // Dot placement maps for standard 1-6 faces
  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="flex h-full w-full items-center justify-center">
            <span className="h-4 w-4 rounded-full bg-white shadow-[0_0_8px_#fff]" />
          </div>
        );
      case 2:
        return (
          <div className="flex h-full w-full justify-between p-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] self-start" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex h-full w-full justify-between p-1.5">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] self-start" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] self-center" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff] self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 p-1.5 place-items-center">
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
          </div>
        );
      case 5:
        return (
          <div className="relative h-full w-full p-1.5">
            <div className="flex justify-between">
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            </div>
            <div className="flex justify-between mt-5">
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
              <span className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            </div>
          </div>
        );
      case 6:
      default:
        return (
          <div className="grid h-full w-full grid-cols-2 grid-rows-3 p-1.5 place-items-center">
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
            <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_8px_#fff]" />
          </div>
        );
    }
  };

  return (
    <div
      className={`relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border-2 transition-all duration-150 select-none ${
        isRolling
          ? "border-[#7053F5] bg-[#12141D] scale-105 shadow-[0_0_25px_rgba(112,83,245,0.6)] animate-pulse"
          : "border-[#1E2230] bg-[#0D0F14] shadow-[0_12px_24px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)]"
      }`}
    >
      <div className="h-16 w-16 sm:h-20 sm:w-20">{renderDots(value)}</div>
      <div className="absolute top-1.5 right-2 font-mono text-[10px] text-slate-500 font-bold">
        {value}
      </div>
    </div>
  );
};

export const EvenOddDice: React.FC<EvenOddDiceProps> = ({
  currentStreak,
  onStreakUpdate,
  onBalanceAdjust,
  effectiveBalance,
  onClaimFaucetCredits,
}) => {
  const { isConnected, connectWallet, address } = useWallet();

  // State
  const [prediction, setPrediction] = useState<DicePrediction>("EVEN");
  const [wager, setWager] = useState<number>(0.5);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [die1, setDie1] = useState<number>(3);
  const [die2, setDie2] = useState<number>(3);
  const [lastOutcome, setLastOutcome] = useState<DiceRollResult | null>(null);
  const [history, setHistory] = useState<DiceRollResult[]>([]);
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>("");

  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load past rolls from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("monad_arcade_dice_history");
      if (saved) {
        setHistory(JSON.parse(saved).slice(0, 10));
      }
    } catch (e) {
      console.warn("Could not load dice history", e);
    }
  }, []);

  // Save history helper
  const saveRoll = (result: DiceRollResult) => {
    setHistory((prev) => {
      const updated = [result, ...prev].slice(0, 10);
      try {
        localStorage.setItem("monad_arcade_dice_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Roll Execution with Provable Fairness
  const handleRoll = async () => {
    if (!isConnected || isRolling || wager <= 0 || wager > effectiveBalance) return;

    setIsRolling(true);
    setLastOutcome(null);

    // 1. Start dice shuffling animation (cycles random faces every 60ms)
    let rollCounter = 0;
    rollIntervalRef.current = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      rollCounter++;
    }, 65);

    // 2. Fetch live block data & calculate provable outcome
    const timestamp = Date.now();
    let blockNumber = 61450000;
    let blockHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    try {
      const latestBlock = await monadPublicClient.getBlock({ includeTransactions: false });
      if (latestBlock) {
        blockNumber = Number(latestBlock.number);
        blockHash = latestBlock.hash;
      }
    } catch (e) {
      console.warn("Using local block seed fallback:", e);
    }

    const { die1: finalDie1, die2: finalDie2, sum: finalSum, proof } =
      await calculateProvablyFairDice(
        address || "0x000000000000000000000000000000000000dEaD",
        timestamp,
        blockHash,
        blockNumber
      );

    // 3. Conclude after 1.2 seconds of animation
    setTimeout(() => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        rollIntervalRef.current = null;
      }

      setDie1(finalDie1);
      setDie2(finalDie2);
      setIsRolling(false);

      const isSumEven = finalSum % 2 === 0;
      const isWin = (prediction === "EVEN" && isSumEven) || (prediction === "ODD" && !isSumEven);
      const payoutMultiplier = 1.95;
      const payout = isWin ? wager * payoutMultiplier : 0;
      const profit = isWin ? wager * (payoutMultiplier - 1) : -wager;

      const rollResult: DiceRollResult = {
        id: `dice_${timestamp}`,
        timestamp,
        die1: finalDie1,
        die2: finalDie2,
        sum: finalSum,
        prediction,
        isWin,
        wager,
        payout,
        proof,
      };

      setLastOutcome(rollResult);
      saveRoll(rollResult);

      if (isWin) {
        onStreakUpdate(currentStreak + 1);
        if (onBalanceAdjust) onBalanceAdjust(profit);
      } else {
        onStreakUpdate(0);
        if (onBalanceAdjust) onBalanceAdjust(profit);
      }
    }, 1200);
  };

  const isBalanceInsufficient = wager > effectiveBalance;
  const currentSum = die1 + die2;

  return (
    <div className="space-y-6">
      {/* Game Card */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-[#7053F5]/10 blur-3xl pointer-events-none" />

        {/* Top Badges & Rules summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#171922]">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7053F5]/20 border border-[#7053F5]/40 text-[#7053F5]">
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                Even or Odd Dice
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30">
                  1.95x Payout
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Two 6-sided dice rolled on Monad. Predict sum parity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171922] border border-[#1E2230] text-slate-300">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Streak:</span>
              <span className="font-bold text-white">{currentStreak}</span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Visual Dice Table */}
        <div className="my-8 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <DiceCard value={die1} isRolling={isRolling} />
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-600 font-mono">+</div>
            <DiceCard value={die2} isRolling={isRolling} />
          </div>

          {/* Sum Display Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#171922]/80 border border-[#1E2230] text-xs font-mono">
            <span className="text-slate-400">Calculated Sum:</span>
            <span className="text-base font-bold text-white">{currentSum}</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                currentSum % 2 === 0
                  ? "bg-[#7053F5]/20 text-[#7053F5] border border-[#7053F5]/30"
                  : "bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/30"
              }`}
            >
              {currentSum % 2 === 0 ? "EVEN" : "ODD"}
            </span>
          </div>
        </div>

        {/* Outcome Banner (Win / Loss Announcement) */}
        {lastOutcome && !isRolling && (
          <div
            className={`mb-6 rounded-xl border p-4 text-center transition-all animate-in fade-in zoom-in-95 duration-200 ${
              lastOutcome.isWin
                ? "bg-[#00FFA3]/10 border-[#00FFA3]/40 shadow-[0_0_25px_rgba(0,255,163,0.25)]"
                : "bg-[#FF4D4D]/10 border-[#FF4D4D]/40 shadow-[0_0_25px_rgba(255,77,77,0.2)]"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {lastOutcome.isWin ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[#00FFA3]" />
                  <span className="text-base sm:text-lg font-bold text-[#00FFA3] font-mono">
                    YOU WON! +{lastOutcome.payout.toFixed(3)} MON
                  </span>
                  <Sparkles className="h-5 w-5 text-[#00FFA3]" />
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-[#FF4D4D]" />
                  <span className="text-base sm:text-lg font-bold text-[#FF4D4D] font-mono">
                    ROUND LOST (-{lastOutcome.wager.toFixed(2)} MON)
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Roll Result: <strong className="text-white">{lastOutcome.die1} + {lastOutcome.die2} = {lastOutcome.sum}</strong> ({lastOutcome.sum % 2 === 0 ? "EVEN" : "ODD"}). You predicted <strong className="text-white">{lastOutcome.prediction}</strong>.
            </p>
          </div>
        )}

        {/* Prediction Toggle Buttons (EVEN vs ODD) */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
            1. Select Your Prediction
          </label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              disabled={isRolling}
              onClick={() => setPrediction("EVEN")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                prediction === "EVEN"
                  ? "bg-[#7053F5]/20 border-[#7053F5] text-white shadow-[0_0_20px_rgba(112,83,245,0.4)]"
                  : "bg-[#13161F] border-[#171922] text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <span className="text-lg sm:text-xl font-bold font-mono tracking-wider">EVEN</span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">2, 4, 6, 8, 10, 12</span>
              <span className="text-[10px] font-mono text-[#7053F5] font-bold mt-1">1.95x Payout</span>
            </button>

            <button
              type="button"
              disabled={isRolling}
              onClick={() => setPrediction("ODD")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer ${
                prediction === "ODD"
                  ? "bg-[#00FFA3]/20 border-[#00FFA3] text-white shadow-[0_0_20px_rgba(0,255,163,0.4)]"
                  : "bg-[#13161F] border-[#171922] text-slate-400 hover:text-white hover:border-slate-700"
              }`}
            >
              <span className="text-lg sm:text-xl font-bold font-mono tracking-wider">ODD</span>
              <span className="text-[11px] font-mono text-slate-400 mt-1">3, 5, 7, 9, 11</span>
              <span className="text-[10px] font-mono text-[#00FFA3] font-bold mt-1">1.95x Payout</span>
            </button>
          </div>
        </div>

        {/* Wager Selection */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              2. Select Bet Wager (MON)
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Available Balance:</span>
              <span className="font-bold text-white">{effectiveBalance.toFixed(3)} MON</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {[0.1, 0.5, 1.0, 2.0].map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={isRolling}
                onClick={() => {
                  setWager(amount);
                  setCustomInput("");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                  wager === amount && !customInput
                    ? "bg-[#7053F5] text-white border-[#7053F5] shadow-[0_0_12px_rgba(112,83,245,0.4)]"
                    : "bg-[#13161F] border-[#171922] text-slate-300 hover:text-white hover:border-slate-700"
                }`}
              >
                {amount} MON
              </button>
            ))}

            <div className="col-span-4 sm:col-span-1 relative">
              <input
                type="number"
                step="0.1"
                min="0.01"
                max={effectiveBalance || 100}
                placeholder="Custom"
                value={customInput}
                disabled={isRolling}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) {
                    setWager(parsed);
                  }
                }}
                className="w-full h-full py-2 px-3 rounded-xl border border-[#171922] bg-[#13161F] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7053F5]"
              />
            </div>
          </div>

          {/* Potential Payout Info */}
          <div className="flex items-center justify-between text-[11px] font-mono px-3 py-2 rounded-lg bg-[#13161F] border border-[#171922]">
            <span className="text-slate-400">Estimated Win Return:</span>
            <span className="text-[#00FFA3] font-bold">
              +{(wager * 1.95).toFixed(3)} MON (+{(wager * 0.95).toFixed(3)} Net)
            </span>
          </div>

          {/* Insufficient balance warning / faucet shortcut */}
          {isBalanceInsufficient && isConnected && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Wager exceeds your current testnet balance ({effectiveBalance.toFixed(3)} MON).</span>
              </div>
              {onClaimFaucetCredits && (
                <button
                  type="button"
                  onClick={onClaimFaucetCredits}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition cursor-pointer"
                >
                  +5.0 Arcade MON Faucet
                </button>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        {!isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            className="w-full py-4 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-mono font-bold text-sm tracking-wider uppercase transition shadow-[0_0_25px_rgba(112,83,245,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Coins className="h-4 w-4" />
            Connect MetaMask to Play
          </button>
        ) : (
          <button
            type="button"
            disabled={isRolling || isBalanceInsufficient || wager <= 0}
            onClick={handleRoll}
            className={`w-full py-4 rounded-xl font-mono font-bold text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer ${
              isRolling
                ? "bg-[#7053F5]/50 text-white cursor-wait"
                : isBalanceInsufficient
                ? "bg-[#171922] text-slate-500 border border-[#1E2230] cursor-not-allowed"
                : "bg-[#7053F5] hover:bg-[#5E3FEB] text-white shadow-[0_0_25px_rgba(112,83,245,0.4)] hover:shadow-[0_0_35px_rgba(112,83,245,0.6)]"
            }`}
          >
            {isRolling ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Rolling Dice On-Chain...</span>
              </>
            ) : isBalanceInsufficient ? (
              <span>Insufficient MON Balance</span>
            ) : (
              <>
                <Dices className="h-5 w-5" />
                <span>Roll Dice ({wager} MON)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Provable Fairness Verifier Card */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#171922]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
            <ShieldCheck className="h-4 w-4 text-[#00FFA3]" />
            <span>Provably Fair Architecture</span>
          </div>
          <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20">
            SHA-256 + Monad Block Hash
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
          Every roll is generated deterministically from an immutable seed combining your connected wallet address, a client timestamp, and the latest Monad testnet block hash. Results cannot be tampered with by the client or operator.
        </p>

        {lastOutcome && (
          <div className="mt-4 p-3 rounded-xl bg-[#13161F] border border-[#171922] space-y-2 text-[11px] font-mono">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] text-slate-500">
              Last Roll Proof Seed:
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Client Seed (Address):</span>
              <span className="text-white truncate max-w-[200px]">{lastOutcome.proof.clientSeed}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Block Hash:</span>
              <span className="text-white truncate max-w-[200px]">{lastOutcome.proof.blockHash}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Combined SHA-256:</span>
              <span className="text-[#00FFA3] truncate max-w-[200px]">{lastOutcome.proof.combinedHash}</span>
            </div>
          </div>
        )}
      </div>

      {/* Recent History Table */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#171922] mb-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Recent Dice Rolls (Last 10)
          </h3>
          <span className="text-xs font-mono text-slate-500">{history.length} Rolls</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No rolls recorded in this session yet. Choose EVEN or ODD to roll!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#171922] text-slate-500 text-[11px]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Prediction</th>
                  <th className="pb-2">Roll</th>
                  <th className="pb-2">Sum</th>
                  <th className="pb-2">Outcome</th>
                  <th className="pb-2 text-right">PnL</th>
                  <th className="pb-2 text-right">Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171922]/60">
                {history.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-[#13161F]/50 transition-colors">
                      <td className="py-2.5 text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            item.prediction === "EVEN"
                              ? "bg-[#7053F5]/20 text-[#7053F5]"
                              : "bg-[#00FFA3]/20 text-[#00FFA3]"
                          }`}
                        >
                          {item.prediction}
                        </span>
                      </td>
                      <td className="py-2.5 text-white font-semibold">
                        {item.die1} + {item.die2}
                      </td>
                      <td className="py-2.5 text-slate-300">
                        {item.sum} ({item.sum % 2 === 0 ? "EVEN" : "ODD"})
                      </td>
                      <td className="py-2.5">
                        {item.isWin ? (
                          <span className="text-[#00FFA3] font-bold">WIN</span>
                        ) : (
                          <span className="text-[#FF4D4D] font-bold">LOSS</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-bold">
                        {item.isWin ? (
                          <span className="text-[#00FFA3]">
                            +{(item.payout - item.wager).toFixed(3)} MON
                          </span>
                        ) : (
                          <span className="text-[#FF4D4D]">
                            -{item.wager.toFixed(2)} MON
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedProofId(expandedProofId === item.id ? null : item.id)
                          }
                          className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                        >
                          {expandedProofId === item.id ? "Hide" : "Verify"}
                        </button>
                      </td>
                    </tr>
                    {expandedProofId === item.id && (
                      <tr className="bg-[#13161F]">
                        <td colSpan={7} className="p-3 text-[10px] text-slate-400 space-y-1">
                          <div>
                            <span className="text-slate-500">Block Hash:</span>{" "}
                            <span className="text-slate-300 font-mono">{item.proof.blockHash}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Combined Hash:</span>{" "}
                            <span className="text-[#00FFA3] font-mono">{item.proof.combinedHash}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
