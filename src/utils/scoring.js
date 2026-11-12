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
 * Extracts and decorates the assigned companies for a team.
 * Each item includes roleId, roleTitle, companyId, companyName, sector, baseScore, and full company object.
 */
export function getAssignedCompanies(team, companyLookupMap) {
  if (!team || !team.roles) return [];
  const assigned = [];
  for (const role of CORE_VC_ROLES) {
    const compId = team.roles[role.id];
    const comp = compId ? companyLookupMap[compId] : null;
    if (comp) {
      const baseScore = calculateRoleScore(comp, role.id);
      assigned.push({
        roleId: role.id,
        roleTitle: role.title,
        companyId: comp.id,
        companyName: comp.name,
        sector: comp.sector,
        basePrice: comp.basePrice,
        baseScore: Number(baseScore.toFixed(3)),
        company: comp,
      });
    }
  }
  return assigned;
}

/**
 * Summarizes sector availability across assigned companies.
 * Accounts for standard industry sectors and WILDCARD assets.
 */
export function getSectorInventory(assignedCompanies = []) {
  const counts = {};
  let wildcardCount = 0;
  for (const item of assignedCompanies) {
    if (item.sector === 'WILDCARD') {
      wildcardCount++;
    } else {
      counts[item.sector] = (counts[item.sector] || 0) + 1;
    }
  }
  return {
    counts,
    wildcardCount,
    totalAssigned: assignedCompanies.length,
  };
}

/**
 * Checks whether the team's assigned companies individually qualify for a specific synergy rule.
 */
export function checkSynergyQualified(rule, assignedCompanies = []) {
  if (!rule || !rule.sectors) {
    return { qualified: false, missingSectors: [], usedWildcards: 0 };
  }
  const { counts, wildcardCount, totalAssigned } = getSectorInventory(assignedCompanies);

  if (rule.sectors.length > totalAssigned) {
    return { qualified: false, missingSectors: [...rule.sectors], usedWildcards: 0 };
  }

  let neededWildcards = 0;
  const missingSectors = [];

  for (const sector of rule.sectors) {
    const available = counts[sector] || 0;
    if (available > 0) {
      // Sector is directly present
    } else {
      neededWildcards++;
      missingSectors.push(sector);
    }
  }

  const qualified = neededWildcards <= wildcardCount;
  return {
    qualified,
    missingSectors: qualified ? [] : missingSectors,
    usedWildcards: neededWildcards,
  };
}

/**
 * Auto-detects all synergies that the team's assigned companies qualify for individually.
 */
export function detectQualifiedSynergies(assignedCompanies = []) {
  return SYNERGY_RULES.map(rule => {
    const qualCheck = checkSynergyQualified(rule, assignedCompanies);
    return {
      rule,
      ...qualCheck,
    };
  });
}

/**
 * Validates whether a combination of synergy IDs can be activated simultaneously
 * without exceeding the available sectors of the assigned companies.
 */
export function validateSynergiesCombination(synergyRuleIds = [], assignedCompanies = []) {
  if (!synergyRuleIds || synergyRuleIds.length === 0) {
    return {
      valid: true,
      error: null,
      sectorUsage: {},
      remainingSectors: {},
      wildcardDeficit: 0,
      remainingWildcards: 0,
    };
  }

  const rules = synergyRuleIds
    .map(id => SYNERGY_RULES.find(r => r.id === id))
    .filter(Boolean);

  const { counts, wildcardCount, totalAssigned } = getSectorInventory(assignedCompanies);

  // Total companies needed across all active synergies
  const totalCompaniesNeeded = rules.reduce((acc, r) => acc + r.sectors.length, 0);
  if (totalCompaniesNeeded > totalAssigned) {
    return {
      valid: false,
      error: `Requires ${totalCompaniesNeeded} companies, but only ${totalAssigned} are assigned to roles.`,
      conflictingSectors: ['Total Companies Cap'],
      sectorUsage: {},
      remainingSectors: {},
      wildcardDeficit: totalCompaniesNeeded - totalAssigned,
      remainingWildcards: 0,
    };
  }

  // Count requirements per sector
  const requiredCounts = {};
  for (const rule of rules) {
    for (const sector of rule.sectors) {
      requiredCounts[sector] = (requiredCounts[sector] || 0) + 1;
    }
  }

  let wildcardDeficit = 0;
  const sectorUsage = {};
  const remainingSectors = { ...counts };
  const conflictingSectors = [];

  for (const [sector, needed] of Object.entries(requiredCounts)) {
    const available = counts[sector] || 0;
    sectorUsage[sector] = { needed, available };
    if (needed > available) {
      const deficit = needed - available;
      wildcardDeficit += deficit;
      conflictingSectors.push(`${sector} (${needed} needed, ${available} assigned)`);
      remainingSectors[sector] = 0;
    } else {
      remainingSectors[sector] = available - needed;
    }
  }

  if (wildcardDeficit > wildcardCount) {
    return {
      valid: false,
      error: `Insufficient sector availability for: ${conflictingSectors.join(', ')}.`,
      conflictingSectors,
      sectorUsage,
      remainingSectors,
      wildcardDeficit,
      remainingWildcards: 0,
    };
  }

  return {
    valid: true,
    error: null,
    conflictingSectors: [],
    sectorUsage,
    remainingSectors,
    wildcardDeficit,
    remainingWildcards: wildcardCount - wildcardDeficit,
  };
}

