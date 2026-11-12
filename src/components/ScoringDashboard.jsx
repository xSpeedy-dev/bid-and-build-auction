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
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Info,
  Wand2,
  Check,
  Zap,
  Building2,
  CheckSquare,
  Square,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CORE_VC_ROLES, SYNERGY_RULES, SECTOR_STYLES, ATTRIBUTE_CONFIG } from '../data/companies';
import { 
  getAssignedCompanies,
  getSectorInventory,
  detectQualifiedSynergies,
  validateSynergiesCombination,
  canAddSynergy,
  findBestSynergyCombination,
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
  onUpdateTeamSynergies,
}) {
  const [expandedRoleBreakdown, setExpandedRoleBreakdown] = useState(null);
  const [showUnqualified, setShowUnqualified] = useState(false);

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

  // Assigned companies across the 6 roles
  const assignedCompanies = useMemo(() => {
    return getAssignedCompanies(currentTeam, companyLookup);
  }, [currentTeam, companyLookup]);

  // Sector inventory of assigned companies
  const sectorInventory = useMemo(() => {
    return getSectorInventory(assignedCompanies);
  }, [assignedCompanies]);

  // Evaluation results for current team (using local grouped multipliers)
  const evaluation = useMemo(() => {
    return evaluateTeamPortfolio(currentTeam, companyLookup);
  }, [currentTeam, companyLookup]);

  // List of active synergy IDs
  const activeSynergies = useMemo(() => {
    return evaluation.selectedSynergies || [];
  }, [evaluation.selectedSynergies]);

  // Auto-detected qualified individual synergies
  const qualifiedSynergies = useMemo(() => {
    return detectQualifiedSynergies(assignedCompanies);
  }, [assignedCompanies]);

  // List of company IDs currently assigned to any role in this team
  const assignedCompanyIds = useMemo(() => {
    return Object.values(currentTeam.roles).filter(Boolean);
  }, [currentTeam.roles]);

  // Sector availability and tracking state
  const sectorTracking = useMemo(() => {
    const activeRules = activeSynergies
      .map(id => SYNERGY_RULES.find(r => r.id === id))
      .filter(Boolean);

    const requiredPerSector = {};
    for (const r of activeRules) {
      for (const s of r.sectors) {
        requiredPerSector[s] = (requiredPerSector[s] || 0) + 1;
      }
    }

    const { counts, wildcardCount } = sectorInventory;
    const tracking = [];

    // Standard sectors present in this team's assigned roles
    for (const [sec, total] of Object.entries(counts)) {
      const needed = requiredPerSector[sec] || 0;
      const consumed = Math.min(total, needed);
      const remaining = Math.max(0, total - consumed);
      tracking.push({
        sector: sec,
        total,
        consumed,
        remaining,
        isWildcard: false,
      });
    }

    // WILDCARD assets
    if (wildcardCount > 0) {
      let wildcardsConsumed = 0;
      for (const [sec, needed] of Object.entries(requiredPerSector)) {
        const direct = counts[sec] || 0;
        if (needed > direct) {
          wildcardsConsumed += (needed - direct);
        }
      }
      tracking.push({
        sector: 'WILDCARD',
        total: wildcardCount,
        consumed: wildcardsConsumed,
        remaining: Math.max(0, wildcardCount - wildcardsConsumed),
        isWildcard: true,
      });
    }

    return tracking;
  }, [activeSynergies, sectorInventory]);

  // Handle role selection change
  const handleRoleChange = (roleId, newCompanyId) => {
    onAssignRole(currentTeam.id, roleId, newCompanyId || null);
  };

  // Auto assign recommendation for roles
  const handleAutoOptimize = () => {
    const recommended = autoOptimizeRoles(purchasedCompanies);
    onAutoAssignTeam(currentTeam.id, recommended);
  };

  // Toggle synergy selection
  const handleToggleSynergy = (synergyId) => {
    if (!onUpdateTeamSynergies) return;
    if (activeSynergies.includes(synergyId)) {
      const next = activeSynergies.filter(id => id !== synergyId);
      onUpdateTeamSynergies(currentTeam.id, next);
    } else {
      const next = [...activeSynergies, synergyId];
      const check = validateSynergiesCombination(next, assignedCompanies);
      if (check.valid) {
        onUpdateTeamSynergies(currentTeam.id, next);
      }
    }
  };

  // Auto-select optimal synergy combination
  const handleAutoSelectBestCombo = () => {
    if (!onUpdateTeamSynergies) return;
    const best = findBestSynergyCombination(assignedCompanies);
    onUpdateTeamSynergies(currentTeam.id, best);
  };

  // Clear all selected synergies
  const handleClearAllSynergies = () => {
    if (!onUpdateTeamSynergies) return;
    onUpdateTeamSynergies(currentTeam.id, []);
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

  // Partition qualified and unqualified
  const qualifiedList = qualifiedSynergies.filter(q => q.qualified);
  const unqualifiedList = qualifiedSynergies.filter(q => !q.qualified);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Top Banner & Team Selector Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
                Evaluation & Valuation Engine
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <Calculator className="w-7 h-7 text-emerald-400" />
              Strategic Role Scoring Dashboard
            </h2>
            <p className="text-sm text-slate-400">
              Assign 6 acquired companies to core VC roles and configure Local Grouped Synergies without double counting.
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
              title="Automatically match best company to each role to maximize base score"
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

      {/* MAIN TWO COLUMNS: 6 Role Slots + Synergy Builder (Left 8 cols) + Final Score Hero & Matrix (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: 6 Role Assignment Slots + Synergy Builder */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Role Assignments */}
          <div className="space-y-4">
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

                // Check if this company is consumed by an active synergy
                const activeSynergyForCompany = evaluation.synergyGroups?.find(g => 
                  g.companies.some(c => c.companyId === assignedCompId)
                );

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

                      {/* Role Score & Synergy Boost Pill */}
                      {assignedCompany && (
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                              Base Score
                            </span>
                            <span className="text-lg font-bold font-mono text-emerald-400">
                              {score.toFixed(2)} <span className="text-xs text-slate-500">/ 10</span>
                            </span>
                            {activeSynergyForCompany && (
                              <span className="text-[10px] block font-mono font-bold text-amber-400">
                                Boosted at {activeSynergyForCompany.multiplier}x
                              </span>
                            )}
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

          {/* Section 2: NEW SYNERGY BUILDER (Local Grouped Multipliers) */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5">
            
            {/* Header with Title and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Synergy Builder</h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Local Grouped Multipliers
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Multipliers apply only to the base scores of companies in that synergy. Each company is consumed by at most one synergy.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoSelectBestCombo}
                  disabled={qualifiedList.length === 0}
                  title="Auto-select the highest scoring valid combination of synergies"
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Auto-Pick Best Combo</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllSynergies}
                  disabled={activeSynergies.length === 0}
                  title="Deactivate all selected synergies"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Sector Tracking & Utilization Strip */}
            <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Sector Availability (Assigned Companies):
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {evaluation.assignedCount} / 6 assigned
                </span>
              </div>

              {sectorTracking.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-1">
                  Assign companies to roles above to unlock sector inventory.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {sectorTracking.map(item => {
                    const style = SECTOR_STYLES[item.sector] || SECTOR_STYLES.TECH;
                    const isExhausted = item.remaining === 0;
                    return (
                      <div
                        key={item.sector}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                          isExhausted
                            ? 'bg-slate-950/60 border-slate-800 text-slate-500'
                            : `${style.bg} ${style.border} ${style.text}`
                        }`}
                      >
                        <span className="font-bold">{item.sector}:</span>
                        <span className="font-mono text-[11px]">
                          {item.consumed}/{item.total} in synergy
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          item.remaining > 0 ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {item.remaining} free
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Qualified Synergies List (User Toggles) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Qualified Synergies ({qualifiedList.length} Available)
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {activeSynergies.length} Activated
                </span>
              </div>

              {qualifiedList.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-medium text-slate-300">No synergy combination qualified yet.</p>
                  <p className="text-slate-500 text-[11px]">
                    Assign matching industry sectors (or Wildcard companies) in the 6 role slots to unlock synergies.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {qualifiedList.map(({ rule }) => {
                    const isActive = activeSynergies.includes(rule.id);
                    const canAddCheck = canAddSynergy(activeSynergies, rule.id, assignedCompanies);
                    const isSelectable = isActive || canAddCheck.canAdd;

                    // Group details if active
                    const activeGroup = evaluation.synergyGroups?.find(g => g.synergy.id === rule.id);

                    return (
                      <div
                        key={rule.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border-amber-500/50 shadow-glow-gold/20'
                            : isSelectable
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-850 opacity-60'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Checkbox / Toggle + Title */}
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleSynergy(rule.id)}
                              disabled={!isSelectable}
                              className={`p-1 mt-0.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'text-amber-400 hover:text-amber-300'
                                  : isSelectable
                                  ? 'text-slate-400 hover:text-white'
                                  : 'text-slate-600 cursor-not-allowed'
                              }`}
                            >
                              {isActive ? (
                                <CheckSquare className="w-5 h-5 text-amber-400" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                  {rule.name}
                                </h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                  {rule.sectors.length === 3 ? 'Trio (3 Sectors)' : 'Duo (2 Sectors)'}
                                </span>
                                {isActive && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{rule.tagline}</p>
                              
                              {/* Sector Tags */}
                              <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-[10px] text-slate-500">Requires:</span>
                                {rule.sectors.map(sec => {
                                  const secStyle = SECTOR_STYLES[sec] || SECTOR_STYLES.TECH;
                                  return (
                                    <span
                                      key={sec}
                                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${secStyle.bg} ${secStyle.text} ${secStyle.border}`}
                                    >
                                      {sec}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Multiplier Badge & Points Summary */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 sm:gap-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                            <span className="text-base font-black font-mono text-amber-400 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                              {rule.multiplier.toFixed(2)}x
                            </span>
                            {activeGroup && (
                              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                                +{(activeGroup.synergyScore - activeGroup.baseScoreSum).toFixed(2)} pts boost
                              </span>
                            )}
                          </div>

                        </div>

                        {/* If Active: Detailed Consumed Companies Breakdown */}
                        {isActive && activeGroup && (
                          <div className="mt-3 pt-3 border-t border-amber-500/20 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-slate-400 font-medium">Consuming:</span>
                                {activeGroup.companies.map(c => (
                                  <span
                                    key={c.companyId}
                                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px]"
                                  >
                                    {c.companyName} ({c.baseScore.toFixed(2)})
                                  </span>
                                ))}
                              </div>
                              <div className="font-mono text-slate-300 text-right whitespace-nowrap">
                                <span>{activeGroup.baseScoreSum.toFixed(2)}</span>
                                <span className="text-amber-400 font-bold"> × {rule.multiplier.toFixed(2)}</span>
                                <span className="text-emerald-400 font-bold"> = {activeGroup.synergyScore.toFixed(2)} pts</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* If Inactive & Unavailable: Conflict Warning */}
                        {!isActive && !isSelectable && (
                          <div className="mt-2.5 text-[11px] text-rose-400/90 font-mono flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span>Cannot activate together with current synergies: {canAddCheck.error}</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Toggle to view unqualified synergies */}
            {unqualifiedList.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowUnqualified(!showUnqualified)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
                >
                  {showUnqualified ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showUnqualified ? 'Hide' : 'Show'} {unqualifiedList.length} Unqualified Synergies (Missing Sectors)</span>
                </button>

                {showUnqualified && (
                  <div className="mt-3 space-y-2">
                    {unqualifiedList.map(({ rule, missingSectors }) => (
                      <div
                        key={rule.id}
                        className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 opacity-60"
                      >
                        <div>
                          <span className="font-bold text-slate-300">{rule.name}</span>
                          <span className="text-slate-500 font-mono ml-2 text-[11px]">({rule.multiplier.toFixed(2)}x)</span>
                          <div className="flex items-center gap-1 text-[10px] text-rose-400/80 mt-1">
                            <span>Missing:</span>
                            {missingSectors.map(s => (
                              <span key={s} className="px-1.5 py-0.2 rounded bg-rose-500/10 border border-rose-500/20 font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          Locked
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

        {/* RIGHT COLUMN: Final Score Hero Box & Synergies Overview (4 cols) */}
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

            {/* Score Calculation Stack (Local Grouped Multipliers Formula) */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              
              {/* Base Role Score total */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Base Role Score (Sum of 6):</span>
                <span className="text-base font-bold font-mono text-white">
                  {evaluation.baseScore.toFixed(2)}{' '}
                  <span className="text-xs text-slate-500 font-normal">/ 60</span>
                </span>
              </div>

              {/* Active Synergies Local Multipliers Breakdown */}
              {evaluation.synergyGroups && evaluation.synergyGroups.length > 0 ? (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono block">
                    Active Local Multipliers:
                  </span>
                  {evaluation.synergyGroups.map(g => (
                    <div key={g.synergy.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="truncate max-w-[130px]">{g.synergy.name}:</span>
                      </div>
                      <div className="font-mono text-right text-slate-300">
                        <span>{g.baseScoreSum.toFixed(2)}</span>
                        <span className="text-amber-400"> × {g.multiplier.toFixed(2)}</span>
                        <span className="text-white font-bold"> = {g.synergyScore.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Unused / Unboosted companies */}
                  {evaluation.unusedCompanies && evaluation.unusedCompanies.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Unboosted ({evaluation.unusedCompanies.length} assets):</span>
                      <span className="font-mono text-slate-300">
                        {evaluation.unusedScoreSum.toFixed(2)} × 1.0 = {evaluation.unusedScoreSum.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Multiplier Net Gain */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="text-emerald-400 font-medium">Net Multiplier Boost:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{evaluation.synergyBonus.toFixed(2)} pts
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-400">Active Multipliers:</span>
                  <span className="font-mono text-slate-500">None (1.00x)</span>
                </div>
              )}

              {/* Total Final Score Display */}
              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block">
                    Total Final Score:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Local Sum + Unboosted
                  </span>
                </div>
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

          {/* ACTIVE SYNERGY SUMMARY / RULES MATRIX OVERVIEW */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Active Synergies Summary
                </h3>
                <p className="text-[11px] text-slate-400">
                  Current team local grouped bonuses
                </p>
              </div>

              <span className="text-xs font-mono font-bold text-amber-400">
                {activeSynergies.length} Active
              </span>
            </div>

            {/* Active synergies cards */}
            {evaluation.synergyGroups && evaluation.synergyGroups.length > 0 ? (
              <div className="space-y-2">
                {evaluation.synergyGroups.map(g => (
                  <div
                    key={g.synergy.id}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        {g.synergy.name}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                        {g.multiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 flex items-center justify-between font-mono">
                      <span>{g.companies.length} assets consumed</span>
                      <span className="text-emerald-400">+{ (g.synergyScore - g.baseScoreSum).toFixed(2) } pts boost</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
                No local synergies active. Select qualified combos in the Synergy Builder below the roles.
              </div>
            )}

            {/* Quick All Synergies Multiplier Reference */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Official Multipliers Catalog:
              </span>
              <div className="space-y-1.5">
                {SYNERGY_RULES.map((rule) => {
                  const isActive = activeSynergies.includes(rule.id);
                  const isQual = qualifiedList.some(q => q.rule.id === rule.id);

                  return (
                    <div
                      key={rule.id}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-500/50 text-white font-bold'
                          : isQual
                          ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                          : 'bg-slate-950/40 border-slate-900 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          isActive
                            ? 'bg-amber-400'
                            : isQual
                            ? 'bg-emerald-400'
                            : 'bg-slate-700'
                        }`} />
                        <span className="text-[11px] truncate max-w-[170px]">{rule.name}</span>
                      </div>
                      <span className={`font-mono text-[11px] font-bold ${
                        isActive ? 'text-amber-300' : isQual ? 'text-emerald-400' : 'text-slate-500'
                      }`}>
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

    </div>
  );
}
