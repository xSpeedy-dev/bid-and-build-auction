import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AuctionDashboard from './components/AuctionDashboard';
import ScoringDashboard from './components/ScoringDashboard';
import Leaderboard from './components/Leaderboard';
import MasterCatalog from './components/MasterCatalog';
import RulesModal from './components/RulesModal';
import { 
  MASTER_COMPANIES, 
  INITIAL_TEAMS, 
  INITIAL_BUDGET_CR, 
  CORE_VC_ROLES 
} from './data/companies';
import { generateSampleAuctionState } from './data/sampleData';
import { evaluateTeamPortfolio } from './utils/scoring';
import { isSoundEnabled } from './utils/audio';

const STORAGE_KEY = 'bid_build_2026_state_v1';

export default function App() {
  // Navigation active tab: 'auction', 'scoring', 'leaderboard', 'catalog'
  const [activeTab, setActiveTab] = useState('auction');

  // Currently selected team in Scoring Dashboard
  const [selectedTeamId, setSelectedTeamId] = useState('team-1');

  // Rules modal state
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sound effects state
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // App Global State: teams and soldMap
  const [teams, setTeams] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.teams)) {
          return parsed.teams;
        }
      }
    } catch (e) {
      console.warn('Could not read saved state', e);
    }
    // Default to clean empty teams
    return INITIAL_TEAMS;
  });

  const [soldMap, setSoldMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.soldMap) {
          return parsed.soldMap;
        }
      }
    } catch (e) {
      console.warn('Could not read saved state', e);
    }
    return {};
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ teams, soldMap }));
    } catch (e) {
      console.warn('Could not persist state', e);
    }
  }, [teams, soldMap]);

  // Master company lookup
  const companyLookup = useMemo(() => {
    return Object.fromEntries(MASTER_COMPANIES.map(c => [c.id, c]));
  }, []);

  // Summary Metrics
  const totalSpentCr = useMemo(() => {
    return teams.reduce((acc, t) => acc + (INITIAL_BUDGET_CR - t.remainingBudget), 0);
  }, [teams]);

  const totalSoldCompanies = useMemo(() => {
    return Object.keys(soldMap).length;
  }, [soldMap]);

  const completeTeamsCount = useMemo(() => {
    return teams.filter(t => {
      const evalRes = evaluateTeamPortfolio(t, companyLookup);
      return evalRes.isComplete;
    }).length;
  }, [teams, companyLookup]);

  // ACTION: Log a Winning Purchase
  const handleLogPurchase = ({ companyId, companyName, teamId, soldPrice, basePrice, sector }) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id !== teamId) return team;

        const newRemaining = team.remainingBudget - soldPrice;
        const newPurchase = {
          companyId,
          companyName,
          sector,
          basePrice,
          soldPrice,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        return {
          ...team,
          remainingBudget: newRemaining,
          purchases: [newPurchase, ...team.purchases],
        };
      });
    });

    const winningTeam = teams.find(t => t.id === teamId);
    setSoldMap(prev => ({
      ...prev,
      [companyId]: {
        teamId,
        teamName: winningTeam ? winningTeam.name : teamId,
        soldPrice,
      },
    }));
  };

  // ACTION: Undo a Purchase
  const handleUndoPurchase = (teamId, companyId, soldPrice) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id !== teamId) return team;

        // Clean up role assignment if company was assigned
        const updatedRoles = { ...team.roles };
        for (const [rId, cId] of Object.entries(updatedRoles)) {
          if (cId === companyId) {
            updatedRoles[rId] = null;
          }
        }

        return {
          ...team,
          remainingBudget: team.remainingBudget + soldPrice,
          purchases: team.purchases.filter(p => p.companyId !== companyId),
          roles: updatedRoles,
        };
      });
    });

    setSoldMap(prev => {
      const next = { ...prev };
      delete next[companyId];
      return next;
    });
  };

  // ACTION: Assign Role to a Company
  const handleAssignRole = (teamId, roleId, companyId) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id !== teamId) return team;

        const updatedRoles = { ...team.roles };

        // Ensure "A company can only fill one role":
        // If companyId is selected and already in another role, unassign it from that other role
        if (companyId) {
          for (const [rId, cId] of Object.entries(updatedRoles)) {
            if (cId === companyId && rId !== roleId) {
              updatedRoles[rId] = null;
            }
          }
        }

        updatedRoles[roleId] = companyId;

        return {
          ...team,
          roles: updatedRoles,
        };
      });
    });
  };

  // ACTION: Auto-Optimize All Roles for a Team
  const handleAutoAssignTeam = (teamId, mapping) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          roles: {
            ...team.roles,
            ...mapping,
          },
        };
      });
    });
  };

  // ACTION: Reset Auction State
  const handleResetAuction = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the auction? All bids, budgets, and role assignments will be restored to default.'
    );
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEY);
    setTeams(INITIAL_TEAMS);
    setSoldMap({});
    setSelectedTeamId('team-1');
  };

  // ACTION: Load Pre-configured Sample Auction
  const handleLoadSample = () => {
    const sample = generateSampleAuctionState();
    setTeams(sample.teams);
    setSoldMap(sample.soldMap);
    setSelectedTeamId('team-1');
  };

  // NAVIGATION SHORTCUTS
  const handleSelectTeamForScoring = (teamId) => {
    setSelectedTeamId(teamId);
    setActiveTab('scoring');
  };

  const handleSelectTeamForAuction = (teamId) => {
    setActiveTab('auction');
  };

  const handleSelectCompanyForAuction = (company) => {
    setActiveTab('auction');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetAuction={handleResetAuction}
        onLoadSample={handleLoadSample}
        onOpenRules={() => setIsRulesOpen(true)}
        soundOn={soundOn}
        setSoundOn={setSoundOn}
        totalSpentCr={totalSpentCr}
        totalSoldCompanies={totalSoldCompanies}
        totalCompaniesCount={MASTER_COMPANIES.length}
      />

      {/* Navigation Sub-header / Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        soldCount={totalSoldCompanies}
        completeTeamsCount={completeTeamsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {activeTab === 'auction' && (
          <AuctionDashboard
            masterCompanies={MASTER_COMPANIES}
            soldMap={soldMap}
            teams={teams}
            onLogPurchase={handleLogPurchase}
            onUndoPurchase={handleUndoPurchase}
            onSelectCompanyForScoring={handleSelectTeamForScoring}
          />
        )}

        {activeTab === 'scoring' && (
          <ScoringDashboard
            teams={teams}
            masterCompanies={MASTER_COMPANIES}
            selectedTeamId={selectedTeamId}
            setSelectedTeamId={setSelectedTeamId}
            onAssignRole={handleAssignRole}
            onAutoAssignTeam={handleAutoAssignTeam}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard
            teams={teams}
            masterCompanies={MASTER_COMPANIES}
            onSelectTeamForScoring={handleSelectTeamForScoring}
            onSelectTeamForAuction={handleSelectTeamForAuction}
          />
        )}

        {activeTab === 'catalog' && (
          <MasterCatalog
            masterCompanies={MASTER_COMPANIES}
            soldMap={soldMap}
            onSelectForAuction={handleSelectCompanyForAuction}
          />
        )}
      </main>

      {/* Rules & Matrix Information Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Bid & Build 2026</span>
            <span>•</span>
            <span>Venture Capital Portfolio Valuation Engine</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            10 Teams • 6 Core VC Roles • 75 Master Assets • 1,200 Cr Budget Cap
          </div>
        </div>
      </footer>

    </div>
  );
}
