import { MASTER_COMPANIES, INITIAL_BUDGET_CR } from './companies.js';

export function generateSampleAuctionState() {
  const companyMap = Object.fromEntries(MASTER_COMPANIES.map(c => [c.name, c]));

  // Pre-configured realistic auction history for demoing
  const demoPurchases = [
    // Team 1: Tech x AI x Healthcare (1.35x)
    { teamNum: 1, compName: 'Google', price: 245 },
    { teamNum: 1, compName: 'DeepMind (Google)', price: 195 },
    { teamNum: 1, compName: 'UnitedHealth Group', price: 210 },
    { teamNum: 1, compName: 'OpenAI', price: 185 },
    { teamNum: 1, compName: 'Johnson & Johnson', price: 220 },
    { teamNum: 1, compName: 'Veeva Systems', price: 155 },

    // Team 2: Retail x Q-Commerce x Logistics (1.35x)
    { teamNum: 2, compName: 'Walmart', price: 215 },
    { teamNum: 2, compName: 'Blinkit', price: 165 },
    { teamNum: 2, compName: 'DHL', price: 210 },
    { teamNum: 2, compName: 'Costco', price: 195 },
    { teamNum: 2, compName: 'Zepto', price: 155 },
    { teamNum: 2, compName: 'FedEx', price: 190 },

    // Team 3: Tech x AI x Finance (1.30x)
    { teamNum: 3, compName: 'Microsoft', price: 250 },
    { teamNum: 3, compName: 'Anthropic', price: 175 },
    { teamNum: 3, compName: 'JPMorgan Chase', price: 200 },
    { teamNum: 3, compName: 'Visa', price: 230 },
    { teamNum: 3, compName: 'Meta AI', price: 180 },
    { teamNum: 3, compName: 'BlackRock', price: 210 },

    // Team 4: Retail x Logistics (1.30x)
    { teamNum: 4, compName: 'Amazon', price: 200 },
    { teamNum: 4, compName: 'UPS', price: 205 },
    { teamNum: 4, compName: 'Reliance Retail', price: 200 },
    { teamNum: 4, compName: 'CEVA Logistics', price: 160 },
    { teamNum: 4, compName: 'Inditex (Zara)', price: 190 },
    { teamNum: 4, compName: 'Blue Dart', price: 150 },

    // Team 5: Wildcard Master (NVIDIA + Tech + Healthcare)
    { teamNum: 5, compName: 'NVIDIA', price: 310 },
    { teamNum: 5, compName: 'Apple', price: 260 },
    { teamNum: 5, compName: 'Pfizer', price: 195 },
    { teamNum: 5, compName: 'AWS', price: 235 },
    { teamNum: 5, compName: 'Medtronic', price: 175 },

    // Team 6: Tech x Finance (1.25x)
    { teamNum: 6, compName: 'HDFC Bank', price: 220 },
    { teamNum: 6, compName: 'Adobe', price: 200 },
    { teamNum: 6, compName: 'Goldman Sachs', price: 195 },
    { teamNum: 6, compName: 'Oracle', price: 185 },
    { teamNum: 6, compName: 'SBI', price: 205 },

    // Team 7: Q-Commerce x Logistics (1.20x)
    { teamNum: 7, compName: 'Swiggy Instamart', price: 160 },
    { teamNum: 7, compName: 'Delhivery', price: 140 },
    { teamNum: 7, compName: 'Amazon Now', price: 145 },
    { teamNum: 7, compName: 'Amazon Logistics', price: 135 },

    // Team 8: Wildcard TSMC
    { teamNum: 8, compName: 'TSMC', price: 275 },
    { teamNum: 8, compName: 'Meta', price: 220 },
    { teamNum: 8, compName: 'Highflyer (DeepSeek)', price: 165 },

    // Team 9: Wildcard ASML
    { teamNum: 9, compName: 'ASML', price: 250 },
    { teamNum: 9, compName: 'IKEA', price: 175 },

    // Team 10: Early bids
    { teamNum: 10, compName: 'CoreWeave', price: 215 },
    { teamNum: 10, compName: 'Decathlon', price: 145 },
  ];

  const teams = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1;
    return {
      id: `team-${num}`,
      num,
      name: `Team ${num}`,
      initialBudget: INITIAL_BUDGET_CR,
      remainingBudget: INITIAL_BUDGET_CR,
      purchases: [],
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

  const soldMap = {};

  demoPurchases.forEach(item => {
    const comp = companyMap[item.compName];
    if (!comp) return;

    const team = teams.find(t => t.num === item.teamNum);
    if (!team) return;

    const price = item.price;
    team.remainingBudget -= price;
    team.purchases.push({
      companyId: comp.id,
      companyName: comp.name,
      sector: comp.sector,
      basePrice: comp.basePrice,
      soldPrice: price,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    soldMap[comp.id] = {
      teamId: team.id,
      teamName: team.name,
      soldPrice: price,
    };
  });

  // Pre-assign roles for Team 1 (Tech x AI x Healthcare) to show full scored dashboard immediately
  const team1 = teams[0];
  team1.roles = {
    innovation_driver: companyMap['DeepMind (Google)']?.id || null, // IN 10.0!
    financial_backbone: companyMap['UnitedHealth Group']?.id || null, // RM 9.0, MD 9.5
    operational_core: companyMap['Johnson & Johnson']?.id || null, // SC 9.5, RM 9.5
    brand_engine: companyMap['Google']?.id || null, // BV 9.5
    strategic_hub: companyMap['OpenAI']?.id || null, // AD 9.5, IN 9.5
    defensive_pioneer: companyMap['Veeva Systems']?.id || null, // MD 8.5
  };

  // Pre-assign roles for Team 2 (Retail x Q-Commerce x Logistics)
  const team2 = teams[1];
  team2.roles = {
    innovation_driver: companyMap['Zepto']?.id || null,
    financial_backbone: companyMap['Costco']?.id || null,
    operational_core: companyMap['DHL']?.id || null,
    brand_engine: companyMap['Walmart']?.id || null,
    strategic_hub: companyMap['Blinkit']?.id || null,
    defensive_pioneer: companyMap['FedEx']?.id || null,
  };

  // Pre-assign roles for Team 3 (Tech x AI x Finance)
  const team3 = teams[2];
  team3.roles = {
    innovation_driver: companyMap['Anthropic']?.id || null,
    financial_backbone: companyMap['JPMorgan Chase']?.id || null,
    operational_core: companyMap['Visa']?.id || null,
    brand_engine: companyMap['Microsoft']?.id || null,
    strategic_hub: companyMap['Meta AI']?.id || null,
    defensive_pioneer: companyMap['BlackRock']?.id || null,
  };

  return { teams, soldMap };
}
