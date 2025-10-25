import { useState } from 'react';

const ALL_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'BNBUSDT', 'ADAUSDT', 'TONUSDT'];

export default function Controls({ settings, onChange }) {
  const [localSymbols, setLocalSymbols] = useState(settings.symbols);

  const toggleSymbol = (sym) => {
    const exists = localSymbols.includes(sym);
    const next = exists ? localSymbols.filter((s) => s !== sym) : [...localSymbols, sym];
    setLocalSymbols(next);
    onChange({ ...settings, symbols: next });
  };

  return (
    <div className="grid gap-4 sm:gap-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-white/70">Capital Used (USDT)</label>
          <input
            type="number"
            min={5}
            step={1}
            value={settings.capitalUsed}
            onChange={(e) => onChange({ ...settings, capitalUsed: Math.max(1, Number(e.target.value || 0)) })}
            className="mt-2 w-full rounded-md bg-zinc-800 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div>
          <label className="text-xs text-white/70">Risk Amount per Trade (USDT)</label>
          <input
            type="number"
            min={1}
            step={1}
            value={settings.riskAmount}
            onChange={(e) => onChange({ ...settings, riskAmount: Math.max(1, Number(e.target.value || 0)) })}
            className="mt-2 w-full rounded-md bg-zinc-800 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <div className="flex items-end">
          <span className="text-sm text-white/70">Signals refresh automatically every 5 minutes. Use the Generate Now button below to refresh instantly.</span>
        </div>
      </div>

      <div>
        <label className="text-xs text-white/70">Symbols</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_SYMBOLS.map((sym) => (
            <button
              key={sym}
              onClick={() => toggleSymbol(sym)}
              className={`px-3 py-1.5 rounded-full border ${localSymbols.includes(sym) ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200' : 'bg-zinc-800 border-white/10 text-white/80 hover:bg-zinc-700'}`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
