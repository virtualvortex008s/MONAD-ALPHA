"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Flame,
  AlertCircle,
  Coins,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { ASSET_PAIRS, PriceDirection, PricePredictionRound, PricePoint } from "@/lib/arcade";

interface PricePredictionProps {
  currentStreak: number;
  onStreakUpdate: (newStreak: number) => void;
  onBalanceAdjust?: (amount: number) => void;
  effectiveBalance: number;
  onClaimFaucetCredits?: () => void;
}

export const PricePrediction: React.FC<PricePredictionProps> = ({
  currentStreak,
  onStreakUpdate,
  onBalanceAdjust,
  effectiveBalance,
  onClaimFaucetCredits,
}) => {
  const { isConnected, connectWallet } = useWallet();

  // Selected pair
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const activePair = ASSET_PAIRS[selectedPairIndex];

  // Live Price State
  const [currentPrice, setCurrentPrice] = useState<number>(activePair.basePrice);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>(() => {
    const now = Date.now();
    const initPoints: PricePoint[] = [];
    let p = activePair.basePrice;
    for (let i = 29; i >= 0; i--) {
      p += (Math.random() - 0.49) * activePair.volatility;
      initPoints.push({ time: now - i * 1500, price: Number(p.toFixed(activePair.minDecimals)) });
    }
    return initPoints;
  });
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [tickDirection, setTickDirection] = useState<"UP" | "DOWN" | "NEUTRAL">("NEUTRAL");

  // Round State
  const [wager, setWager] = useState<number>(0.5);
  const [customWagerInput, setCustomWagerInput] = useState<string>("");
  const [activeRound, setActiveRound] = useState<PricePredictionRound | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [settlementResult, setSettlementResult] = useState<PricePredictionRound | null>(null);
  const [roundHistory, setRoundHistory] = useState<PricePredictionRound[]>([]);

  // Ticker timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load round history from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("monad_arcade_price_history");
      if (saved) {
        setRoundHistory(JSON.parse(saved).slice(0, 10));
      }
    } catch {}
  }, []);

  // Save round to history
  const saveRound = (round: PricePredictionRound) => {
    setRoundHistory((prev) => {
      const updated = [round, ...prev].slice(0, 10);
      try {
        localStorage.setItem("monad_arcade_price_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Live Price Ticker Simulation (updates every 1.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prevPrice) => {
        const change = (Math.random() - 0.49) * activePair.volatility;
        const newPrice = Number((prevPrice + change).toFixed(activePair.minDecimals));
        const delta = newPrice - prevPrice;

        setPriceDelta(delta);
        setTickDirection(delta >= 0 ? "UP" : "DOWN");

        setPriceHistory((prev) => {
          const updated = [...prev.slice(1), { time: Date.now(), price: newPrice }];
          return updated;
        });

        return newPrice;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [activePair]);

  // Active Round 30s Countdown timer
  useEffect(() => {
    if (!activeRound) return;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((activeRound.endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      // Round Finished / Settlement
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);

        const finalPrice = currentPrice;
        const lockPrice = activeRound.lockPrice;
        const priceWentUp = finalPrice > lockPrice;
        const priceWentDown = finalPrice < lockPrice;

        let isWin = false;
        if (activeRound.direction === "HIGHER" && priceWentUp) isWin = true;
        if (activeRound.direction === "LOWER" && priceWentDown) isWin = true;

        const payoutMultiplier = 1.90;
        const payout = isWin ? activeRound.wager * payoutMultiplier : 0;
        const profit = isWin ? activeRound.wager * (payoutMultiplier - 1) : -activeRound.wager;

        const settled: PricePredictionRound = {
          ...activeRound,
          finalPrice,
          payout,
          isWin,
          status: "SETTLED",
        };

        setActiveRound(null);
        setSettlementResult(settled);
        saveRound(settled);

        if (isWin) {
          onStreakUpdate(currentStreak + 1);
          if (onBalanceAdjust) onBalanceAdjust(profit);
        } else {
          onStreakUpdate(0);
          if (onBalanceAdjust) onBalanceAdjust(profit);
        }
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeRound, currentPrice, currentStreak, onStreakUpdate, onBalanceAdjust]);

  // Start a new 30s prediction round
  const handleStartPrediction = (direction: PriceDirection) => {
    if (!isConnected || activeRound || wager <= 0 || wager > effectiveBalance) return;

    const now = Date.now();
    const durationSeconds = 30;
    const roundId = `#MN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newRound: PricePredictionRound = {
      id: roundId,
      pair: activePair.symbol,
      startTime: now,
      endTime: now + durationSeconds * 1000,
      durationSeconds,
      lockPrice: currentPrice,
      direction,
      wager,
      payout: 0,
      status: "ACTIVE",
    };

    setSettlementResult(null);
    setTimeLeft(durationSeconds);
    setActiveRound(newRound);
  };

  // Sparkline SVG path calculations
  const chartSvgData = useMemo(() => {
    if (priceHistory.length < 2) {
      return {
        path: "",
        fillPath: "",
        min: 0,
        max: 0,
        lockPriceY: null as number | null,
        lastPoint: undefined as number[] | undefined,
      };
    }
    const prices = priceHistory.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const width = 500;
    const height = 140;
    const padding = 15;

    const points = priceHistory.map((pt, idx) => {
      const x = padding + (idx / (priceHistory.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((pt.price - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    });

    // Lock price horizontal line coordinate if round active
    let lockPriceY: number | null = null;
    if (activeRound) {
      lockPriceY =
        height - padding - ((activeRound.lockPrice - min) / range) * (height - 2 * padding);
    }

    return {
      path: `M ${points.join(" L ")}`,
      fillPath: `M ${points[0]} L ${points.join(" L ")} L ${
        width - padding
      },${height} L ${padding},${height} Z`,
      min,
      max,
      lockPriceY,
      lastPoint: points[points.length - 1]?.split(",").map(Number),
    };
  }, [priceHistory, activeRound]);

  const isBalanceInsufficient = wager > effectiveBalance;
  const isWinningCurrently =
    activeRound &&
    ((activeRound.direction === "HIGHER" && currentPrice > activeRound.lockPrice) ||
      (activeRound.direction === "LOWER" && currentPrice < activeRound.lockPrice));

  return (
    <div className="space-y-6">
      {/* Main Terminal Card */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-72 w-72 rounded-full bg-[#00FFA3]/5 blur-3xl pointer-events-none" />

        {/* Top Header & Pair Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#171922]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00FFA3]/15 border border-[#00FFA3]/30 text-[#00FFA3]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                  Live Market Action
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30 font-mono">
                  1.90x Payout
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#7053F5]/15 text-[#7053F5] border border-[#7053F5]/30 font-mono">
                  30s Turbo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predict whether price will close higher or lower in 30 seconds.
              </p>
            </div>
          </div>

          {/* Pair Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#13161F] border border-[#171922] p-1 rounded-xl font-mono text-xs">
            {ASSET_PAIRS.map((pair, idx) => (
              <button
                key={pair.symbol}
                type="button"
                disabled={!!activeRound}
                onClick={() => {
                  setSelectedPairIndex(idx);
                  setCurrentPrice(pair.basePrice);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  selectedPairIndex === idx
                    ? "bg-[#7053F5] text-white font-bold shadow-[0_0_12px_rgba(112,83,245,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-[#1E2230]"
                }`}
              >
                {pair.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Live Price Header with Flashing Indicator */}
        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Live {activePair.symbol} Price
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
                ${currentPrice.toFixed(activePair.minDecimals)}
              </span>
              <div
                className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full transition-colors ${
                  tickDirection === "UP"
                    ? "bg-[#00FFA3]/15 text-[#00FFA3] border border-[#00FFA3]/30"
                    : tickDirection === "DOWN"
                    ? "bg-[#FF4D4D]/15 text-[#FF4D4D] border border-[#FF4D4D]/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {tickDirection === "UP" ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span>
                  {priceDelta >= 0 ? "+" : ""}
                  {priceDelta.toFixed(activePair.minDecimals)}
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
              <span>Real-time Monad DEX stream (1.5s ticks)</span>
            </div>
          </div>

          {/* Active Round Status Box (or Idle indicator) */}
          <div className="md:col-span-2 rounded-xl bg-[#13161F] border border-[#171922] p-4">
            {activeRound ? (
              <div className="space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-xs font-bold text-white">
                      Round {activeRound.id} In Progress
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeRound.direction === "HIGHER"
                          ? "bg-[#00FFA3]/20 text-[#00FFA3]"
                          : "bg-[#FF4D4D]/20 text-[#FF4D4D]"
                      }`}
                    >
                      Prediction: {activeRound.direction} (
                      {activeRound.direction === "HIGHER" ? "Bull" : "Bear"})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{timeLeft}s remaining</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-[#1E2230] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7053F5] to-[#00FFA3] transition-all duration-1000 ease-linear"
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                  />
                </div>

                {/* Lock vs Current Comparison */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Lock Price:</span>
                    <span className="font-bold text-white">
                      ${activeRound.lockPrice.toFixed(activePair.minDecimals)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Delta:</span>
                    <span
                      className={`font-bold ${
                        isWinningCurrently ? "text-[#00FFA3]" : "text-[#FF4D4D]"
                      }`}
                    >
                      {(currentPrice - activeRound.lockPrice >= 0 ? "+" : "") +
                        (currentPrice - activeRound.lockPrice).toFixed(activePair.minDecimals)}{" "}
                      ({isWinningCurrently ? "WINNING" : "LOSING"})
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] block">Potential Payout:</span>
                    <span className="font-bold text-[#00FFA3]">
                      +{(activeRound.wager * 1.9).toFixed(3)} MON
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#7053F5]" />
                  <span>30-Second Continuous Binary Rounds Ready</span>
                </div>
                <span className="text-slate-500 text-[11px]">Choose HIGHER or LOWER below</span>
              </div>
            )}
          </div>
        </div>

        {/* Real-time SVG Mini Sparkline Chart */}
        <div className="my-6 rounded-xl bg-[#090B0F] border border-[#171922] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pb-2 border-b border-[#171922]/50">
            <span>Price Curve (Last 30 Ticks)</span>
            <span>Range: ${chartSvgData.min.toFixed(4)} - ${chartSvgData.max.toFixed(4)}</span>
          </div>

          <div className="relative h-36 w-full mt-2">
            <svg
              viewBox="0 0 500 140"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7053F5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7053F5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area fill */}
              {chartSvgData.fillPath && (
                <path d={chartSvgData.fillPath} fill="url(#chartGradient)" />
              )}

              {/* Line path */}
              {chartSvgData.path && (
                <path
                  d={chartSvgData.path}
                  fill="none"
                  stroke={tickDirection === "UP" ? "#00FFA3" : "#7053F5"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Lock Price Horizontal Dashed Line (if active round) */}
              {typeof chartSvgData.lockPriceY === "number" && (
                <g>
                  <line
                    x1="15"
                    y1={chartSvgData.lockPriceY}
                    x2="485"
                    y2={chartSvgData.lockPriceY}
                    stroke="#F59E0B"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <text
                    x="20"
                    y={chartSvgData.lockPriceY - 4}
                    fill="#F59E0B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    Lock: ${activeRound?.lockPrice.toFixed(4)}
                  </text>
                </g>
              )}

              {/* Glowing Pulse on Current Price Point */}
              {chartSvgData.lastPoint && (
                <circle
                  cx={chartSvgData.lastPoint[0]}
                  cy={chartSvgData.lastPoint[1]}
                  r="5"
                  fill="#00FFA3"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Settlement Popup Modal / Alert */}
        {settlementResult && (
          <div
            className={`mb-6 rounded-xl border p-5 transition-all animate-in fade-in zoom-in-95 duration-200 ${
              settlementResult.isWin
                ? "bg-[#00FFA3]/10 border-[#00FFA3]/40 shadow-[0_0_25px_rgba(0,255,163,0.25)]"
                : "bg-[#FF4D4D]/10 border-[#FF4D4D]/40 shadow-[0_0_25px_rgba(255,77,77,0.2)]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {settlementResult.isWin ? (
                  <CheckCircle2 className="h-6 w-6 text-[#00FFA3]" />
                ) : (
                  <XCircle className="h-6 w-6 text-[#FF4D4D]" />
                )}
                <div>
                  <h4 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    {settlementResult.isWin ? (
                      <>
                        <span className="text-[#00FFA3]">ROUND WON!</span>
                        <span className="text-white">+{settlementResult.payout.toFixed(3)} MON</span>
                        <Sparkles className="h-4 w-4 text-[#00FFA3]" />
                      </>
                    ) : (
                      <>
                        <span className="text-[#FF4D4D]">ROUND LOST</span>
                        <span className="text-slate-400">
                          (-{settlementResult.wager.toFixed(2)} MON)
                        </span>
                      </>
                    )}
                  </h4>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    Locked at ${settlementResult.lockPrice.toFixed(4)} → Closed at $
                    {settlementResult.finalPrice?.toFixed(4)}. You predicted{" "}
                    <strong>{settlementResult.direction}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSettlementResult(null)}
                className="px-3 py-1.5 rounded-lg bg-[#13161F] hover:bg-[#1E2230] text-xs font-mono text-slate-300 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Wager Selection & Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">
              Select Bet Amount (MON)
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span>Available:</span>
              <span className="font-bold text-white">{effectiveBalance.toFixed(3)} MON</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {[0.1, 0.5, 1.0, 2.0].map((amount) => (
              <button
                key={amount}
                type="button"
                disabled={!!activeRound}
                onClick={() => {
                  setWager(amount);
                  setCustomWagerInput("");
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition cursor-pointer ${
                  wager === amount && !customWagerInput
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
                placeholder="Custom"
                value={customWagerInput}
                disabled={!!activeRound}
                onChange={(e) => {
                  setCustomWagerInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) {
                    setWager(parsed);
                  }
                }}
                className="w-full h-full py-2 px-3 rounded-xl border border-[#171922] bg-[#13161F] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#7053F5]"
              />
            </div>
          </div>

          {/* Low Balance Warning */}
          {isBalanceInsufficient && isConnected && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Wager exceeds balance ({effectiveBalance.toFixed(3)} MON).</span>
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

        {/* Prediction Action Buttons (Bull HIGHER vs Bear LOWER) */}
        {!isConnected ? (
          <button
            type="button"
            onClick={connectWallet}
            className="w-full py-4 rounded-xl bg-[#7053F5] hover:bg-[#5E3FEB] text-white font-mono font-bold text-sm tracking-wider uppercase transition shadow-[0_0_25px_rgba(112,83,245,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Coins className="h-4 w-4" />
            Connect MetaMask to Predict
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={!!activeRound || isBalanceInsufficient || wager <= 0}
              onClick={() => handleStartPrediction("HIGHER")}
              className={`py-4 px-4 rounded-xl font-mono font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeRound
                  ? "bg-[#171922] text-slate-600 border border-[#1E2230] cursor-not-allowed"
                  : isBalanceInsufficient
                  ? "bg-[#171922] text-slate-600 border border-[#1E2230] cursor-not-allowed"
                  : "bg-[#00FFA3]/15 hover:bg-[#00FFA3]/25 text-[#00FFA3] border border-[#00FFA3]/40 shadow-[0_0_20px_rgba(0,255,163,0.25)] hover:shadow-[0_0_30px_rgba(0,255,163,0.4)]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-base sm:text-lg">
                <TrendingUp className="h-5 w-5" />
                <span>HIGHER (Bull)</span>
              </div>
              <span className="text-[11px] text-[#00FFA3]/80">
                Wins if &gt; Lock Price in 30s · 1.90x
              </span>
            </button>

            <button
              type="button"
              disabled={!!activeRound || isBalanceInsufficient || wager <= 0}
              onClick={() => handleStartPrediction("LOWER")}
              className={`py-4 px-4 rounded-xl font-mono font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                activeRound
                  ? "bg-[#171922] text-slate-600 border border-[#1E2230] cursor-not-allowed"
                  : isBalanceInsufficient
                  ? "bg-[#171922] text-slate-600 border border-[#1E2230] cursor-not-allowed"
                  : "bg-[#FF4D4D]/15 hover:bg-[#FF4D4D]/25 text-[#FF4D4D] border border-[#FF4D4D]/40 shadow-[0_0_20px_rgba(255,77,77,0.2)] hover:shadow-[0_0_30px_rgba(255,77,77,0.35)]"
              }`}
            >
              <div className="flex items-center gap-1.5 text-base sm:text-lg">
                <TrendingDown className="h-5 w-5" />
                <span>LOWER (Bear)</span>
              </div>
              <span className="text-[11px] text-[#FF4D4D]/80">
                Wins if &lt; Lock Price in 30s · 1.90x
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard & Recent Rounds Table */}
      <div className="rounded-2xl border border-[#171922] bg-[#0D0F14] p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#171922] mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#F5A623]" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Recent Price Rounds (Last 10)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{roundHistory.length} Settled</span>
        </div>

        {roundHistory.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            No rounds played yet. Place a Bull or Bear prediction to start!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#171922] text-slate-500 text-[11px]">
                  <th className="pb-2">Round ID</th>
                  <th className="pb-2">Pair</th>
                  <th className="pb-2">Direction</th>
                  <th className="pb-2">Lock Price</th>
                  <th className="pb-2">Final Price</th>
                  <th className="pb-2">Outcome</th>
                  <th className="pb-2 text-right">PnL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#171922]/60">
                {roundHistory.map((r) => (
                  <tr key={r.id} className="hover:bg-[#13161F]/50 transition-colors">
                    <td className="py-2.5 text-slate-400 font-bold">{r.id}</td>
                    <td className="py-2.5 text-white">{r.pair}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          r.direction === "HIGHER"
                            ? "bg-[#00FFA3]/20 text-[#00FFA3]"
                            : "bg-[#FF4D4D]/20 text-[#FF4D4D]"
                        }`}
                      >
                        {r.direction}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">${r.lockPrice.toFixed(4)}</td>
                    <td className="py-2.5 text-slate-300">
                      ${r.finalPrice ? r.finalPrice.toFixed(4) : "-"}
                    </td>
                    <td className="py-2.5">
                      {r.isWin ? (
                        <span className="text-[#00FFA3] font-bold">WIN</span>
                      ) : (
                        <span className="text-[#FF4D4D] font-bold">LOSS</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-bold">
                      {r.isWin ? (
                        <span className="text-[#00FFA3]">
                          +{(r.payout - r.wager).toFixed(3)} MON
                        </span>
                      ) : (
                        <span className="text-[#FF4D4D]">-{r.wager.toFixed(2)} MON</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
