import { CORE_VC_ROLES, SYNERGY_RULES } from '../data/companies.js';

/**
 * Calculates the score for an individual role given a company.
 * Matrix formula: sum of (Attribute out of 10 × Role Weight Percentage)
 */
export function calculateRoleScore(company, roleId) {
  if (!company) return 0;

  const role = CORE_VC_ROLES.find(r => r.id === roleId);
  if (!role) return 0;

  let score = 0;
  for (const [attr, weight] of Object.entries(role.weights)) {
    const val = company[attr] || 0;
    score += val * weight;
  }
  return score;
}

/**
 * Detailed breakdown of a role's score computation.
 */
export function getRoleScoreBreakdown(company, roleId) {
  if (!company) return null;
  const role = CORE_VC_ROLES.find(r => r.id === roleId);
  if (!role) return null;

  const breakdown = [];
  let totalScore = 0;

  for (const [attr, weight] of Object.entries(role.weights)) {
    const rawVal = company[attr] || 0;
    const weighted = rawVal * weight;
    totalScore += weighted;
    breakdown.push({
      attrKey: attr,
      rawVal,
      weight,
      weightPercent: `${Math.round(weight * 100)}%`,
      weightedVal: weighted,
    });
  }

  return {
    roleId,
    roleTitle: role.title,
    companyName: company.name,
    totalScore: Number(totalScore.toFixed(3)),
    breakdown,
  };
}

/**
 * Evaluates the synergy bonus based on the sectors of the 6 assigned companies.
 * Supports WILDCARD companies substituting missing sectors.
 * Highest matching multiplier is chosen.
 */
export function evaluateSynergies(assignedCompanies = []) {
  const validCompanies = assignedCompanies.filter(Boolean);
  if (validCompanies.length === 0) {
    return {
      activeSynergy: null,
      multiplier: 1.0,
      matchedRules: [],
      sectorsPresent: [],
      wildcardAssignments: [],
      description: 'Assign companies to unlock industry synergy multipliers.',
    };
  }

  // Collect sectors
  const sectorList = validCompanies.map(c => c.sector);
  const wildcardCompanies = validCompanies.filter(c => c.sector === 'WILDCARD');
  const nonWildcardSectors = new Set(validCompanies.filter(c => c.sector !== 'WILDCARD').map(c => c.sector));

  // Check each rule in priority order (already sorted by multiplier descending)
  let bestMatch = null;
  const allMatches = [];

  for (const rule of SYNERGY_RULES) {
    const missingSectors = rule.sectors.filter(sec => !nonWildcardSectors.has(sec));
    const isDirectMatch = missingSectors.length === 0;
    const isWildcardMatch = !isDirectMatch && missingSectors.length <= wildcardCompanies.length;

    if (isDirectMatch || isWildcardMatch) {
      const matchDetail = {
        rule,
        multiplier: rule.multiplier,
        isDirect: isDirectMatch,
        usedWildcard: isWildcardMatch,
        missingSectors,
        wildcardUsedFor: isWildcardMatch ? missingSectors : [],
      };

      allMatches.push(matchDetail);

      if (!bestMatch || rule.multiplier > bestMatch.multiplier) {
        bestMatch = matchDetail;
      }
    }
  }

  if (bestMatch) {
    return {
      activeSynergy: bestMatch.rule,
      multiplier: bestMatch.multiplier,
      matchedRules: allMatches,
      sectorsPresent: Array.from(new Set(sectorList)),
      usedWildcard: bestMatch.usedWildcard,
      wildcardUsedFor: bestMatch.wildcardUsedFor,
      description: bestMatch.rule.tagline,
    };
  }

  return {
    activeSynergy: null,
    multiplier: 1.0,
    matchedRules: [],
    sectorsPresent: Array.from(new Set(sectorList)),
    usedWildcard: false,
    wildcardUsedFor: [],
    description: 'No matching synergy synergy combo found. Multiplier: 1.00x',
  };
}

/**
 * Computes full evaluation for a team.
 */
export function evaluateTeamPortfolio(team, companyLookupMap) {
  if (!team) return null;

  const roleScores = {};
  const assignedCompanies = [];
  let baseScore = 0;
  let assignedCount = 0;

  for (const role of CORE_VC_ROLES) {
    const companyId = team.roles[role.id];
    const company = companyId ? companyLookupMap[companyId] : null;

    if (company) {
      const score = calculateRoleScore(company, role.id);
      roleScores[role.id] = {
        score: Number(score.toFixed(3)),
        company,
        breakdown: getRoleScoreBreakdown(company, role.id),
      };
      baseScore += score;
      assignedCompanies.push(company);
      assignedCount++;
    } else {
      roleScores[role.id] = {
        score: 0,
        company: null,
        breakdown: null,
      };
    }
  }

  const synergy = evaluateSynergies(assignedCompanies);
  const finalScore = baseScore * synergy.multiplier;

  return {
    teamId: team.id,
    teamName: team.name,
    assignedCount,
    isComplete: assignedCount === 6,
    roleScores,
    baseScore: Number(baseScore.toFixed(2)),
    synergyMultiplier: synergy.multiplier,
    activeSynergy: synergy.activeSynergy,
    synergyDetails: synergy,
    finalScore: Number(finalScore.toFixed(2)),
  };
}

/**
 * Suggest optimal role assignment for a team's purchased companies.
 * Uses greedy matching with highest total score.
 */
export function autoOptimizeRoles(purchasedCompanies) {
  if (!purchasedCompanies || purchasedCompanies.length === 0) return {};
  if (purchasedCompanies.length < 6) {
    // Just assign what we have to the role that yields highest score
  }

  const availableRoles = [...CORE_VC_ROLES];
  const assigned = {};
  const remainingCompanies = [...purchasedCompanies];

  // Try all permutations if companies count is small (<= 8), otherwise greedy
  if (remainingCompanies.length <= 8) {
    let maxTotal = -1;
    let bestMapping = {};

    function permute(roleIdx, currentUsed, currentMapping, currentTotal) {
      if (roleIdx === availableRoles.length) {
        if (currentTotal > maxTotal) {
          maxTotal = currentTotal;
          bestMapping = { ...currentMapping };
        }
        return;
      }

      const role = availableRoles[roleIdx];
      for (const comp of remainingCompanies) {
        if (!currentUsed.has(comp.id)) {
          currentUsed.add(comp.id);
          const score = calculateRoleScore(comp, role.id);
          currentMapping[role.id] = comp.id;
          permute(roleIdx + 1, currentUsed, currentMapping, currentTotal + score);
          delete currentMapping[role.id];
          currentUsed.delete(comp.id);
        }
      }
    }

    permute(0, new Set(), {}, 0);
    if (Object.keys(bestMapping).length > 0) {
      return bestMapping;
    }
  }

  // Fallback greedy
  const usedCompIds = new Set();
  for (const role of availableRoles) {
    let bestComp = null;
    let bestScore = -1;

    for (const comp of remainingCompanies) {
      if (!usedCompIds.has(comp.id)) {
        const s = calculateRoleScore(comp, role.id);
        if (s > bestScore) {
          bestScore = s;
          bestComp = comp;
        }
      }
    }

    if (bestComp) {
      assigned[role.id] = bestComp.id;
      usedCompIds.add(bestComp.id);
    }
  }

  return assigned;
}
