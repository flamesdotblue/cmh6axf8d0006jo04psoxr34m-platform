import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightCircle } from 'lucide-react';
import SignalCard from './SignalCard';

const BYBIT_BASE = 'https://api.bybit.com';

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function fetchTicker(symbol) {
  const url = `${BYBIT_BASE}/v5/market/tickers?category=linear&symbol=${symbol}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ticker fetch failed');
  const data = await res.json();
  const item = data?.result?.list?.[0];
  if (!item) throw new Error('No ticker data');
  return {
    symbol,
    lastPrice: Number(item.lastPrice),
    bid1Price: Number(item.bid1Price ?? item.lastPrice),
    ask1Price: Number(item.ask1Price ?? item.lastPrice),
    time: Date.now(),
  };
}

async function fetchKlines(symbol, interval = '1', limit = 50) {
  const url = `${BYBIT_BASE}/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Kline fetch failed');
  const data = await res.json();
  const list = data?.result?.list || [];
  // Each kline: [start, open, high, low, close, volume, turnover]
  const closes = list.map((k) => Number(k[4])).reverse();
  return closes;
}

function sma(arr, len) {
  if (arr.length < len) return null;
  let sum = 0;
  for (let i = arr.length - len; i < arr.length; i++) sum += arr[i];
  return sum / len;
}

function rsi(values, period = 14) {
  if (values.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = values.length - period; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  const avgGain = gains / period;
  const avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function chooseLeverage(symbol) {
  if (symbol === 'BTCUSDT' || symbol === 'ETHUSDT') return 20;
  return 30;
}

function buildSignal({ symbol, price, capitalUsed, riskAmount, closes }) {
  const L = chooseLeverage(symbol);
  // Decision logic
  const r = rsi(closes, 14);
  const fast = sma(closes, 5);
  const slow = sma(closes, 20);

  let side = 'LONG';
  let reason = '';
  if (r !== null && r < 30) { side = 'LONG'; reason = 'RSI oversold bounce'; }
  else if (r !== null && r > 70) { side = 'SHORT'; reason = 'RSI overbought fade'; }
  else if (fast !== null && slow !== null) {
    if (fast > slow) { side = 'LONG'; reason = 'SMA(5) > SMA(20) momentum'; }
    else { side = 'SHORT'; reason = 'SMA(5) < SMA(20) momentum'; }
  } else {
    // Fallback: small mean-reversion scalp
    side = 'LONG';
    reason = 'Default scalp setup';
  }

  const profitTargetUSDT = capitalUsed; // aim 100% on used capital
  const tpPct = profitTargetUSDT / capitalUsed / L; // e.g., 1/L
  const riskUSDT = Math.min(riskAmount, capitalUsed * 0.5);
  const slPct = riskUSDT / capitalUsed / L;

  const entry = price;
  const takeProfit = side === 'LONG' ? entry * (1 + tpPct) : entry * (1 - tpPct);
  const stopLoss = side === 'LONG' ? entry * (1 - slPct) : entry * (1 + slPct);

  return {
    symbol,
    side,
    price,
    entry,
    takeProfit,
    stopLoss,
    amountUSDT: capitalUsed,
    leverage: L,
    profitTargetUSDT,
    riskUSDT,
    reason,
  };
}

export default function SignalFeed({ settings }) {
  const { capitalUsed, riskAmount, symbols } = settings;
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const lastGenRef = useRef(0);

  const generateSignals = useCallback(async () => {
    setLoading(true);
    setError('');
    const out = [];
    for (const sym of symbols) {
      try {
        // Fetch ticker and klines with small spacing to be polite
        const [ticker, closes] = await Promise.all([
          fetchTicker(sym),
          fetchKlines(sym, '1', 60),
        ]);
        const sig = buildSignal({ symbol: sym, price: ticker.lastPrice, capitalUsed, riskAmount, closes });
        out.push({ ...sig, lastPrice: ticker.lastPrice });
        await sleep(100);
      } catch (e) {
        setError((prev) => prev || 'Network error fetching Bybit data. If this persists, CORS may be blocking requests.');
      }
    }
    // Sort by strongest momentum: distance between SMA5 and SMA20 if available
    const scored = out.map((s) => {
      return { score: Math.abs((s.takeProfit - s.entry) / s.entry) / (s.riskUSDT / s.amountUSDT), ...s };
    }).sort((a, b) => b.score - a.score);

    setSignals(scored.slice(0, 5));
    lastGenRef.current = Date.now();
    setLoading(false);
  }, [symbols, capitalUsed, riskAmount]);

  // Auto-generate immediately and every 5 minutes
  useEffect(() => {
    generateSignals();
    const id = setInterval(generateSignals, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [generateSignals]);

  const timeSince = useMemo(() => {
    if (!lastGenRef.current) return '—';
    const diff = Date.now() - lastGenRef.current;
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}m ${s}s ago`;
  }, [signals]);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-white/70">Last generated: {timeSince}</div>
        <button
          onClick={generateSignals}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium hover:bg-cyan-500"
          disabled={loading}
        >
          <ArrowRightCircle className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate Now'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-yellow-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {signals.map((sig) => (
          <SignalCard key={`${sig.symbol}-${sig.side}`} signal={sig} />
        ))}
      </div>
    </div>
  );
}