/**
 * Checks whether a candidate synergy can be added to the currently active synergies.
 */
export function canAddSynergy(currentSynergyIds = [], candidateSynergyId, assignedCompanies = []) {
  if (currentSynergyIds.includes(candidateSynergyId)) {
    return { canAdd: true, error: null }; // Already active (can be toggled off)
  }
  const testIds = [...currentSynergyIds, candidateSynergyId];
  const validation = validateSynergiesCombination(testIds, assignedCompanies);
  return {
    canAdd: validation.valid,
    error: validation.error,
    conflictingSectors: validation.conflictingSectors,
  };
}

/**
 * Calculates the Local Grouped Multiplier score.
 * Multipliers apply ONLY to the specific assigned companies forming each synergy.
 * No double counting (each company is consumed by at most one synergy).
 * When multiple companies match a sector, assigns the higher base score company to the higher multiplier synergy.
 * 
 * Formula:
 * Final Score = (Sum of base scores in Synergy 1 × Multiplier 1)
 *             + (Sum of base scores in Synergy 2 × Multiplier 2)
 *             + (Sum of base scores of unused companies)
 */
export function calculateLocalSynergyScore(assignedCompanies = [], activeSynergyRuleIds = []) {
  const totalBaseScore = assignedCompanies.reduce((acc, c) => acc + c.baseScore, 0);

  // Validate combination first
  const validation = validateSynergiesCombination(activeSynergyRuleIds, assignedCompanies);
  if (!validation.valid || activeSynergyRuleIds.length === 0) {
    return {
      finalScore: Number(totalBaseScore.toFixed(2)),
      baseScore: Number(totalBaseScore.toFixed(2)),
      synergyGroups: [],
      unusedCompanies: [...assignedCompanies],
      unusedScoreSum: Number(totalBaseScore.toFixed(2)),
      synergyBonus: 0,
      validation,
    };
  }

  // Get active rules sorted by multiplier descending
  const rules = activeSynergyRuleIds
    .map(id => SYNERGY_RULES.find(r => r.id === id))
    .filter(Boolean)
    .sort((a, b) => b.multiplier - a.multiplier);

  // Build the slots to fill
  const slots = [];
  rules.forEach((rule, synIndex) => {
    rule.sectors.forEach(sector => {
      slots.push({ synIndex, rule, sector });
    });
  });

  let bestAssignment = null;
  let bestScore = -1;

  function search(slotIdx, currentAssignment, usedIds) {
    if (slotIdx === slots.length) {
      let total = 0;
      const groups = rules.map(rule => ({
        rule,
        companies: [],
        baseSum: 0,
      }));

      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        const comp = currentAssignment[i];
        groups[s.synIndex].companies.push(comp);
        groups[s.synIndex].baseSum += comp.baseScore;
      }

      for (const g of groups) {
        total += g.baseSum * g.rule.multiplier;
      }

      let unusedSum = 0;
      for (const comp of assignedCompanies) {
        if (!usedIds.has(comp.companyId)) {
          total += comp.baseScore;
          unusedSum += comp.baseScore;
        }
      }

      if (total > bestScore) {
        bestScore = total;
        bestAssignment = {
          groups: groups.map(g => ({
            synergy: g.rule,
            multiplier: g.rule.multiplier,
            companies: g.companies,
            baseScoreSum: Number(g.baseSum.toFixed(3)),
            synergyScore: Number((g.baseSum * g.rule.multiplier).toFixed(3)),
          })),
          usedIds: new Set(usedIds),
        };
      }
      return;
    }

    const slot = slots[slotIdx];
    const candidates = assignedCompanies.filter(c =>
      !usedIds.has(c.companyId) && (c.sector === slot.sector || c.sector === 'WILDCARD')
    );

    // Sort candidates by baseScore descending to prioritize higher score companies
    candidates.sort((a, b) => b.baseScore - a.baseScore);

    for (const cand of candidates) {
      usedIds.add(cand.companyId);
      currentAssignment[slotIdx] = cand;
      search(slotIdx + 1, currentAssignment, usedIds);
      usedIds.delete(cand.companyId);
    }
  }

  search(0, [], new Set());

  if (!bestAssignment) {
    return {
      finalScore: Number(totalBaseScore.toFixed(2)),
      baseScore: Number(totalBaseScore.toFixed(2)),
      synergyGroups: [],
      unusedCompanies: [...assignedCompanies],
      unusedScoreSum: Number(totalBaseScore.toFixed(2)),
      synergyBonus: 0,
      validation,
    };
  }

  const unusedCompanies = assignedCompanies.filter(c => !bestAssignment.usedIds.has(c.companyId));
  const unusedScoreSum = unusedCompanies.reduce((acc, c) => acc + c.baseScore, 0);

  return {
    finalScore: Number(bestScore.toFixed(2)),
    baseScore: Number(totalBaseScore.toFixed(2)),
    synergyGroups: bestAssignment.groups,
    unusedCompanies,
    unusedScoreSum: Number(unusedScoreSum.toFixed(3)),
    synergyBonus: Number((bestScore - totalBaseScore).toFixed(2)),
    validation,
  };
}

