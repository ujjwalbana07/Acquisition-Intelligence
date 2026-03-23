// ============================================================
// RECOMMENDATION ENGINE (FINTECH)
// Rule-based scoring → Proceed, Proceed with Caution, Renegotiate, Reject
// ============================================================

import { THRESHOLDS, SCORE_WEIGHTS, RECOMMENDATION_THRESHOLDS } from '../config/thresholds';

export const RECOMMENDATIONS = {
  PROCEED: 'Proceed',
  CAUTION: 'Proceed with Caution',
  RENEGOTIATE: 'Renegotiate',
  REJECT: 'Reject',
};

function scoreDSCR(dscr) {
  if (dscr === null) return 50;
  if (dscr >= 1.5) return Math.min(95, 88 + Math.floor((dscr - 1.5) * 10)); // max ~95
  if (dscr >= 1.25) return 78 + Math.floor((dscr - 1.25) * 40); // 78-87
  if (dscr >= 1.15) return 60 + Math.floor((dscr - 1.15) * 150); // 60-75
  if (dscr >= 1.0) return 35 + Math.floor((dscr - 1.0) * 150); // 35-50
  return 20; // <1.0
}

function scoreCapRate(capRate, targetReturn) {
  const benchmark = targetReturn || THRESHOLDS.CAP_RATE_ACCEPTABLE;
  if (capRate >= THRESHOLDS.CAP_RATE_STRONG) return Math.min(95, 85 + Math.floor((capRate - 0.075) * 200));
  if (capRate >= benchmark) return 75 + Math.floor((capRate - benchmark) * 200);
  if (capRate >= THRESHOLDS.CAP_RATE_ACCEPTABLE) return 55 + Math.floor((capRate - 0.06) * 300);
  if (capRate >= THRESHOLDS.CAP_RATE_WEAK) return 35 + Math.floor((capRate - 0.05) * 200);
  return 15;
}

function scoreCashOnCash(coc, targetReturn) {
  const target = targetReturn || THRESHOLDS.CASH_ON_CASH_STRONG;
  if (coc >= target) return Math.min(95, 88 + Math.floor((coc - target) * 100));
  if (coc >= THRESHOLDS.CASH_ON_CASH_ACCEPTABLE) return 65 + Math.floor((coc - 0.08) * 500);
  if (coc >= THRESHOLDS.CASH_ON_CASH_WEAK) return 40 + Math.floor((coc - 0.05) * 500);
  if (coc >= 0) return 20 + Math.floor(coc * 400);
  return 5;
}

function scoreLTV(ltv) {
  if (ltv <= THRESHOLDS.LTV_CONSERVATIVE) return Math.min(95, 90 + Math.floor((0.65 - ltv) * 50));
  if (ltv <= THRESHOLDS.LTV_ACCEPTABLE) return 75 + Math.floor((0.75 - ltv) * 150);
  if (ltv <= THRESHOLDS.LTV_HIGH) return 50 + Math.floor((0.80 - ltv) * 500);
  if (ltv <= THRESHOLDS.LTV_CRITICAL) return 30 + Math.floor((0.85 - ltv) * 400);
  return 15;
}

function scoreExpenseRatio(ratio) {
  if (ratio <= THRESHOLDS.EXPENSE_RATIO_GOOD) return Math.min(94, 85 + Math.floor((0.35 - ratio) * 100));
  if (ratio <= THRESHOLDS.EXPENSE_RATIO_ACCEPTABLE) return 65 + Math.floor((0.45 - ratio) * 200);
  if (ratio <= THRESHOLDS.EXPENSE_RATIO_HIGH) return 40 + Math.floor((0.55 - ratio) * 250);
  return 20;
}

function scoreVacancy(vacancyRate) {
  if (vacancyRate <= THRESHOLDS.VACANCY_LOW) return Math.min(95, 88 + Math.floor((0.05 - vacancyRate) * 100));
  if (vacancyRate <= THRESHOLDS.VACANCY_ACCEPTABLE) return 70 + Math.floor((0.10 - vacancyRate) * 300);
  if (vacancyRate <= THRESHOLDS.VACANCY_HIGH) return 40 + Math.floor((0.15 - vacancyRate) * 600);
  return 15;
}

