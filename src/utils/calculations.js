// ============================================================
// FINANCIAL CALCULATIONS UTILITY
// All formulas are transparent and individually testable.
// ============================================================

/**
 * Gross Potential Income — maximum rental income at full occupancy
 */
export function calcGrossIncome(projectedRentalIncome) {
  return projectedRentalIncome;
}

/**
 * Effective Gross Income — income after accounting for vacancy loss
 * EGI = GPI × (1 - Vacancy Rate)
 */
export function calcEffectiveGrossIncome(projectedRentalIncome, vacancyRate) {
  return projectedRentalIncome * (1 - vacancyRate);
}

/**
 * Net Operating Income — income after operating expenses (before debt service)
 * NOI = EGI - Annual Operating Expenses
 */
export function calcNOI(effectiveGrossIncome, annualOperatingExpenses) {
  return effectiveGrossIncome - annualOperatingExpenses;
}

/**
 * Cap Rate — unleveraged property yield
 * Cap Rate = NOI / Asking Price
 */
export function calcCapRate(noi, askingPrice) {
  if (!askingPrice) return 0;
  return noi / askingPrice;
}

/**
 * Annual Debt Service — standard mortgage amortization formula
 * ADS = P × [r(1+r)^n] / [(1+r)^n - 1]
 * where r = monthly rate, n = number of months
 */
export function calcAnnualDebtService(loanAmount, annualInterestRate, loanTermYears) {
  if (!loanAmount || !annualInterestRate || !loanTermYears) return 0;
  const r = annualInterestRate / 12;  // monthly rate
  const n = loanTermYears * 12;       // total months
  if (r === 0) return loanAmount / n * 12;
  const monthlyPayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return monthlyPayment * 12;
}

/**
 * Debt Service Coverage Ratio — how well NOI covers debt payments
 * DSCR = NOI / Annual Debt Service
 * (Higher is better; lenders typically require 1.25+)
 */
export function calcDSCR(noi, annualDebtService) {
  if (!annualDebtService) return null;
  return noi / annualDebtService;
}

/**
 * Total Initial Cash Invested — total upfront equity deployed
 * = Down Payment + Renovation / CapEx Cost
 */
export function calcTotalCashInvested(downPayment, renovationCost) {
  return downPayment + (renovationCost || 0);
}

/**
 * Cash-on-Cash Return — annual return on cash invested (levered)
 * CoC = (NOI - Annual Debt Service) / Total Cash Invested
 */
export function calcCashOnCash(noi, annualDebtService, totalCashInvested) {
  if (!totalCashInvested) return 0;
  return (noi - annualDebtService) / totalCashInvested;
}

/**
 * Expense Ratio — proportion of EGI consumed by operating expenses
 * Expense Ratio = Operating Expenses / EGI
 */
export function calcExpenseRatio(annualOperatingExpenses, effectiveGrossIncome) {
  if (!effectiveGrossIncome) return 0;
  return annualOperatingExpenses / effectiveGrossIncome;
}

/**
 * Loan-to-Value Ratio — leverage indicator
 * LTV = Loan Amount / Asking Price
 */
export function calcLTV(loanAmount, askingPrice) {
  if (!askingPrice) return 0;
  return loanAmount / askingPrice;
}

/**
 * Break-Even Occupancy — minimum occupancy to cover all cash obligations
 * BE Occ = (Operating Expenses + Annual Debt Service) / Gross Potential Income
 */
export function calcBreakEvenOccupancy(annualOperatingExpenses, annualDebtService, grossIncome) {
  if (!grossIncome) return 0;
  return (annualOperatingExpenses + annualDebtService) / grossIncome;
}

/**
 * Debt Burden Ratio — annual debt service as % of effective gross income
 */
export function calcDebtBurdenRatio(annualDebtService, effectiveGrossIncome) {
  if (!effectiveGrossIncome) return 0;
  return annualDebtService / effectiveGrossIncome;
}

/**
 * Renovation Burden — renovation cost as % of asking price
 */
export function calcRenovationBurden(renovationCost, askingPrice) {
  if (!askingPrice) return 0;
  return (renovationCost || 0) / askingPrice;
}

