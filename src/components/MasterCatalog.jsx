import React, { useState, useMemo } from 'react';
import { Database, Search, Filter, ArrowUpDown, Gavel, CheckCircle2, Building2 } from 'lucide-react';
import { SECTOR_STYLES, ATTRIBUTE_CONFIG } from '../data/companies';

export default function MasterCatalog({ masterCompanies, soldMap, onSelectForAuction }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, SOLD
  const [sortBy, setSortBy] = useState('basePrice');
  const [sortOrder, setSortOrder] = useState('desc'); // desc or asc

  const sectors = ['ALL', 'TECH', 'HEALTHCARE', 'Q-COMMERCE', 'AI', 'RETAIL', 'LOGISTICS', 'FINANCE', 'WILDCARD'];

  const filteredCompanies = useMemo(() => {
    return masterCompanies.filter((comp) => {
      const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            comp.sector.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = sectorFilter === 'ALL' || comp.sector === sectorFilter;
      const isSold = !!soldMap[comp.id];
      const matchesStatus = statusFilter === 'ALL' ||
                            (statusFilter === 'AVAILABLE' && !isSold) ||
                            (statusFilter === 'SOLD' && isSold);

      return matchesSearch && matchesSector && matchesStatus;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [masterCompanies, soldMap, searchQuery, sectorFilter, statusFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-blue-400">
              Verified Asset Database
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-400" />
            Master Company Database (75 Assets)
          </h2>
          <p className="text-sm text-slate-400">
            Inspect all listed targets, attribute matrices, valuation floors, and ownership status.
          </p>
        </div>

        {/* Quick Counts */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">Total Assets</span>
            <span className="font-mono font-bold text-white text-sm">{masterCompanies.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">Sold</span>
            <span className="font-mono font-bold text-amber-400 text-sm">{Object.keys(soldMap).length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">Remaining</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {masterCompanies.length - Object.keys(soldMap).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name or sector..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['ALL', 'AVAILABLE', 'SOLD'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Sector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                sectorFilter === sec
                  ? 'bg-slate-700 text-white font-bold border border-slate-500'
                  : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3">Sector</th>
              <th className="py-3 px-3 cursor-pointer hover:text-white" onClick={() => toggleSort('basePrice')}>
                <div className="flex items-center gap-1">
                  <span>Base Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('md')}>
                MD
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('rm')}>
                RM
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('ad')}>
                AD
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('in')}>
                IN
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('sc')}>
                SC
              </th>
              <th className="py-3 px-2 text-center cursor-pointer hover:text-white" onClick={() => toggleSort('bv')}>
                BV
              </th>
              <th className="py-3 px-3">Status / Ownership</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCompanies.map((comp) => {
              const sectorStyle = SECTOR_STYLES[comp.sector] || SECTOR_STYLES.TECH;
              const soldInfo = soldMap[comp.id];

              return (
                <tr key={comp.id} className="hover:bg-slate-900/40 transition-colors">
                  
                  {/* Name */}
                  <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                    {comp.name}
                  </td>

                  {/* Sector */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${sectorStyle.bg} ${sectorStyle.text} ${sectorStyle.border}`}>
                      {sectorStyle.badge}
                    </span>
                  </td>

                  {/* Base Price */}
                  <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                    ₹{comp.basePrice} Cr
                  </td>

                  {/* Attributes 6 columns */}
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.md.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.rm.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.ad.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.in.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.sc.toFixed(1)}
                  </td>
                  <td className="py-3 px-2 text-center font-mono font-semibold text-slate-200">
                    {comp.bv.toFixed(1)}
                  </td>

                  {/* Status / Ownership */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {soldInfo ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="font-semibold text-slate-200">{soldInfo.teamName}</span>
                        <span className="font-mono text-slate-400 text-[10px]">
                          (₹{soldInfo.soldPrice}Cr)
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Available
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    {!soldInfo ? (
                      <button
                        onClick={() => onSelectForAuction(comp)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Gavel className="w-3 h-3" />
                        <span>Bid Now</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Sold</span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