function scoreRenovation(renovationBurden) {
  if (renovationBurden <= 0) return 95;
  if (renovationBurden <= THRESHOLDS.RENO_LOW) return 85 + Math.floor((0.05 - renovationBurden) * 100);
  if (renovationBurden <= THRESHOLDS.RENO_MODERATE) return 65 + Math.floor((0.10 - renovationBurden) * 400);
  if (renovationBurden <= THRESHOLDS.RENO_HIGH) return 45 + Math.floor((0.15 - renovationBurden) * 400);
  if (renovationBurden <= THRESHOLDS.RENO_CRITICAL) return 25 + Math.floor((0.25 - renovationBurden) * 200);
  return 10;
}

export function generateRecommendation(metrics, inputs, risks) {
  const { dscr, capRate, cashOnCash, ltv, expenseRatio, renovationBurden } = metrics;
  const { vacancyRate, targetReturnThreshold } = inputs;

  const scores = {
    dscr: scoreDSCR(dscr),
    capRate: scoreCapRate(capRate, targetReturnThreshold),
    cashOnCash: scoreCashOnCash(cashOnCash, targetReturnThreshold),
    ltv: scoreLTV(ltv),
    expenseRatio: scoreExpenseRatio(expenseRatio),
    vacancy: scoreVacancy(vacancyRate),
    renovation: scoreRenovation(renovationBurden),
  };

  const totalWeight = Object.values(SCORE_WEIGHTS).reduce((s, w) => s + w, 0);
  const composite =
    (scores.dscr * SCORE_WEIGHTS.DSCR +
      scores.capRate * SCORE_WEIGHTS.CAP_RATE +
      scores.cashOnCash * SCORE_WEIGHTS.CASH_ON_CASH +
      scores.ltv * SCORE_WEIGHTS.LTV +
      scores.expenseRatio * SCORE_WEIGHTS.EXPENSE_RATIO +
      scores.vacancy * SCORE_WEIGHTS.VACANCY +
      scores.renovation * SCORE_WEIGHTS.RENOVATION) /
    totalWeight;

  const criticalFlags = risks.filter((r) => r.severity === 'critical');

  if (dscr !== null && dscr <= THRESHOLDS.DSCR_CRITICAL) {
    return buildResult(RECOMMENDATIONS.REJECT, composite, scores, criticalFlags, 'Severe DSCR impairment (≤1.0x). The asset cannot reliably service its debt structure from stabilized operations.');
  }
  if (cashOnCash < -0.03) {
    return buildResult(RECOMMENDATIONS.REJECT, composite, scores, criticalFlags, 'Materially negative levered yield indicates an unsustainable acquisition under the proposed capital stack.');
  }
  if (criticalFlags.length >= 3) {
    return buildResult(RECOMMENDATIONS.REJECT, composite, scores, criticalFlags, 'Intersecting critical risk factors detected. The asset profile does not meet baseline institutional underwriting standards.');
  }

  let recommendation;
  if (composite >= RECOMMENDATION_THRESHOLDS.PROCEED) {
    recommendation = RECOMMENDATIONS.PROCEED;
  } else if (composite >= RECOMMENDATION_THRESHOLDS.CAUTION) {
    recommendation = RECOMMENDATIONS.CAUTION;
  } else if (composite >= RECOMMENDATION_THRESHOLDS.RENEGOTIATE) {
    recommendation = RECOMMENDATIONS.RENEGOTIATE;
  } else {
    recommendation = RECOMMENDATIONS.REJECT;
  }

  const rationale = buildRationale(recommendation, scores, metrics, inputs, criticalFlags);
  const shortRationale = buildShortRationale(recommendation, scores, criticalFlags);

  return buildResult(recommendation, composite, scores, criticalFlags, rationale, shortRationale);
}

function buildResult(recommendation, score, scores, criticalFlags, rationale, shortRationale) {
  return { recommendation, score: Math.round(score), scores, criticalFlags, rationale, shortRationale: shortRationale || rationale };
}

