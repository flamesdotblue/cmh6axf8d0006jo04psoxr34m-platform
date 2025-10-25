import { useState } from 'react';
import HeroCover from './components/HeroCover';
import Controls from './components/Controls';
import SignalFeed from './components/SignalFeed';

export default function App() {
  const [settings, setSettings] = useState({
    capitalUsed: 20,
    riskAmount: 5,
    symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'],
  });

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="relative h-[60vh] w-full">
        <HeroCover />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">Crypto Futures Alpha Signals</h1>
          <p className="mt-4 max-w-2xl text-white/80">High-probability scalps and quick swings, refreshed every 5 minutes. Data sourced from Bybit public market endpoints.</p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 -mt-10">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur p-4 sm:p-6">
          <Controls settings={settings} onChange={setSettings} />
          <SignalFeed settings={settings} />
        </div>

        <footer className="mt-8 mb-12 text-xs text-white/60">
          <p>
            Disclaimer: This app provides educational market signals generated from public Bybit data and simple quantitative rules. It is not financial advice. Crypto futures are highly risky; you can lose more than your initial margin. Always manage risk and trade responsibly.
          </p>
        </footer>
      </main>
    </div>
  );
}
