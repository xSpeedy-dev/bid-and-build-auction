import React from 'react';
import { X, Award, Flame, Layers, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { CORE_VC_ROLES, SYNERGY_RULES, ATTRIBUTE_CONFIG, INITIAL_BUDGET_CR } from '../data/companies';

export default function RulesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 rounded-2xl glass-panel border border-slate-700 bg-slate-950 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-white">
                Bid & Build 2026: Official Rules & Scoring Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Tournament mechanics, role weight formulas, and synergy multipliers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Core VC Roles & Attribute Weighting Matrix */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            1. Core VC Roles & Attribute Weighting Matrix
          </h4>
          <p className="text-xs text-slate-300">
            Each team assigns 6 acquired companies to the 6 roles. Each role calculates points out of 10 using the exact percentage formula:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {CORE_VC_ROLES.map((role) => (
              <div key={role.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-white">{role.title}</h5>
                </div>
                <p className="text-[11px] text-slate-400">{role.description}</p>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-amber-300 font-semibold">
                  {role.displayWeights}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Sector Synergy Multipliers */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            2. Industry Sector Synergy Multipliers
          </h4>
          <p className="text-xs text-slate-300">
            Synergy multipliers apply locally to the specific assigned companies forming each synergy. A single assigned company can only be consumed by one active synergy. Multipliers can be manually combined (e.g. one Trio or two Duos) if sector availability permits:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {SYNERGY_RULES.map((rule) => (
              <div key={rule.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{rule.name}</span>
                  <span className="text-[10px] text-slate-400">{rule.tagline}</span>
                </div>
                <span className="text-sm font-mono font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  {rule.multiplier.toFixed(2)}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Attributes Definition Reference */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            3. Corporate Attribute Dimensions (Out of 10)
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {Object.entries(ATTRIBUTE_CONFIG).map(([code, conf]) => (
              <div key={code} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="font-mono font-bold text-white text-sm">{conf.short}</span>
                <span className="text-slate-400 block text-[11px]">{conf.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Auction Rules */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <span className="font-bold text-white block">Key Auction Rules:</span>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Each of the 10 teams starts with a strictly enforced budget of <strong>{INITIAL_BUDGET_CR.toLocaleString()} Cr</strong>.</li>
            <li>Winning bid must be greater than or equal to the company's verified <strong>Base Price</strong>.</li>
            <li>A team must have sufficient remaining budget to place a winning bid.</li>
            <li>Each company can only fill <strong>one</strong> role in a team's final portfolio.</li>
            <li>WILDCARD assets can strategically substitute any missing sector to maximize the synergy multiplier.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Close Rules Reference
          </button>
        </div>

      </div>
    </div>
  );
}