/**
 * Finds the optimal combination of synergies that maximizes the final score.
 */
export function findBestSynergyCombination(assignedCompanies = []) {
  if (!assignedCompanies || assignedCompanies.length === 0) {
    return [];
  }

  const qualified = detectQualifiedSynergies(assignedCompanies)
    .filter(q => q.qualified)
    .map(q => q.rule.id);

  if (qualified.length === 0) return [];

  // Generate all subsets of qualified synergies up to size 3
  const validCombos = [[]];
  for (const synId of qualified) {
    const currentLen = validCombos.length;
    for (let i = 0; i < currentLen; i++) {
      const candidate = [...validCombos[i], synId];
      if (candidate.length <= 3 && validateSynergiesCombination(candidate, assignedCompanies).valid) {
        validCombos.push(candidate);
      }
    }
  }

  let bestCombo = [];
  let maxScore = -1;

  for (const combo of validCombos) {
    const result = calculateLocalSynergyScore(assignedCompanies, combo);
    if (result.finalScore > maxScore) {
      maxScore = result.finalScore;
      bestCombo = combo;
    }
  }

  return bestCombo;
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
      assignedCompanies.push({
        roleId: role.id,
        roleTitle: role.title,
        companyId: company.id,
        companyName: company.name,
        sector: company.sector,
        basePrice: company.basePrice,
        baseScore: Number(score.toFixed(3)),
        company,
      });
      assignedCount++;
    } else {
      roleScores[role.id] = {
        score: 0,
        company: null,
        breakdown: null,
      };
    }
  }

  // Active synergy IDs from team.selectedSynergies
  const rawSelectedSynergies = Array.isArray(team.selectedSynergies) ? team.selectedSynergies : [];

  // Sanitize selectedSynergies: only keep ones that remain valid with current role assignments
  const validSelectedSynergies = [];
  for (const synId of rawSelectedSynergies) {
    if (validateSynergiesCombination([...validSelectedSynergies, synId], assignedCompanies).valid) {
      validSelectedSynergies.push(synId);
    }
  }

  const scoringResult = calculateLocalSynergyScore(assignedCompanies, validSelectedSynergies);

  // Backward compatibility fields
  const activeSynergy = scoringResult.synergyGroups.length > 0 ? scoringResult.synergyGroups[0].synergy : null;
  const synergyMultiplier = scoringResult.synergyGroups.length > 0 ? scoringResult.synergyGroups[0].multiplier : 1.0;

  return {
    teamId: team.id,
    teamName: team.name,
    assignedCount,
    isComplete: assignedCount === 6,
    roleScores,
    baseScore: Number(baseScore.toFixed(2)),
    finalScore: scoringResult.finalScore,
    synergyBonus: scoringResult.synergyBonus,
    synergyGroups: scoringResult.synergyGroups,
    unusedCompanies: scoringResult.unusedCompanies,
    unusedScoreSum: scoringResult.unusedScoreSum,
    selectedSynergies: validSelectedSynergies,
    // Backward compatibility properties:
    synergyMultiplier,
    activeSynergy,
    synergyDetails: {
      activeSynergy,
      multiplier: synergyMultiplier,
      matchedRules: scoringResult.synergyGroups,
    },
    scoringResult,
  };
}

/**
 * Legacy synergy evaluation helper kept for backward compatibility.
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

  const sectorList = validCompanies.map(c => c.sector);
  const wildcardCompanies = validCompanies.filter(c => c.sector === 'WILDCARD');
  const nonWildcardSectors = new Set(validCompanies.filter(c => c.sector !== 'WILDCARD').map(c => c.sector));

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
    description: 'No matching synergy combo found. Multiplier: 1.00x',
  };
}

/**
 * Suggest optimal role assignment for a team's purchased companies.
 * Uses greedy matching with highest total score.
 */
export function autoOptimizeRoles(purchasedCompanies) {
  if (!purchasedCompanies || purchasedCompanies.length === 0) return {};

  const availableRoles = [...CORE_VC_ROLES];
  const assigned = {};
  const remainingCompanies = [...purchasedCompanies];

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
