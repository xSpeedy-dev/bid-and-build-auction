import React, { useState, useMemo } from 'react';
import { 
  Gavel, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Sparkles, 
  X, 
  Trash2,
  Building2,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';
import { SECTOR_STYLES, ATTRIBUTE_CONFIG, INITIAL_BUDGET_CR } from '../data/companies';
import { playGavelSound, playPurchaseSuccess } from '../utils/audio';

export default function AuctionDashboard({
  masterCompanies,
  soldMap,
  teams,
  onLogPurchase,
  onUndoPurchase,
  onSelectCompanyForScoring,
}) {
  // Bidding form states
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('team-1');
  const [bidPrice, setBidPrice] = useState('');
  const [formError, setFormError] = useState('');
  const [filterSector, setFilterSector] = useState('ALL');

  // Filter available companies
  const availableCompanies = useMemo(() => {
    return masterCompanies.filter(comp => !soldMap[comp.id]);
  }, [masterCompanies, soldMap]);

  // Filtered dropdown list based on search and sector
  const searchResults = useMemo(() => {
    return availableCompanies.filter(comp => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            comp.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = filterSector === 'ALL' || comp.sector === filterSector;
      return matchesSearch && matchesSector;
    });
  }, [availableCompanies, searchQuery, filterSector]);

  // Selected company object
  const selectedCompany = useMemo(() => {
    return masterCompanies.find(c => c.id === selectedCompanyId) || null;
  }, [masterCompanies, selectedCompanyId]);

  // Selected team object
  const selectedTeam = useMemo(() => {
    return teams.find(t => t.id === selectedTeamId) || teams[0];
  }, [teams, selectedTeamId]);

  // When a company is selected, set default bid price to its base price
  const handleSelectCompany = (comp) => {
    setSelectedCompanyId(comp.id);
    setBidPrice(comp.basePrice.toString());
    setFormError('');
  };

  // Quick increment buttons
  const adjustBid = (delta) => {
    const current = parseFloat(bidPrice) || (selectedCompany ? selectedCompany.basePrice : 0);
    const updated = Math.max(selectedCompany ? selectedCompany.basePrice : 0, current + delta);
    setBidPrice(updated.toString());
  };

  // Submit bidding transaction
  const handleSubmitBid = (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedCompany) {
      setFormError('Please select a company from the master list.');
      return;
    }

    if (soldMap[selectedCompany.id]) {
      setFormError('This company has already been sold.');
      return;
    }

    const price = parseFloat(bidPrice);
    if (isNaN(price) || price <= 0) {
      setFormError('Please enter a valid numeric sold price.');
      return;
    }

    if (price < selectedCompany.basePrice) {
      setFormError(`Sold price must be at least the Base Price of ₹${selectedCompany.basePrice} Cr.`);
      return;
    }

    if (!selectedTeam) {
      setFormError('Please select a winning team.');
      return;
    }

    if (price > selectedTeam.remainingBudget) {
      setFormError(
        `Insufficient budget! ${selectedTeam.name} has only ₹${selectedTeam.remainingBudget} Cr remaining (Needs ₹${price} Cr).`
      );
      return;
    }

    // Play auction sounds
    playGavelSound();
    setTimeout(() => {
      playPurchaseSuccess();
    }, 200);

    // Commit purchase
    onLogPurchase({
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      teamId: selectedTeam.id,
      soldPrice: price,
      basePrice: selectedCompany.basePrice,
      sector: selectedCompany.sector,
    });

    // Reset selection for next company
    setSelectedCompanyId('');
    setBidPrice('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Live Auction Session Active
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Auction Floor & Budget Allocator
          </h2>
          <p className="text-sm text-slate-400">
            Select listed assets, log final winning bids, and track team capital reserves in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Available Assets</div>
              <div className="text-base font-bold font-mono text-amber-300">
                {availableCompanies.length} <span className="text-xs text-slate-500">/ {masterCompanies.length}</span>
              </div>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Teams in Play</div>
              <div className="text-base font-bold font-mono text-emerald-300">
                10 Teams <span className="text-xs text-slate-500">({INITIAL_BUDGET_CR.toLocaleString()} Cr ea)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Bidding Console (Left) + Selected Preview & Live Tracker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Master List Search & Bidding Interface (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Winning Bid</h3>
                  <p className="text-xs text-slate-400">Enter final sale price & assign team</p>
                </div>
              </div>

              {selectedCompany && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompanyId('');
                    setBidPrice('');
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitBid} className="space-y-4">
              
              {/* Step 1: Master List Assignment (Searchable Dropdown) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>1. Pick Listed Company</span>
                  <span className="text-[11px] font-mono text-amber-400 lowercase">
                    {availableCompanies.length} available
                  </span>
                </label>

                {/* Company Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by company or sector (e.g. Google, AI, Blinkit)..."
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Dropdown Options List */}
                <div className="mt-2 max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/90 divide-y divide-slate-800/60">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No available companies match "{searchQuery}"
                    </div>
                  ) : (
                    searchResults.slice(0, 30).map((comp) => {
                      const isSelected = selectedCompanyId === comp.id;
                      const sectorStyle = SECTOR_STYLES[comp.sector] || SECTOR_STYLES.TECH;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => handleSelectCompany(comp)}
                          className={`w-full p-2.5 px-3 flex items-center justify-between text-left transition-colors ${
                            isSelected
                              ? 'bg-amber-500/20 text-white border-l-4 border-amber-400'
                              : 'hover:bg-slate-900/80 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-xs sm:text-sm">{comp.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sectorStyle.bg} ${sectorStyle.text} ${sectorStyle.border}`}>
                              {sectorStyle.badge}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-400">
                              ₹{comp.basePrice} Cr
                            </span>
                            <span className="text-[10px] text-slate-400 block">Base Price</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 2: Bidding Interface */}
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                
                {/* Sold Price Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      2. Final Sold Price (Cr)
                    </label>
                    {selectedCompany && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Base: <strong className="text-white">₹{selectedCompany.basePrice} Cr</strong>
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-amber-400 font-mono font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="1"
                      min={selectedCompany ? selectedCompany.basePrice : 0}
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value)}
                      placeholder={selectedCompany ? `Min ${selectedCompany.basePrice} Cr` : 'Select company first'}
                      disabled={!selectedCompany}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-14 py-2.5 text-base font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-mono">
                      Cr
                    </span>
                  </div>

                  {/* Quick Bid Increment Buttons */}
                  {selectedCompany && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setBidPrice(selectedCompany.basePrice.toString())}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700"
                      >
                        Base Price
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBid(5)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700"
                      >
                        +5 Cr
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBid(10)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700"
                      >
                        +10 Cr
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBid(25)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700"
                      >
                        +25 Cr
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBid(50)}
                        className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-400 border border-slate-700"
                      >
                        +50 Cr
                      </button>
                    </div>
                  )}
                </div>

                {/* Winning Team Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    3. Winning Team
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  >
                    {teams.map((team) => {
                      const canAfford = !bidPrice || team.remainingBudget >= parseFloat(bidPrice);
                      return (
                        <option key={team.id} value={team.id}>
                          {team.name} — ₹{team.remainingBudget} Cr Left ({team.purchases.length} bought)
                          {!canAfford ? ' [INSUFFICIENT BUDGET]' : ''}
                        </option>
                      );
                    })}
                  </select>

                  {/* Team Budget Snapshot */}
                  {selectedTeam && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400">{selectedTeam.name} Balance:</span>
                      <span className={`font-mono font-bold ${
                        selectedTeam.remainingBudget < 300 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        ₹{selectedTeam.remainingBudget} Cr remaining
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Form Validation Error Alert */}
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Action Button: Log Purchase */}
              <button
                type="submit"
                disabled={!selectedCompany || !bidPrice}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm tracking-wide shadow-glow-gold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <Gavel className="w-5 h-5 transform -rotate-12" />
                <span>LOG PURCHASE</span>
              </button>

            </form>
          </div>

          {/* Quick Selected Asset Attribute Blueprint */}
          {selectedCompany && (
            <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400 font-bold">Selected Asset Specs</span>
                  <h4 className="text-lg font-bold text-white">{selectedCompany.name}</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 font-mono">
                  Base ₹{selectedCompany.basePrice} Cr
                </span>
              </div>

              {/* 6 Attributes Grid */}
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(ATTRIBUTE_CONFIG).map(([code, conf]) => {
                  const val = selectedCompany[conf.key];
                  return (
                    <div key={code} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[10px] text-slate-400 font-medium">{conf.short}</div>
                      <div className="text-sm font-bold font-mono text-white">{val.toFixed(1)}</div>
                      <div className="text-[9px] text-slate-400 truncate">{conf.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Live Tracker Grid (All 10 Teams) (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Live Team Tracker Grid
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time budget reserves and portfolio holdings across all 10 teams
                </p>
              </div>

              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                Starting Budget: {INITIAL_BUDGET_CR.toLocaleString()} Cr ea
              </span>
            </div>

            {/* Team Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Team</th>
                    <th className="py-3 px-3">Capital Budget</th>
                    <th className="py-3 px-3">Spent</th>
                    <th className="py-3 px-3">Acquired Portfolio ({teams.reduce((acc, t) => acc + t.purchases.length, 0)} Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {teams.map((team) => {
                    const spent = INITIAL_BUDGET_CR - team.remainingBudget;
                    const percentRemaining = Math.max(0, Math.round((team.remainingBudget / INITIAL_BUDGET_CR) * 100));

                    // Color indicator for remaining budget
                    let barColor = 'bg-emerald-500';
                    let textColor = 'text-emerald-400';
                    if (percentRemaining < 25) {
                      barColor = 'bg-rose-500';
                      textColor = 'text-rose-400';
                    } else if (percentRemaining < 50) {
                      barColor = 'bg-amber-500';
                      textColor = 'text-amber-400';
                    }

                    return (
                      <tr key={team.id} className="hover:bg-slate-900/40 transition-colors">
                        
                        {/* Team Name */}
                        <td className="py-3.5 px-3 font-semibold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-mono text-[11px] font-bold">
                              {team.num}
                            </span>
                            <span>{team.name}</span>
                          </div>
                        </td>

                        {/* Budget Bar & Remaining */}
                        <td className="py-3.5 px-3 min-w-[150px]">
                          <div className="flex items-center justify-between font-mono mb-1">
                            <span className={`font-bold ${textColor}`}>₹{team.remainingBudget} Cr</span>
                            <span className="text-[10px] text-slate-400">{percentRemaining}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${percentRemaining}%` }}
                            />
                          </div>
                        </td>

                        {/* Spent */}
                        <td className="py-3.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                          ₹{spent} Cr
                        </td>

                        {/* Tag list of companies bought */}
                        <td className="py-3.5 px-3">
                          {team.purchases.length === 0 ? (
                            <span className="text-slate-500 italic text-[11px]">No acquisitions yet</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {team.purchases.map((item, idx) => {
                                const sectorStyle = SECTOR_STYLES[item.sector] || SECTOR_STYLES.TECH;
                                return (
                                  <span
                                    key={`${item.companyId}-${idx}`}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${sectorStyle.bg} ${sectorStyle.text} ${sectorStyle.border} group`}
                                  >
                                    <span>{item.companyName}</span>
                                    <span className="font-mono text-[10px] opacity-80">₹{item.soldPrice}Cr</span>
                                    
                                    {/* Undo / Delete Purchase Button */}
                                    <button
                                      type="button"
                                      onClick={() => onUndoPurchase(team.id, item.companyId, item.soldPrice)}
                                      title="Undo this purchase"
                                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 ml-0.5 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Quick Link to Scoring Dashboard */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-900 to-indigo-500/10 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Ready to compute VC portfolio valuation?</h4>
                <p className="text-[11px] text-slate-400">Assign your acquired assets to the 6 core roles and unlock synergy multipliers.</p>
              </div>
            </div>
            <button
              onClick={() => onSelectCompanyForScoring(selectedTeamId)}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Go to Scoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