function buildShortRationale(recommendation, scores, criticalFlags) {
  if (recommendation === RECOMMENDATIONS.PROCEED) {
    if (scores.dscr >= 80 && scores.capRate >= 80) return "Strong debt coverage and attractive entry yield support capital deployment.";
    return "Solid operational metrics and capital structure support acquisition at current terms.";
  }
  if (recommendation === RECOMMENDATIONS.CAUTION) {
    if (scores.dscr < 70) return "Tight debt coverage margins require capital structure optimization before proceeding.";
    return "Mixed dimensional metrics require targeted downside sensitivity modeling before deployment.";
  }
  if (recommendation === RECOMMENDATIONS.RENEGOTIATE) {
    if (scores.ltv < 60 || scores.dscr < 60) return "Structural leverage issues undermine execution; debt structure must be reworked.";
    return "Misaligned economics at the current basis require material pricing concessions.";
  }
  if (recommendation === RECOMMENDATIONS.REJECT) {
    if (scores.dscr < 50) return "Severe debt service impairment restricts deployment viability.";
    if (scores.cashOnCash < 50) return "Negative or marginal levered yields undermine execution threshold.";
    return "Fundamental underwriting metrics fail to support capital deployment.";
  }
}

function getPostures(recommendation) {
  switch (recommendation) {
    case RECOMMENDATIONS.PROCEED: return 'presents a highly actionable acquisition opportunity';
    case RECOMMENDATIONS.CAUTION: return 'represents a bifurcated investment profile requiring measured execution';
    case RECOMMENDATIONS.RENEGOTIATE: return 'demonstrates misaligned economics at the current structural basis';
    case RECOMMENDATIONS.REJECT: return 'fails to clear baseline institutional underwriting thresholds';
    default: return 'merits further review';
  }
}

function buildRationale(recommendation, scores, metrics, inputs, criticalFlags) {
  const strengths = [];
  const weaknesses = [];

  if (scores.dscr >= 75) strengths.push('resilient debt coverage');
  else if (scores.dscr <= 50) weaknesses.push('constrained debt margins');

  if (scores.capRate >= 75) strengths.push('an attractive entry yield');
  else if (scores.capRate <= 50) weaknesses.push('a compressed yield profile');

  if (scores.cashOnCash >= 75) strengths.push('strong equity returns');
  else if (scores.cashOnCash <= 50) weaknesses.push('weak levered cash flow');

  if (scores.ltv >= 75) strengths.push('conservative capitalization');
  else if (scores.ltv <= 50) weaknesses.push('elevated leverage exposure');

  if (scores.expenseRatio >= 75) strengths.push('efficient overhead');
  else if (scores.expenseRatio <= 50) weaknesses.push('an outsized expense burden');
  
  if (metrics.breakEvenOccupancy <= 0.8) strengths.push('a low break-even occupancy');
  else if (metrics.breakEvenOccupancy >= 0.85) weaknesses.push('a dangerously tight break-even threshold');

  // Sentence 1: Overall posture
  const s1 = `The ${inputs.propertyType || 'asset'} ${getPostures(recommendation)}.`;

  // Sentence 2: Strongest Positive
  const s2 = strengths.length > 0 
    ? `The transaction is primarily anchored by ${strengths[0]}${strengths[1] ? ` and ${strengths[1]}` : ''}.`
    : `The deal exhibits standard operational stability without outsized financial multipliers.`;

  // Sentence 3: Biggest Risk
  const s3 = criticalFlags && criticalFlags.length > 0
    ? `However, downside is concentrated in ${criticalFlags[0].title.toLowerCase()} which directly threatens capital preservation.`
    : weaknesses.length > 0
      ? `Conversely, the primary structural concern is driven by ${weaknesses[0]}${weaknesses[1] ? ` and ${weaknesses[1]}` : ''}.`
      : `No significant structural defects were detected under the current underwriting assumptions.`;

  // Sentence 4: Final Recommendation
  let s4 = '';
  if (recommendation === RECOMMENDATIONS.PROCEED) {
    s4 = 'Recommend advancing to hard diligence and securing formal term sheets.';
  } else if (recommendation === RECOMMENDATIONS.CAUTION) {
    s4 = 'Recommend advancing strictly subject to downside sensitivity modeling and risk mitigation.';
  } else if (recommendation === RECOMMENDATIONS.RENEGOTIATE) {
    s4 = 'Recommend pausing deployment until pricing concessions or capital structure adjustments are secured.';
  } else {
    s4 = 'Recommend declining the opportunity and returning focus to higher-conviction pipeline assets.';
  }

  return `${s1} ${s2} ${s3} ${s4}`;
}

