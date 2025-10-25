export default function SignalCard({ signal }) {
  const {
    symbol,
    side,
    price,
    entry,
    takeProfit,
    stopLoss,
    amountUSDT,
    leverage,
    profitTargetUSDT,
    riskUSDT,
    reason,
  } = signal;

  const format = (n) => {
    if (!isFinite(n)) return '—';
    // Adaptive decimals
    if (n >= 100) return n.toFixed(2);
    if (n >= 1) return n.toFixed(3);
    return n.toFixed(6);
  };

  const tpPct = ((Math.abs(takeProfit - entry) / entry) * 100).toFixed(2);
  const slPct = ((Math.abs(stopLoss - entry) / entry) * 100).toFixed(2);

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-white/60">Current Coin Live Market Price (Bybit)</div>
          <div className="text-lg font-semibold mt-1">{symbol} • ${format(price)}</div>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${side === 'LONG' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>{side}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <div className="text-white/60">Pair & Direction</div>
          <div className="font-medium">{side} {symbol}</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/60">Recommended Amount & Leverage</div>
          <div className="font-medium">${amountUSDT} USDT at {leverage}x</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/60">Profit Target / Risk (USDT)</div>
          <div className="font-medium">${profitTargetUSDT} / ${riskUSDT}</div>
        </div>
        <div className="space-y-1">
          <div className="text-white/60">Capital Used</div>
          <div className="font-medium">$20 USDT</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg bg-zinc-800/60 p-3">
          <div className="text-white/60">Entry</div>
          <div className="font-semibold">${format(entry)}</div>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-3">
          <div className="text-white/60">Take Profit</div>
          <div className="font-semibold">${format(takeProfit)} <span className="text-white/50">({tpPct}%)</span></div>
        </div>
        <div className="rounded-lg bg-zinc-800/60 p-3">
          <div className="text-white/60">Stop Loss</div>
          <div className="font-semibold">${format(stopLoss)} <span className="text-white/50">({slPct}%)</span></div>
        </div>
      </div>

      {reason && (
        <div className="mt-3 text-xs text-white/70">Reasoning: {reason}</div>
      )}
    </div>
  );
}
