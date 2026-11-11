// Raw CSV data provided in specification
export const RAW_CSV_DATA = `Company,Sector,MD,RM,AD,IN,SC,BV,Base_Price
Google,TECH,9.5,9.0,9.0,9.5,9.5,9.5,220
Microsoft,TECH,9.5,9.5,9.0,9.5,9.5,9.5,220
Apple,TECH,9.5,9.5,8.5,9.0,9.5,10.0,230
Meta,TECH,9.0,8.0,9.0,9.0,9.5,9.0,200
AWS,TECH,9.0,9.0,9.0,9.5,9.5,9.0,210
Adobe,TECH,9.0,9.0,8.5,9.0,9.0,9.0,185
Oracle,TECH,8.5,8.5,8.0,8.5,8.5,8.5,170
Cisco,TECH,8.5,8.5,7.5,8.0,8.0,8.5,150
Infosys,TECH,7.5,8.0,7.5,7.0,8.0,7.5,140
Zoho,TECH,8.0,8.5,8.5,8.0,8.0,7.0,110
Johnson & Johnson,HEALTHCARE,9.5,9.5,8.5,9.5,9.5,9.0,200
UnitedHealth Group,HEALTHCARE,9.5,9.0,8.5,8.5,9.0,8.5,195
Pfizer,HEALTHCARE,9.0,9.0,8.5,9.0,9.0,9.5,180
Medtronic,HEALTHCARE,9.0,8.5,8.0,9.0,8.5,8.5,165
Apollo Hospitals,HEALTHCARE,8.5,8.0,8.0,8.0,8.0,8.5,155
Veeva Systems,HEALTHCARE,8.5,8.5,8.5,8.5,8.5,8.0,150
Dr. Reddy's,HEALTHCARE,8.0,8.0,8.0,7.5,7.5,7.5,150
Tata 1mg,HEALTHCARE,7.5,7.5,8.0,7.0,7.5,7.5,135
Teladoc Health,HEALTHCARE,6.5,6.5,8.0,8.0,8.0,7.0,110
Practo,HEALTHCARE,6.0,6.5,7.5,7.0,7.5,6.5,85
Blinkit,Q-COMMERCE,8.0,7.5,9.0,8.5,8.5,8.5,150
Swiggy Instamart,Q-COMMERCE,8.0,7.5,9.0,8.5,8.5,8.5,145
Zepto,Q-COMMERCE,7.5,7.0,9.5,9.0,8.5,8.0,140
Amazon Now,Q-COMMERCE,8.5,8.5,8.0,8.0,8.5,8.5,135
Flipkart Minutes,Q-COMMERCE,8.0,8.0,8.0,8.0,8.0,8.0,130
BB Now,Q-COMMERCE,7.5,7.5,7.5,7.5,8.0,7.5,115
RappiCargo,Q-COMMERCE,7.0,6.5,8.5,8.0,8.0,7.0,100
Flink,Q-COMMERCE,6.5,6.5,8.0,7.5,7.5,7.0,95
Ola Dash,Q-COMMERCE,6.0,5.5,7.0,7.0,7.0,6.5,85
Zapp,Q-COMMERCE,6.0,6.0,7.5,7.5,7.0,6.5,80
OpenAI,AI,8.5,7.5,9.5,9.5,8.5,9.5,170
DeepMind (Google),AI,9.5,9.0,9.0,10.0,9.5,9.5,180
Meta AI,AI,9.0,8.5,9.0,9.5,9.5,9.0,165
Anthropic,AI,8.0,8.5,9.0,9.5,8.5,8.5,155
Highflyer (DeepSeek),AI,8.5,7.0,9.5,9.5,9.0,8.5,150
xAI,AI,7.5,7.0,9.0,9.0,8.5,8.5,140
Perplexity,AI,7.0,7.0,9.5,9.0,8.5,8.0,130
Mistral AI,AI,7.0,7.5,9.0,9.0,8.0,8.0,125
Midjourney,AI,7.5,7.0,8.5,9.0,8.0,8.0,120
Grok,AI,7.0,6.5,8.5,8.5,8.5,8.0,115
Walmart,RETAIL,9.5,9.5,8.5,9.5,9.5,8.5,190
Amazon,RETAIL,9.5,9.0,9.0,9.5,8.5,9.5,175
Costco,RETAIL,9.5,9.5,7.5,8.0,9.0,9.0,185
Reliance Retail,RETAIL,9.0,8.5,8.5,9.0,9.0,9.0,185
Inditex (Zara),RETAIL,9.0,9.0,9.5,8.5,9.0,9.0,175
IKEA,RETAIL,9.0,8.5,8.0,7.5,8.0,8.0,160
Alibaba,RETAIL,8.5,7.5,8.5,9.0,9.0,8.5,160
Target,RETAIL,8.0,8.0,7.5,7.5,8.0,8.0,145
Decathlon,RETAIL,8.0,8.0,8.0,7.0,8.0,8.5,135
Flipkart,RETAIL,8.0,7.5,8.5,8.5,8.5,7.5,120
DHL,LOGISTICS,9.5,9.0,8.5,9.5,9.0,9.0,190
FedEx,LOGISTICS,9.5,8.5,8.0,9.5,9.0,9.5,175
UPS,LOGISTICS,9.5,9.0,8.0,9.0,9.5,9.5,185
CEVA Logistics,LOGISTICS,8.5,8.5,8.0,8.0,8.5,8.0,145
NIPPON Express,LOGISTICS,8.5,9.0,7.5,7.5,8.0,8.0,140
Blue Dart,LOGISTICS,8.5,8.0,8.0,8.0,7.0,8.0,140
Delhivery,LOGISTICS,8.0,7.0,8.5,8.5,7.5,7.0,125
Amazon Logistics,LOGISTICS,9.0,8.5,8.5,8.0,8.0,8.0,125
Flexport,LOGISTICS,7.0,6.5,9.0,8.5,8.0,7.5,115
DTDC,LOGISTICS,7.0,6.5,7.5,6.0,6.5,7.0,100
JPMorgan Chase,FINANCE,9.5,9.5,8.5,9.0,9.5,9.0,185
Goldman Sachs,FINANCE,9.5,9.0,8.5,9.0,9.5,9.0,180
Visa,FINANCE,10.0,9.5,8.5,8.5,10.0,9.5,210
BlackRock,FINANCE,9.5,9.5,8.5,8.5,9.5,9.0,195
HDFC Bank,FINANCE,9.5,9.5,8.0,9.0,8.5,10.0,200
SBI,FINANCE,9.5,9.0,7.5,9.5,8.5,8.5,195
ICICI Bank,FINANCE,9.0,8.5,8.5,8.5,7.0,8.0,155
PayPal,FINANCE,8.0,8.0,8.0,8.0,8.5,8.5,150
HSBC,FINANCE,9.0,8.5,7.5,7.5,8.5,8.5,160
Paytm,FINANCE,6.5,5.5,8.5,7.5,8.5,7.5,145
NVIDIA,WILDCARD,10.0,9.0,9.5,10.0,9.5,10.0,260
TSMC,WILDCARD,10.0,8.5,8.5,9.5,9.5,9.5,240
ASML,WILDCARD,10.0,9.0,8.0,9.5,9.0,9.0,225
CoreWeave,WILDCARD,8.5,7.0,9.5,9.5,9.5,8.0,195
SK Hynix,WILDCARD,8.5,8.0,8.0,9.0,8.5,8.0,170`;

