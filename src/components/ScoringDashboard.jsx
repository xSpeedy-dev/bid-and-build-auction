import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Award, 
  Landmark, 
  Cog, 
  Network, 
  Flame, 
  TrendingUp, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Wand2,
  RefreshCw,
  Trophy,
  Check,
  Zap,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CORE_VC_ROLES, SYNERGY_RULES, SECTOR_STYLES, ATTRIBUTE_CONFIG } from '../data/companies';
import { 
  calculateRoleScore, 
  getRoleScoreBreakdown, 
  evaluateTeamPortfolio, 
  autoOptimizeRoles 
} from '../utils/scoring';
import { playFanfare } from '../utils/audio';

const ROLE_ICONS = {
  innovation_driver: Sparkles,
  financial_backbone: Landmark,
  operational_core: Cog,
  brand_engine: Award,
  strategic_hub: Network,
  defensive_pioneer: ShieldCheck,
};

export default function ScoringDashboard({
  teams,
  masterCompanies,
  selectedTeamId,
  setSelectedTeamId,
  onAssignRole,
  onAutoAssignTeam,
}) {
  const [expandedRoleBreakdown, setExpandedRoleBreakdown] = useState(null);

  // Master company lookup map
  const companyLookup = useMemo(() => {
    return Object.fromEntries(masterCompanies.map(c => [c.id, c]));
  }, [masterCompanies]);

  // Selected team object
  const currentTeam = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId) || teams[0];
  }, [teams, selectedTeamId]);

  // Companies purchased by this team
  const purchasedCompanies = useMemo(() => {
    return currentTeam.purchases
      .map(p => companyLookup[p.companyId])
      .filter(Boolean);
  }, [currentTeam, companyLookup]);

  // Evaluation results for current team
  const evaluation = useMemo(() => {
    return evaluateTeamPortfolio(currentTeam, companyLookup);
  }, [currentTeam, companyLookup]);

  // List of company IDs currently assigned to any role in this team
  const assignedCompanyIds = useMemo(() => {
    return Object.values(currentTeam.roles).filter(Boolean);
  }, [currentTeam.roles]);

  // Handle role selection change
  const handleRoleChange = (roleId, newCompanyId) => {
    onAssignRole(currentTeam.id, roleId, newCompanyId || null);
  };

  // Auto assign recommendation
  const handleAutoOptimize = () => {
    const recommended = autoOptimizeRoles(purchasedCompanies);
    onAutoAssignTeam(currentTeam.id, recommended);
  };

  // Trigger celebration
  const handleCelebrate = () => {
    playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#a855f7'],
    });
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Banner & Team Selector Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Evaluation & Role Valuation Engine
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <Calculator className="w-7 h-7 text-emerald-400" />
              Strategic Role Scoring Dashboard
            </h2>
            <p className="text-sm text-slate-400">
              Assign 6 acquired companies to core VC roles, compute attribute-weighted scores, and evaluate sector synergies.
            </p>
          </div>

          {/* Quick Team Selector Dropdown */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              Active Team:
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 min-w-[200px]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.purchases.length} Acquired, ₹{t.remainingBudget}Cr left)
                </option>
              ))}
            </select>

            <button
              onClick={handleAutoOptimize}
              disabled={purchasedCompanies.length === 0}
              title="Automatically match best company to each role to maximize score"
              className="px-3.5 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Wand2 className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Auto-Optimize</span>
            </button>
          </div>
        </div>

        {/* 10 Team Pills Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-800/80 pt-4">
          {teams.map((team) => {
            const isSelected = team.id === selectedTeamId;
            const evalResult = evaluateTeamPortfolio(team, companyLookup);
            const isFull = evalResult.assignedCount === 6;

            return (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-500/25 text-white border border-emerald-500/50 shadow-glow-emerald/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-mono text-[10px] font-bold">
                  {team.num}
                </span>
                <span>{team.name}</span>
                {isFull ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    {evalResult.finalScore}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {evalResult.assignedCount}/6
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Team Portfolio Strip */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 text-amber-400 border border-slate-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{currentTeam.name} Acquired Assets</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({purchasedCompanies.length} companies owned)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Remaining Budget: <strong className="text-emerald-400 font-mono">₹{currentTeam.remainingBudget} Cr</strong>
            </p>
          </div>
        </div>

        {/* Company chips list */}
        <div className="flex flex-wrap items-center gap-2">
          {purchasedCompanies.length === 0 ? (
            <div className="text-xs text-slate-500 italic">
              No companies acquired yet. Go to Auction Dashboard to log bids for this team.
            </div>
          ) : (
            purchasedCompanies.map((comp) => {
              const sectorStyle = SECTOR_STYLES[comp.sector] || SECTOR_STYLES.TECH;
              const isAssigned = assignedCompanyIds.includes(comp.id);

              return (
                <span
                  key={comp.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    sectorStyle.bg
                  } ${sectorStyle.text} ${sectorStyle.border} ${
                    isAssigned ? 'ring-1 ring-emerald-400/50' : 'opacity-70'
                  }`}
                >
                  {isAssigned && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{comp.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">₹{comp.basePrice}Cr</span>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN TWO COLUMNS: 6 Role Slots (Left/Center 8 cols) + Final Score & Synergy Panel (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 6 Role Assignment Slots */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Core VC Role Assignments (6 Slots)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Assigned: <strong className="text-emerald-400">{evaluation.assignedCount} / 6</strong>
            </span>
          </div>

          {/* Warning banner if team has fewer than 6 companies */}
          {purchasedCompanies.length < 6 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>
                {currentTeam.name} has acquired {purchasedCompanies.length} companies. Exactly 6 companies are needed to fill all 6 roles.
              </span>
            </div>
          )}

          {/* 6 Role Cards */}
          <div className="grid grid-cols-1 gap-4">
            {CORE_VC_ROLES.map((role) => {
              const Icon = ROLE_ICONS[role.id] || Sparkles;
              const assignedCompId = currentTeam.roles[role.id];
              const assignedCompany = assignedCompId ? companyLookup[assignedCompId] : null;
              const roleScoreData = evaluation.roleScores[role.id];
              const score = roleScoreData ? roleScoreData.score : 0;
              const isExpanded = expandedRoleBreakdown === role.id;

              return (
                <div
                  key={role.id}
                  className={`p-5 rounded-2xl glass-panel border transition-all duration-200 ${
                    assignedCompany
                      ? 'border-emerald-500/30 bg-slate-900/70'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Role Header */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl border mt-0.5 ${
                        assignedCompany
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{role.title}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {role.displayWeights}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{role.description}</p>
                      </div>
                    </div>

                    {/* Role Score Badge */}
                    {assignedCompany && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Role Score
                          </span>
                          <span className="text-lg font-bold font-mono text-emerald-400">
                            {score.toFixed(2)} <span className="text-xs text-slate-500">/ 10</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedRoleBreakdown(isExpanded ? null : role.id)}
                          title="View formula breakdown"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    )}

                  </div>

                  {/* Company Dropdown Slot */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <select
                        value={assignedCompId || ''}
                        onChange={(e) => handleRoleChange(role.id, e.target.value)}
                        className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none transition-colors ${
                          assignedCompany
                            ? 'bg-slate-900 border border-emerald-500/40 text-emerald-200 focus:border-emerald-400'
                            : 'bg-slate-900/90 border border-slate-700 text-slate-300 focus:border-amber-400'
                        }`}
                      >
                        <option value="">-- Assign a company from portfolio --</option>
                        {purchasedCompanies.map((comp) => {
                          const isAssignedHere = assignedCompId === comp.id;
                          const assignedRoleEntry = Object.entries(currentTeam.roles).find(
                            ([rId, cId]) => cId === comp.id && rId !== role.id
                          );
                          const isAssignedElsewhere = !!assignedRoleEntry;
                          const otherRole = isAssignedElsewhere
                            ? CORE_VC_ROLES.find(r => r.id === assignedRoleEntry[0])?.title
                            : null;

                          return (
                            <option
                              key={comp.id}
                              value={comp.id}
                              disabled={isAssignedElsewhere}
                            >
                              {comp.name} ({comp.sector})
                              {isAssignedHere ? ' [Assigned Here]' : ''}
                              {isAssignedElsewhere ? ` [Assigned to ${otherRole}]` : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {assignedCompany && (
                      <div className="flex items-center gap-2">
                        {/* Sector Badge */}
                        {(() => {
                          const sectorStyle = SECTOR_STYLES[assignedCompany.sector] || SECTOR_STYLES.TECH;
                          return (
                            <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${sectorStyle.bg} ${sectorStyle.text} ${sectorStyle.border}`}>
                              {sectorStyle.badge}
                            </span>
                          );
                        })()}

                        {/* Unassign button */}
                        <button
                          type="button"
                          onClick={() => handleRoleChange(role.id, null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Mathematical Weight Breakdown */}
                  {isExpanded && assignedCompany && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                        <span className="font-semibold text-slate-300">
                          Attribute Formula Matrix for {role.title}
                        </span>
                        <span className="font-mono text-emerald-400">
                          Total: {score.toFixed(3)} pts
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        {roleScoreData.breakdown?.breakdown.map((item) => {
                          const conf = ATTRIBUTE_CONFIG[item.attrKey.toUpperCase()] || { name: item.attrKey, short: item.attrKey.toUpperCase() };
                          return (
                            <div key={item.attrKey} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                                <span>{conf.short} ({conf.name})</span>
                                <span className="font-mono text-amber-400">{item.weightPercent}</span>
                              </div>
                              <div className="mt-1 flex items-baseline justify-between font-mono">
                                <span className="text-white font-bold">{item.rawVal.toFixed(1)}</span>
                                <span className="text-emerald-400 text-[11px]">
                                  +{(item.weightedVal).toFixed(3)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Synergy Bonus + Final Score Hero (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* FINAL SCORE HERO BOX */}
          <div className="p-6 rounded-2xl glass-panel border border-emerald-500/40 shadow-glow-emerald relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                  Valuation Result
                </span>
                <h3 className="text-xl font-black text-white">{currentTeam.name}</h3>
              </div>
              
              <button
                type="button"
                onClick={handleCelebrate}
                title="Celebrate Score"
                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            {/* Score Calculation Stack */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              
              {/* Base Role Score */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Base Role Score (Sum of 6):</span>
                <span className="text-base font-bold font-mono text-white">
                  {evaluation.baseScore.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">/ 60</span>
                </span>
              </div>

              {/* Synergy Multiplier */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-400">Synergy Multiplier:</span>
                </div>
                <span className="text-base font-bold font-mono text-amber-400 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                  {evaluation.synergyMultiplier.toFixed(2)}x
                </span>
              </div>

              {/* Total Final Score Display */}
              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  Total Final Score:
                </span>
                <span className="text-3xl font-black font-mono text-emerald-300">
                  {evaluation.finalScore.toFixed(2)}
                </span>
              </div>

            </div>

            {/* Completion Status Tag */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assignment Status:</span>
              {evaluation.isComplete ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
                  <CheckCircle2 className="w-4 h-4" /> 6/6 Complete
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-mono">
                  <AlertTriangle className="w-4 h-4" /> {evaluation.assignedCount}/6 Filled
                </span>
              )}
            </div>
          </div>

          {/* SYNERGY BONUS SYSTEM */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Synergy Multiplier Matrix
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculated from the sectors of the 6 assigned companies.
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400">
                Highest Match Applied
              </span>
            </div>

            {/* Current Active Synergy Match Notice */}
            {evaluation.activeSynergy ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-transparent border border-amber-500/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {evaluation.activeSynergy.name}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-500/40">
                    {evaluation.activeSynergy.multiplier}x Multiplier
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {evaluation.activeSynergy.tagline}
                </p>
                {evaluation.synergyDetails.usedWildcard && (
                  <div className="text-[10px] text-cyan-300 font-mono pt-1">
                    ⚡ Wildcard asset substituted as missing sector to unlock this combo!
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                No synergy combination triggered yet. Baseline multiplier: <strong className="text-white">1.00x</strong>
              </div>
            )}

            {/* List of all 7 Synergy rules */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                All Synergy Multipliers:
              </span>
              {SYNERGY_RULES.map((rule) => {
                const isActive = evaluation.activeSynergy?.id === rule.id;
                return (
                  <div
                    key={rule.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/60 text-white font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-400 animate-ping' : 'bg-slate-700'}`} />
                      <span>{rule.name}</span>
                    </div>
                    <span className={`font-mono font-bold ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                      {rule.multiplier.toFixed(2)}x
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
