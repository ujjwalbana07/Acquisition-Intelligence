import { getResolvedMetrics } from './formatters';

export function getFallbackNarrative(context, action) {
  const { inputs, metrics, result, risks } = context;
  const m = getResolvedMetrics(metrics, inputs);
  
  const propertyName = inputs?.propertyName || 'Subject Property';
  const score = m.score || '0';
  const verdict = result?.recommendation || "Under Review";
  const topRisks = risks?.slice(0, 3).map(r => r.title) || [];
  
  // Helper to only include a sentence if the value exists
  const sentence = (header, val, template) => val ? template.replace('{val}', val) : '';

  const templates = {
    initial: `Intelligence analysis for **${propertyName}** is finalized. The deterministic model identifies a **${verdict}** grade with a holistic score of **${score}/100**. ${sentence('', m.capRate, `Primary drivers include the asset's **{val}** going-in cap rate`)} ${sentence('and', m.dscr, `and **{val}** debt service coverage.`)} Critical risk clusters have been identified in: **${topRisks.join(', ') || 'Market Volatility'}**.`,
    
    explain: `The **${verdict}** recommendation is fundamentally anchored by the current capital stack. 
- **Positive Drivers**: The asset demonstrates ${parseInt(score) > 70 ? 'strong' : 'moderate'} yield stability${m.cashOnCash ? ` with a **${m.cashOnCash}** cash-on-cash return` : ''}.
${sentence('- **Critical Constraints**: ', m.dscr, `Debt coverage is currently at **{val}**.`)} ${risks?.length > 0 ? `- **Risk Signals**: ${risks.length} material triggers detected.` : ''}
- **Verdict Rationale**: A **${verdict}** position is mathematically optimal to protect downside while preserving basis integrity.`,

    risks: `A multidimensional risk audit has flagged **${risks?.length || 0}** material signals. 
- **Concentration**: Primary exposure is localized in **${topRisks[0] || 'Market Volatility'}**.
- **Structural**: Sub-threshold performance suggests a need for ${metrics?.ltv > 0.7 ? 'immediate de-leveraging' : 'operational gains'}.
- **Macro**: External triggers regarding ${topRisks[1] || 'Exit Cap Compression'} must be addressed during technical diligence.`,

    improve: `To move the current grade beyond **${verdict}**, institutional optimization is required:
${sentence('- **Basis Correction**: ', m.price, `A reduction in the **{val}** asking price would naturally expand the cap rate.`)}
${sentence('- **Capital Stack**: ', m.dscr, `Optimizing leverage would restore **{val}** coverage to safer institutional bands.`)}
- **Operating Efficiencies**: Targeting better expense management would improve net yields and overall deal score.`,

    shifting: `To achieve a verdict upgrade from **${verdict}**:
- Move **Cap Rate** toward market-leading averages through aggressive basis negotiation.
- Secure financing with better terms to resolve yield constraints.
${sentence('- **Stabilized Occupancy**: ', m.breakEven, `Validation of occupancy above the **{val}** break-even threshold is critical.`)}`,

    memo: `**INVESTMENT THESIS**: Acquisition of ${propertyName} presents a ${verdict} opportunity ${m.price ? `at a ${m.price} basis` : ''}. The deal is motivated by ${parseInt(score) > 80 ? 'strong fundamental yield' : 'stabilization potential'} in the local corridor.

**RISK SUMMARY**: Material concentration revolves around ${topRisks[0] || 'market timing'} and ${topRisks[1] || 'operational execution'}. ${sentence('Current DSCR of ', m.dscr, `Current DSCR of **{val}** provides calculated margin.`)}

**EXECUTION**: Immediate priorities include cap-ex verification and lease-audit validation to protect the yield profile.`,

    qa: `1. **Lease Audit**: Verify all rental escalations and turnover assumptions against T-12 actuals.
2. **CapEx Scope**: Confirm if the renovation budget is sufficient for market rent premiums.
3. **Debt Covenants**: Review prepayment penalties and minimum DSCR maintenance requirements.
4. **Market Comp Check**: Validate the acquisition basis against recent submarket representative trades.`,

    conditions: verdict.includes('Proceed') ? 
      `**APPROVAL CONDITIONS**:
1. Final verification of rent roll accuracy and tenant estoppel certificates.
${sentence('2. ', m.freeCashFlow, `Verification of **{val}** annual free cash flow post-service.`)}
3. Locked financing at an interest rate not exceeding institutional benchmarks.` :
      `**REJECTION RATIONALE**:
${sentence('1. ', m.dscr, `Insufficient DSCR cushion (**{val}**) relative to the cost of capital.`)}
2. Elevated risk concentration in **${topRisks.join(', ')}**.
${sentence('3. ', m.cashOnCash, `Yield profile of **{val}** does not meet the risk-adjusted target return.`)}`
  };

  return templates[action] || templates.initial;
}