/**
 * Parses the raw CSV string directly into company records.
 */
export function parseCompanyCSV(csvString = RAW_CSV_DATA) {
  const lines = csvString.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map((line, index) => {
    // Handle potential quotes or clean commas
    const parts = line.split(',').map(p => p.trim());
    return {
      id: `comp-${index + 1}`,
      name: parts[0],
      sector: parts[1].toUpperCase(),
      md: parseFloat(parts[2]),
      rm: parseFloat(parts[3]),
      ad: parseFloat(parts[4]),
      in: parseFloat(parts[5]),
      sc: parseFloat(parts[6]),
      bv: parseFloat(parts[7]),
      basePrice: parseFloat(parts[8]),
    };
  });
}

// Master company dataset parsed
export const MASTER_COMPANIES = parseCompanyCSV();

// Attribute Labels and Descriptions
export const ATTRIBUTE_CONFIG = {
  MD: { key: 'md', name: 'Market Dominance', short: 'MD', color: '#38bdf8' },
  RM: { key: 'rm', name: 'Revenue Model', short: 'RM', color: '#34d399' },
  AD: { key: 'ad', name: 'Adaptability', short: 'AD', color: '#a78bfa' },
  IN: { key: 'in', name: 'Innovation', short: 'IN', color: '#f43f5e' },
  SC: { key: 'sc', name: 'Scalability', short: 'SC', color: '#fb923c' },
  BV: { key: 'bv', name: 'Brand Value', short: 'BV', color: '#facc15' },
};

