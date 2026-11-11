import React from 'react';
import { Gavel, Calculator, Database, Trophy } from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, soldCount, completeTeamsCount }) {
  const tabs = [
    {
      id: 'auction',
      label: 'Auction Dashboard',
      subtitle: 'Bidding & Budgets',
      icon: Gavel,
      badge: `${soldCount} Sold`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'scoring',
      label: 'Scoring Dashboard',
      subtitle: 'Role Weighting & Synergy',
      icon: Calculator,
      badge: `${completeTeamsCount}/10 Full`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      subtitle: 'Standings & Multipliers',
      icon: Trophy,
      badge: 'Rankings',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'catalog',
      label: 'Master Catalog',
      subtitle: '75 Companies & Stats',
      icon: Database,
      badge: '75 Assets',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all duration-200 whitespace-nowrap group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-white shadow-glow-emerald/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs sm:text-sm font-semibold tracking-wide ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {tab.label}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block">
                    {tab.subtitle}
                  </span>
                </div>
                <span
                  className={`ml-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${tab.badgeColor}`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
