"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  CandlestickData,
  Time,
  CrosshairMode,
} from "lightweight-charts";
import { CandleData } from "@/types/token";

interface MiniChartProps {
  candles5m: CandleData[];
  candles15m: CandleData[];
  candles1h: CandleData[];
  symbol: string;
  priceUsd: number;
}

type Timeframe = "5m" | "15m" | "1h";

export const MiniChart: React.FC<MiniChartProps> = ({
  candles5m,
  candles15m,
  candles1h,
  symbol,
  priceUsd,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick", Time> | null>(null);

  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("15m");
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);

  // Select candle dataset based on timeframe
  const getCandleData = useCallback((): CandlestickData<Time>[] => {
    let source = candles15m;
    if (activeTimeframe === "5m") source = candles5m;
    if (activeTimeframe === "1h") source = candles1h;

    return source.map((c) => ({
      time: (typeof c.time === "number" ? c.time : Math.floor(new Date(c.time).getTime() / 1000)) as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
  }, [activeTimeframe, candles5m, candles15m, candles1h]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    // Create chart
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94A3B8",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(30, 34, 48, 0.4)", style: 1 },
        horzLines: { color: "rgba(30, 34, 48, 0.4)", style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(112, 83, 245, 0.5)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#7053F5",
        },
        horzLine: {
          color: "rgba(112, 83, 245, 0.5)",
          width: 1,
          style: 3,
          labelBackgroundColor: "#7053F5",
        },
      },
      rightPriceScale: {
        borderColor: "#1E2230",
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: "#1E2230",
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: 260,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#EF4444",
      borderVisible: true,
      borderColor: "#10B981",
      borderUpColor: "#10B981",
      borderDownColor: "#EF4444",
      wickUpColor: "#10B981",
      wickDownColor: "#EF4444",
    });

    const data = getCandleData();
    series.setData(data);
    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove((param) => {
      if (param.time && series) {
        const price = param.seriesData.get(series);
        if (price && "close" in price) {
          setHoveredPrice(Number(price.close));
        }
      } else {
        setHoveredPrice(null);
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize observer
    const handleResize = () => {
      if (container && chartRef.current) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
        });
        chartRef.current.timeScale().fitContent();
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [getCandleData]);

  // Update data when timeframe changes
  useEffect(() => {
    if (seriesRef.current && chartRef.current) {
      const data = getCandleData();
      seriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [getCandleData]);

  const displayPrice = hoveredPrice !== null ? hoveredPrice : priceUsd;

  return (
    <div className="w-full rounded-lg border border-[#1E2230] bg-[#0E1017] p-3">
      {/* Header bar */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {symbol} / USD
          </span>
          <span className="font-mono text-sm font-bold text-white">
            ${displayPrice < 0.01 ? displayPrice.toFixed(6) : displayPrice.toFixed(4)}
          </span>
          {hoveredPrice !== null && (
            <span className="rounded bg-[#7053F5]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#7053F5]">
              Crosshair
            </span>
          )}
        </div>

        {/* Timeframe toggles */}
        <div className="flex items-center rounded border border-[#1E2230] bg-[#12141C] p-0.5 text-xs">
          {(["5m", "15m", "1h"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={`rounded px-2 py-0.5 text-[11px] font-semibold transition-all ${
                activeTimeframe === tf
                  ? "bg-[#7053F5] text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div
        ref={chartContainerRef}
        className="h-[260px] w-full"
        style={{ position: "relative" }}
      />
    </div>
  );
};