export function generateNextSteps(recommendation, risks, metrics, inputs) {
  const steps = [];
  const riskIds = risks.map((r) => r.id);

  if (recommendation === RECOMMENDATIONS.PROCEED) {
    steps.push({ icon: 'CheckCircle', text: 'Draft and issue formal Letter of Intent (LOI) to seller.' });
    steps.push({ icon: 'Shield', text: 'Initiate institutional phase 1 environmental and property condition assessments.' });
    steps.push({ icon: 'BarChart2', text: 'Commission third-party valuation and market rent feasibility study.' });
    steps.push({ icon: 'Briefcase', text: 'Finalize debt term sheet with preferred lending partners.' });
  }

  if (recommendation === RECOMMENDATIONS.CAUTION) {
    steps.push({ icon: 'AlertTriangle', text: 'Execute downside sensitivity modeling (+10% vacancy, -5% rent growth).' });
    if (riskIds.includes('dscr_low') || riskIds.includes('dscr_critical')) steps.push({ icon: 'TrendingDown', text: 'Rework capital structure (lower LTV or secure interest-only period) to restore debt coverage buffers.' });
    if (riskIds.includes('expense_elevated') || riskIds.includes('expense_high') || riskIds.includes('expense_critical')) steps.push({ icon: 'Search', text: 'Conduct forensic audit of trailing 12-month (T-12) operating statements to dispute expense leakages.' });
    if (riskIds.includes('coc_weak') || riskIds.includes('coc_below_target') || riskIds.includes('coc_negative')) steps.push({ icon: 'TrendingUp', text: 'Evaluate repricing acquisition basis or revisiting top-line income assumptions to meet minimum yield hurdle rates.' });
    if (riskIds.includes('breakeven_elevated') || riskIds.includes('breakeven_critical')) steps.push({ icon: 'Activity', text: 'Execute severe vacancy stress testing given dangerously tight operational breakeven thresholds.' });
    if (steps.length < 4) steps.push({ icon: 'Users', text: 'Analyze rent roll stability and near-term lease expiration exposure.' });
  }

  if (recommendation === RECOMMENDATIONS.RENEGOTIATE) {
    steps.push({ icon: 'Tag', text: 'Quantify exact purchase price discount required to reset baseline levered yields to institutional minimums.' });
    if (riskIds.includes('dscr_critical') || riskIds.includes('ltv_critical')) steps.push({ icon: 'Percent', text: 'Source alternative debt facilities to materially improve the blended cost of capital.' });
    if (riskIds.includes('reno_high') || riskIds.includes('reno_critical')) steps.push({ icon: 'Hammer', text: 'Secure hard bids for the CapEx program immediately and extract dollar-for-dollar seller closing concessions.' });
    if (riskIds.includes('breakeven_elevated') || riskIds.includes('breakeven_critical')) steps.push({ icon: 'Activity', text: 'Stress-test breakeven occupancy thresholds assuming the newly revised acquisition basis.' });
  }

  if (recommendation === RECOMMENDATIONS.REJECT) {
    steps.push({ icon: 'XCircle', text: 'Formally decline opportunity; immediately halt further expenditure of due diligence capital.' });
    steps.push({ icon: 'Search', text: 'Log asset profile and structural deficiencies to internal comparables database.' });
    steps.push({ icon: 'TrendingUp', text: 'Maintain strict pipeline triage; re-deploy underwriting resources to higher-conviction target assets.' });
  }

  if (inputs.renovationCost > 0 && recommendation !== RECOMMENDATIONS.REJECT && (riskIds.includes('reno_high') || riskIds.includes('reno_critical'))) {
    steps.push({ icon: 'Hammer', text: 'Validate stabilization timeline and radically audit construction cost estimates for planned CapEx.' });
  }

  return [...new Map(steps.map(item => [item.text, item])).values()].slice(0, 5); // Ensure uniqueness and max 5
}
