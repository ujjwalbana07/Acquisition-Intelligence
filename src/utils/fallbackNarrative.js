/**
 * CFO-Style Deterministic Narrative Generator (HARDENED)
 * This provides silent, high-fidelity fallback when the LLM API is unavailable.
 * Strictly prevents NaN, undefined, or malformed metric rendering.
 */

const formatNum = (val, decimals = 2, suffix = '') => {
  if (val === undefined || val === null || isNaN(val)) return '---';
  return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
};

const formatPct = (val, decimals = 2) => {
  if (val === undefined || val === null || isNaN(val)) return '---';
  return (val * 100).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + '%';
};

export function getFallbackNarrative(context, action) {
  const { inputs, metrics, result, risks } = context;
  
  const propertyName = inputs?.propertyName || 'Subject Property';
  const score = result?.score || 0;
  const verdict = result?.recommendation || "Under Review";
  
  const capRate = formatPct(metrics?.capRate);
  const dscr = formatNum(metrics?.dscr);
  const coc = formatPct(metrics?.cashOnCashReturn);
  const ltv = formatPct(metrics?.ltv, 1);
  const price = formatNum(inputs?.askingPrice, 0, '$');

  const topRisks = risks?.slice(0, 3).map(r => r.title) || [];
  
  const templates = {
    initial: `Intelligence analysis for **${propertyName}** is finalized. The deterministic model identifies a **${verdict}** grade with a holistic score of **${score}/100**. Primary drivers include the asset's **${capRate}** going-in cap rate and **${dscr}x** debt service coverage. Critical risk clusters have been identified in: **${topRisks.join(', ') || 'Market Volatility'}**.`,
    
    explain: `The **${verdict}** recommendation is fundamentally anchored by the current capital stack. 
- **Positive Drivers**: The asset demonstrates ${score > 70 ? 'strong' : 'moderate'} yield stability with a **${coc}** cash-on-cash return.
- **Critical Constraints**: Scoring is tempered by **${risks?.length || 0}** material risk signals and ${metrics?.dscr < 1.25 ? 'compressed debt coverage' : 'market-aligned leverage'}.
- **Verdict Rationale**: A **${verdict}** position is mathematically optimal to protect downside while preserving basis integrity.`,

    risks: `A multidimensional risk audit has flagged **${risks?.length || 0}** material signals. 
- **Concentration**: Primary exposure is localized in **${topRisks[0] || 'Market Volatility'}**.
- **Structural**: Sub-threshold performance suggests a need for ${metrics?.ltv > 0.7 ? 'immediate de-leveraging' : 'operational gains'}.
- **Macro**: External triggers regarding ${topRisks[1] || 'Exit Cap Compression'} must be addressed during technical diligence.`,

    improve: `To move the current grade beyond **${verdict}**, institutional optimization is required:
- **Basis Correction**: A price reduction would naturally expand the cap rate towards preferred thresholds.
- **Capital Stack**: Optimizing the loan-to-value ratio would restore ${dscr}x coverage to safer institutional bands.
- **Operating Efficiencies**: Targeting better expense management would improve net yields and overall deal score.`,

    shifting: `To achieve a verdict upgrade from **${verdict}**:
- Move **Cap Rate** toward market-leading averages through aggressive basis negotiation.
- Secure financing with better terms to solve for ${coc} yields.
- Validate **Stabilized Occupancy** at 95%+ during the diligence period to de-risk cash flow.`,

    memo: `**INVESTMENT THESIS**: Acquisition of ${propertyName} presents a ${verdict} opportunity at a ${price} basis. The deal is motivated by ${score > 80 ? 'strong fundamental yield' : 'stabilization potential'} in the local corridor.

**RISK SUMMARY**: Material concentration revolves around ${topRisks[0] || 'market timing'} and ${topRisks[1] || 'operational execution'}. Current DSCR of ${dscr}x provides calculated margin.

**EXECUTION**: Immediate priorities include cap-ex verification and lease-audit validation to protect the yield profile.`,

    qa: `1. **Lease Audit**: Verify all rental escalations and turnover assumptions against T-12 actuals.
2. **CapEx Scope**: Confirm if the renovation budget is sufficient for market rent premiums.
3. **Debt Covenants**: Review prepayment penalties and minimum DSCR maintenance requirements.
4. **Market Comp Check**: Validate the acquisition basis against recent submarket representative trades.`,

    conditions: verdict.includes('Proceed') ? 
      `**APPROVAL CONDITIONS**:
1. Final verification of rent roll accuracy and tenant estoppel certificates.
2. Structural engineer sign-off on the $${formatNum(inputs?.renovationCost, 0)} deferred maintenance budget.
3. Locked financing at an interest rate not exceeding ${formatPct(inputs?.interestRate)}.` :
      `**REJECTION RATIONALE**:
1. Insufficient DSCR cushion (${dscr}x) relative to the ${formatPct(inputs?.interestRate)} cost of capital.
2. Elevated risk concentration in **${topRisks.join(', ')}**.
3. Yield profile of **${coc}** does not meet the risk-adjusted target return of ${formatPct(inputs?.targetReturnThreshold)}.`
  };

  return templates[action] || templates.initial;
}
