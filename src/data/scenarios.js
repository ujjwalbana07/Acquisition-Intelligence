// ============================================================
// SAMPLE DEALS "CURATED INVESTMENT CASES"
// ============================================================

export const SCENARIOS = [
  {
    id: 'oak_ridge',
    label: 'Oak Ridge Apartments (Multifamily)',
    description: 'Institutionally-managed Class B asset. Value-add thesis with challenging leverage profile.',
    inputs: {
      propertyName: 'Oak Ridge Apartments',
      propertyType: 'Multifamily',
      location: 'Dallas, TX',
      askingPrice: 1200000,
      projectedRentalIncome: 140000,
      vacancyRate: 0.08,
      annualOperatingExpenses: 50000,
      renovationCost: 150000,
      downPayment: 300000,
      loanAmount: 900000, // 75% LTV
      interestRate: 0.065,
      loanTerm: 30,
      expectedAppreciation: 0.03,
      targetReturnThreshold: 0.08,
      notes: 'Strategic value-add play. Post-renovation rents projected 12% below market ceiling. However, tight DSCR coverage and elevated CapEx requirements constrain near-term levered yields. Renegotiation on acquisition basis advised.',
    },
  },
  {
    id: 'riverside_plaza',
    label: 'Riverside Retail Plaza (Strip Center)',
    description: 'Distressed retail center showing severe NOI degradation and aggressive capital structure.',
    inputs: {
      propertyName: 'Riverside Plaza Retail Center',
      propertyType: 'Retail / Strip Center',
      location: 'Memphis, TN',
      askingPrice: 2100000,
      projectedRentalIncome: 180000,
      vacancyRate: 0.20,
      annualOperatingExpenses: 100000,
      renovationCost: 200000,
      downPayment: 525000,
      loanAmount: 1575000, // 75% LTV
      interestRate: 0.0775,
      loanTerm: 25,
      expectedAppreciation: 0.01,
      targetReturnThreshold: 0.09,
      notes: 'Anchor tenant vacated in Q3. Substantial deferred maintenance impacting facade and HVAC systems. Frictional vacancy is high; operating expenses cannibalize yield. Reject logic expected.',
    },
  },
  {
    id: 'highland_flex',
    label: 'Highland Business Park (Industrial)',
    description: 'Fully stabilized industrial core asset. Resilient cash flow and robust tenant credit.',
    inputs: {
      propertyName: 'Highland Business Park',
      propertyType: 'Industrial / Flex',
      location: 'Austin, TX',
      askingPrice: 1850000,
      projectedRentalIncome: 215000,
      vacancyRate: 0.04,
      annualOperatingExpenses: 45000,
      renovationCost: 0,
      downPayment: 650000,
      loanAmount: 1200000, // ~65% LTV
      interestRate: 0.0575,
      loanTerm: 30,
      expectedAppreciation: 0.04,
      targetReturnThreshold: 0.07,
      notes: 'NNN lease structure with corporate guarantees. Two tenant renewals executed < 12 months. Excellent market absorption rates in immediate submarket. Clean acquisition profile.',
    },
  },
];

export const DEFAULT_INPUTS = {
  propertyName: '',
  propertyType: 'Multifamily',
  location: '',
  askingPrice: '',
  projectedRentalIncome: '',
  vacancyRate: 0.08,
  annualOperatingExpenses: '',
  renovationCost: 0,
  downPayment: '',
  loanAmount: '',
  interestRate: 0.065,
  loanTerm: 30,
  expectedAppreciation: 0.03,
  targetReturnThreshold: 0.08,
  notes: '',
};
