import React, { useMemo } from 'react';
import { Trophy, Medal, Flame, Calculator, ArrowRight, DollarSign, Layers } from 'lucide-react';
import { evaluateTeamPortfolio } from '../utils/scoring';
import { SECTOR_STYLES, INITIAL_BUDGET_CR } from '../data/companies';

export default function Leaderboard({ teams, masterCompanies, onSelectTeamForScoring, onSelectTeamForAuction }) {
  const companyLookup = useMemo(() => {
    return Object.fromEntries(masterCompanies.map(c => [c.id, c]));
  }, [masterCompanies]);

  // Compute standings sorted by finalScore descending
  const standings = useMemo(() => {
    return teams.map((team) => {
      const evaluation = evaluateTeamPortfolio(team, companyLookup);
      const spent = INITIAL_BUDGET_CR - team.remainingBudget;
      return {
        team,
        evaluation,
        spent,
      };
    }).sort((a, b) => {
      // Sort by final score descending
      if (b.evaluation.finalScore !== a.evaluation.finalScore) {
        return b.evaluation.finalScore - a.evaluation.finalScore;
      }
      // If tie, sort by base score
      if (b.evaluation.baseScore !== a.evaluation.baseScore) {
        return b.evaluation.baseScore - a.evaluation.baseScore;
      }
      // If tie, sort by remaining budget
      return b.team.remainingBudget - a.team.remainingBudget;
    });
  }, [teams, companyLookup]);

  return (
    <div className="space-y-8 pb-20">
      
      {/* Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
              Live Tournament Standings
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            Venture Capital Leaderboard
          </h2>
          <p className="text-sm text-slate-400">
            Current rankings based on final weighted role scores, sector synergy multipliers, and capital discipline.
          </p>
        </div>

        {/* Podium Summary */}
        <div className="flex items-center gap-2">
          {standings.slice(0, 3).map((item, idx) => {
            const colors = [
              'border-amber-400/50 bg-amber-500/10 text-amber-300',
              'border-slate-400/50 bg-slate-500/10 text-slate-300',
              'border-amber-700/50 bg-amber-900/10 text-amber-500',
            ];
            const badges = ['1st', '2nd', '3rd'];

            return (
              <div
                key={item.team.id}
                className={`p-3 rounded-xl border ${colors[idx]} flex flex-col items-center min-w-[100px]`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{badges[idx]}</span>
                <span className="text-xs font-bold text-white truncate max-w-[90px]">{item.team.name}</span>
                <span className="text-sm font-mono font-black">{item.evaluation.finalScore.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Standings Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">Final Score</th>
                <th className="py-3 px-3">Base Score</th>
                <th className="py-3 px-3">Active Synergies</th>
                <th className="py-3 px-3">Assigned</th>
                <th className="py-3 px-3">Budget Remaining</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.map((item, rankIdx) => {
                const rank = rankIdx + 1;
                const { team, evaluation } = item;

                let rankBadge = (
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold text-xs">
                    {rank}
                  </span>
                );

                if (rank === 1) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center font-mono font-bold text-xs shadow-glow-gold">
                      🥇
                    </span>
                  );
                } else if (rank === 2) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg bg-slate-400/20 border border-slate-400/50 text-slate-200 flex items-center justify-center font-mono font-bold text-xs">
                      🥈
                    </span>
                  );
                } else if (rank === 3) {
                  rankBadge = (
                    <span className="w-6 h-6 rounded-lg bg-amber-800/20 border border-amber-700/50 text-amber-500 flex items-center justify-center font-mono font-bold text-xs">
                      🥉
                    </span>
                  );
                }

                return (
                  <tr key={team.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    {/* Rank */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {rankBadge}
                    </td>

                    {/* Team Info & Portfolio summary */}
                    <td className="py-4 px-3 font-semibold text-white whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold">{team.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {team.purchases.length} companies acquired (₹{item.spent}Cr spent)
                        </span>
                      </div>
                    </td>

                    {/* Final Score */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="text-base font-black font-mono text-emerald-400">
                        {evaluation.finalScore.toFixed(2)}
                      </span>
                    </td>

                    {/* Base Score */}
                    <td className="py-4 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {evaluation.baseScore.toFixed(2)}{' '}
                      <span className="text-[10px] text-slate-500">/ 60</span>
                    </td>

                    {/* Active Synergies */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {evaluation.synergyGroups && evaluation.synergyGroups.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {evaluation.synergyGroups.map(g => (
                            <span
                              key={g.synergy.id}
                              title={`${g.synergy.name} (${g.multiplier}x) - Boost: +${(g.synergyScore - g.baseScoreSum).toFixed(2)} pts`}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            >
                              <Flame className="w-3 h-3 text-amber-400" />
                              {g.multiplier.toFixed(2)}x
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs bg-slate-800 text-slate-400">
                          1.00x
                        </span>
                      )}
                    </td>

                    {/* Assigned Roles */}
                    <td className="py-4 px-3 whitespace-nowrap font-mono text-xs">
                      <span className={evaluation.isComplete ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                        {evaluation.assignedCount} / 6
                      </span>
                    </td>

                    {/* Budget Remaining */}
                    <td className="py-4 px-3 whitespace-nowrap font-mono">
                      <span className="font-bold text-slate-200">₹{team.remainingBudget} Cr</span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectTeamForScoring(team.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Evaluate Roles
                        </button>
                        <button
                          onClick={() => onSelectTeamForAuction(team.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        >
                          Bid
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