/**
 * Run all calculations and return a full metrics object
 */
export function runAllCalculations(inputs) {
  const {
    projectedRentalIncome,
    vacancyRate,
    annualOperatingExpenses,
    renovationCost,
    downPayment,
    loanAmount,
    interestRate,
    loanTerm,
    askingPrice,
  } = inputs;

  const grossIncome = calcGrossIncome(projectedRentalIncome);
  const egi = calcEffectiveGrossIncome(projectedRentalIncome, vacancyRate);
  const noi = calcNOI(egi, annualOperatingExpenses);
  const capRate = calcCapRate(noi, askingPrice);
  const annualDebtService = calcAnnualDebtService(loanAmount, interestRate, loanTerm);
  const dscr = calcDSCR(noi, annualDebtService);
  const totalCashInvested = calcTotalCashInvested(downPayment, renovationCost);
  const cashOnCash = calcCashOnCash(noi, annualDebtService, totalCashInvested);
  const expenseRatio = calcExpenseRatio(annualOperatingExpenses, egi);
  const ltv = calcLTV(loanAmount, askingPrice);
  const breakEvenOccupancy = calcBreakEvenOccupancy(annualOperatingExpenses, annualDebtService, grossIncome);
  const debtBurdenRatio = calcDebtBurdenRatio(annualDebtService, egi);
  const renovationBurden = calcRenovationBurden(renovationCost, askingPrice);
  const annualCashFlow = noi - annualDebtService;

  return {
    grossIncome,
    egi,
    noi,
    capRate,
    annualDebtService,
    dscr,
    totalCashInvested,
    cashOnCash,
    expenseRatio,
    ltv,
    breakEvenOccupancy,
    debtBurdenRatio,
    renovationBurden,
    annualCashFlow,
  };
}

/**
 * Predicts the maximum purchase price to satisfy standard institutional DSCR and Cash-on-Cash targets.
 * Decrements asking price while holding LTV constant to find a mathematical floor.
 */
export function calcTargetEntryBasis(inputs, currentMetrics, targetDSCR = 1.25, targetCoC = 0.08) {
  const { noi } = currentMetrics;
  let testPrice = inputs.askingPrice;
  const originalLTV = inputs.askingPrice > 0 ? inputs.loanAmount / inputs.askingPrice : 0;
  const step = 5000;
  
  let currentDSCR = currentMetrics.dscr || 0;
  let currentCoC = currentMetrics.cashOnCash || 0;
  let iterations = 0;
  
  // Guard for structurally unviable deals (e.g. negative NOI where price reduction doesn't help)
  if (noi <= 0) return { viable: false, targetPrice: null };

  while ((currentDSCR < targetDSCR || currentCoC < targetCoC) && testPrice > 0 && iterations < 5000) {
    testPrice -= step;
    
    const newLoanAmount = testPrice * originalLTV;
    const newDownPayment = testPrice - newLoanAmount;
    
    const newADS = calcAnnualDebtService(newLoanAmount, inputs.interestRate, inputs.loanTerm);
    currentDSCR = calcDSCR(noi, newADS);
    
    const newTotalCash = calcTotalCashInvested(newDownPayment, inputs.renovationCost);
    currentCoC = calcCashOnCash(noi, newADS, newTotalCash);
    
    iterations++;
  }
  
  if (testPrice <= 0) return { viable: false, targetPrice: null };
  
  // Determine dominant blocking constraint heuristically
  const dscrIsTight = currentDSCR - targetDSCR < 0.05;
  const cocIsTight = currentCoC - targetCoC < 0.005;
  let blocker = 'Leverage/Returns';
  if (dscrIsTight && !cocIsTight) blocker = 'DSCR (Debt Service)';
  if (cocIsTight && !dscrIsTight) blocker = 'Cash-on-Cash Return';
  
  return {
    viable: true,
    targetPrice: testPrice,
    gapPercent: ((inputs.askingPrice - testPrice) / inputs.askingPrice) * 100,
    solvedDSCR: currentDSCR,
    solvedCoC: currentCoC,
    bindingConstraint: blocker
  };
}