// Core VC Roles and their Attribute Weighting Matrices
// Attribute out of 10 × Role Weight Percentage
export const CORE_VC_ROLES = [
  {
    id: 'innovation_driver',
    title: 'Innovation Driver',
    description: 'Pioneers cutting-edge technology and next-gen paradigms',
    icon: 'Sparkles',
    weights: { in: 0.40, ad: 0.20, sc: 0.15, md: 0.10, bv: 0.10, rm: 0.05 },
    displayWeights: 'IN 40%, AD 20%, SC 15%, MD 10%, BV 10%, RM 5%',
  },
  {
    id: 'financial_backbone',
    title: 'Financial Backbone',
    description: 'Anchors enterprise cash flows and resilient margins',
    icon: 'Landmark',
    weights: { rm: 0.35, md: 0.25, bv: 0.15, sc: 0.10, ad: 0.10, in: 0.05 },
    displayWeights: 'RM 35%, MD 25%, BV 15%, SC 10%, AD 10%, IN 5%',
  },
  {
    id: 'operational_core',
    title: 'Operational Core',
    description: 'Powers scalable distribution, logistics, and execution',
    icon: 'Cog',
    weights: { sc: 0.25, rm: 0.25, md: 0.20, ad: 0.20, bv: 0.05, in: 0.05 },
    displayWeights: 'SC 25%, RM 25%, MD 20%, AD 20%, BV 5%, IN 5%',
  },
  {
    id: 'brand_engine',
    title: 'Brand Engine',
    description: 'Commands customer love, social goodwill, and cultural moat',
    icon: 'Award',
    weights: { bv: 0.45, ad: 0.15, sc: 0.15, in: 0.10, md: 0.10, rm: 0.05 },
    displayWeights: 'BV 45%, AD 15%, SC 15%, IN 10%, MD 10%, RM 5%',
  },
  {
    id: 'strategic_hub',
    title: 'Strategic Hub',
    description: 'Coordinates market cross-selling and multifaceted expansion',
    icon: 'Network',
    weights: { md: 0.20, ad: 0.20, rm: 0.15, in: 0.15, sc: 0.15, bv: 0.15 },
    displayWeights: 'MD 20%, AD 20%, RM 15%, IN 15%, SC 15%, BV 15%',
  },
  {
    id: 'defensive_pioneer',
    title: 'Defensive Pioneer',
    description: 'Protects the portfolio with formidable moats and risk shields',
    icon: 'ShieldCheck',
    weights: { md: 0.40, rm: 0.30, ad: 0.10, sc: 0.10, in: 0.05, bv: 0.05 },
    displayWeights: 'MD 40%, RM 30%, AD 10%, SC 10%, IN 5%, BV 5%',
  },
];

// Synergy Rules sorted by multiplier descending
export const SYNERGY_RULES = [
  {
    id: 'retail_qcommerce_logistics',
    name: 'Retail × Q-Commerce × Logistics',
    sectors: ['RETAIL', 'Q-COMMERCE', 'LOGISTICS'],
    multiplier: 1.35,
    tagline: 'Hyperlocal Commerce Powerhouse (Omnichannel dominance + 10-min fulfillment)',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'tech_ai_healthcare',
    name: 'Tech × AI × Healthcare',
    sectors: ['TECH', 'AI', 'HEALTHCARE'],
    multiplier: 1.35,
    tagline: 'BioTech & Digital Health Revolution (Next-gen drug discovery & health clouds)',
    color: 'from-cyan-500 to-emerald-500',
  },
  {
    id: 'tech_ai_finance',
    name: 'Tech × AI × Finance',
    sectors: ['TECH', 'AI', 'FINANCE'],
    multiplier: 1.30,
    tagline: 'Autonomous FinTech Infrastructure (AI risk hedging & algorithmic banking)',
    color: 'from-purple-500 to-blue-500',
  },
  {
    id: 'retail_logistics',
    name: 'Retail × Logistics',
    sectors: ['RETAIL', 'LOGISTICS'],
    multiplier: 1.30,
    tagline: 'Global Supply Chain Moat (Direct factory-to-consumer efficiency)',
    color: 'from-amber-500 to-sky-500',
  },
  {
    id: 'tech_finance',
    name: 'Tech × Finance',
    sectors: ['TECH', 'FINANCE'],
    multiplier: 1.25,
    tagline: 'Institutional FinTech Rails (Digital transaction scalability)',
    color: 'from-blue-500 to-emerald-500',
  },
  {
    id: 'ai_healthcare',
    name: 'AI × Healthcare',
    sectors: ['AI', 'HEALTHCARE'],
    multiplier: 1.25,
    tagline: 'Clinical AI Diagnostics (Predictive oncology & precision treatments)',
    color: 'from-purple-500 to-teal-500',
  },
  {
    id: 'qcommerce_logistics',
    name: 'Q-Commerce × Logistics',
    sectors: ['Q-COMMERCE', 'LOGISTICS'],
    multiplier: 1.20,
    tagline: 'Dark Store Velocity (Instant distribution & micro-warehousing)',
    color: 'from-orange-500 to-blue-500',
  },
];

export const INITIAL_BUDGET_CR = 1200;

export const INITIAL_TEAMS = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  return {
    id: `team-${num}`,
    num,
    name: `Team ${num}`,
    initialBudget: INITIAL_BUDGET_CR,
    remainingBudget: INITIAL_BUDGET_CR,
    purchases: [], // Array of { companyId, name, sector, soldPrice, basePrice, timestamp }
    roles: {
      innovation_driver: null,
      financial_backbone: null,
      operational_core: null,
      brand_engine: null,
      strategic_hub: null,
      defensive_pioneer: null,
    },
  };
});

// Sector Colors and Badges
export const SECTOR_STYLES = {
  TECH: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', badge: 'Tech' },
  HEALTHCARE: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', badge: 'Healthcare' },
  'Q-COMMERCE': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', badge: 'Q-Commerce' },
  AI: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', badge: 'AI' },
  RETAIL: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', badge: 'Retail' },
  LOGISTICS: { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', badge: 'Logistics' },
  FINANCE: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', badge: 'Finance' },
  WILDCARD: { bg: 'bg-gradient-to-r from-amber-500/20 via-fuchsia-500/20 to-cyan-500/20', text: 'text-amber-300 font-semibold', border: 'border-amber-500/50', badge: '⚡ WILDCARD' },
};
