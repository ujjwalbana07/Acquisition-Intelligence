// ============================================================
// FINANCIAL THRESHOLDS & DECISION CONSTANTS
// Adjust these values to tune the risk engine and recommendations
// ============================================================

export const THRESHOLDS = {
  // Debt Service Coverage Ratio (minimum 1.25)
  DSCR_STRONG: 1.5,
  DSCR_ACCEPTABLE: 1.25,
  DSCR_CAUTION: 1.15,
  DSCR_CRITICAL: 1.0,

  // Cap Rate (minimum 6.0%)
  CAP_RATE_STRONG: 0.075,
  CAP_RATE_ACCEPTABLE: 0.06,
  CAP_RATE_WEAK: 0.05,

  // Cash-on-Cash Return (minimum 8.0%)
  CASH_ON_CASH_STRONG: 0.10,
  CASH_ON_CASH_ACCEPTABLE: 0.08,
  CASH_ON_CASH_WEAK: 0.05,
  CASH_ON_CASH_NEGATIVE: 0.0,

  // Loan-to-Value Ratio (maximum 75%)
  LTV_CONSERVATIVE: 0.65,
  LTV_ACCEPTABLE: 0.75,
  LTV_HIGH: 0.80,
  LTV_CRITICAL: 0.85,

  // Vacancy Rate
  VACANCY_LOW: 0.05,
  VACANCY_ACCEPTABLE: 0.10,
  VACANCY_HIGH: 0.15,

  // Expense Ratio (maximum 45%)
  EXPENSE_RATIO_GOOD: 0.35,
  EXPENSE_RATIO_ACCEPTABLE: 0.45,
  EXPENSE_RATIO_HIGH: 0.55,
  EXPENSE_RATIO_CRITICAL: 0.65,

  // Break-even Occupancy (maximum 85%)
  BREAK_EVEN_GOOD: 0.75,
  BREAK_EVEN_ACCEPTABLE: 0.85,
  BREAK_EVEN_HIGH: 0.90,
  BREAK_EVEN_CRITICAL: 0.95,

  // Renovation Cost relative to Asking Price
  RENO_LOW: 0.05,
  RENO_MODERATE: 0.10,
  RENO_HIGH: 0.15,
  RENO_CRITICAL: 0.25,

  // Renovation Cost relative to Total Cash Invested
  RENO_VS_EQUITY_HIGH: 0.40, // Above 40% of equity → high
};

// Scoring weights for recommendation engine
export const SCORE_WEIGHTS = {
  DSCR: 30,
  CAP_RATE: 20,
  CASH_ON_CASH: 20,
  LTV: 10,
  EXPENSE_RATIO: 10,
  VACANCY: 5,
  RENOVATION: 5,
};

// Recommendation thresholds (out of 100)
export const RECOMMENDATION_THRESHOLDS = {
  PROCEED: 75,
  CAUTION: 55,
  RENEGOTIATE: 35,
  // Below 35 → REJECT
};

export const RISK_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};
