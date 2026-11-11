import React from 'react';
import { Gavel, Sparkles, Volume2, VolumeX, RotateCcw, Database, Info, Trophy } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../utils/audio';

export default function Header({
  activeTab,
  setActiveTab,
  onResetAuction,
  onLoadSample,
  onOpenRules,
  soundOn,
  setSoundOn,
  totalSpentCr,
  totalSoldCompanies,
  totalCompaniesCount,
}) {
  const handleToggleSound = () => {
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#080d1a]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Event Title */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-emerald-500/20 to-blue-500/20 border border-amber-500/30 shadow-glow-gold">
              <Gavel className="w-6 h-6 text-amber-400 transform -rotate-12" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-black text-black">
                26
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
                  BID <span className="text-amber-400">&</span> BUILD
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    2026
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Venture Capital Auction & Strategic Role Valuation System
              </p>
            </div>
          </div>

          {/* Quick Stats Ticker */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Total Capital Deployed</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                ₹{totalSpentCr.toLocaleString()} Cr <span className="text-xs text-slate-500 font-normal">/ 12,000 Cr</span>
              </span>
            </div>
            <div className="w-px h-7 bg-slate-800" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Companies Acquired</span>
              <span className="text-sm font-bold font-mono text-amber-400">
                {totalSoldCompanies} <span className="text-xs text-slate-500 font-normal">/ {totalCompaniesCount} Listed</span>
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRules}
              title="View Matrix & Rules"
              className="p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Rules Matrix</span>
            </button>

            <button
              onClick={onLoadSample}
              title="Load Pre-configured Demo Auction"
              className="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 border border-indigo-500/30 transition-all flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Load Demo Data</span>
            </button>

            <button
              onClick={onResetAuction}
              title="Reset Auction State"
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleSound}
              title={soundOn ? 'Sound On' : 'Sound Muted'}
              className={`p-2.5 rounded-xl border transition-all ${
                soundOn
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
