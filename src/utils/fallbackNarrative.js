import { getResolvedMetrics } from './formatters';
import { calcTargetEntryBasis } from './calculations';

export function getFallbackNarrative(context, action, payloadStr) {
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

    shifting: (() => {
      const v = verdict.toLowerCase();
      if (v === 'reject') return `To achieve a verdict upgrade from **${verdict}** to Renegotiate:
- Materially reduce the **Purchase Price** to expand entry yield.
- Secure financing with materially lower leverage to resolve debt constraints.
${sentence('- **Operating Income**: ', m.price, `Increase underwritten revenue to support a higher valuation.`)}`;
      if (v === 'renegotiate') return `To achieve a verdict upgrade from **${verdict}** to Proceed with Caution:
- Negotiate a modest **Cap Rate** expansion through basis reduction.
- Optimize the capital stack to improve cash-on-cash returns.
${sentence('- **Break-Even**: ', m.breakEven, `Ensure the **{val}** break-even threshold is safely below market vacancy averages.`)}`;
      if (v === 'proceed with caution') return `To achieve a full upgrade from **${verdict}** to Proceed:
- Resolve any flagged structural or macro risks completely.
- Push DSCR metrics higher through slightly lower leverage or better rate locks.
- Secure ironclad tenant estoppels to guarantee yield stability.`;
      
      return `The asset already clears institutional thresholds. No verdict upgrade is required. Current approval quality depends on:
- Maintaining DSCR cushion and protecting entry basis discipline.
- Confirming lease and market assumptions during diligence.
- Validating downside vacancy resilience before closing.`;
    })(),

    memo: `1. DECISION SUMMARY
Acquisition of ${propertyName} presents a ${verdict.toUpperCase()} opportunity at a ${m.price ? m.price : 'market'} basis. The deal is motivated by its modeled return profile against the current capital stack.

2. RECOMMENDATION
${verdict.toUpperCase()} - A **${verdict.toUpperCase()}** position is mathematically optimal to protect downside while preserving basis integrity.

3. KEY METRICS
- Asset Yield (Cap Rate):     ${m.capRate}
- Debt Service Coverage:      ${m.dscr}x
- Levered Cash Return:        ${m.cashOnCash || 'N/A'}
- Leverage (LTV):             ${m.ltv || 'N/A'}
- Break-Even Occupancy:       N/A
- Free Cash Flow:             N/A

4. MAJOR RISK FACTORS
${risks?.length ? risks.map(r => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.message || r.explanation}`).join('\\n') : 'No material risks flagged.'}

5. DILIGENCE / APPROVAL CONDITIONS
${verdict.includes('Proceed') ? '1. Final verification of rent roll accuracy and tenant estoppel certificates.\\n2. Locked financing at an interest rate not exceeding institutional benchmarks.' : '1. Renegotiate pricing or capital stack to achieve institutional yield thresholds.\\n2. Resolve primary risk concentration prior to any capital commitment.'}

6. CONCLUSION
Final execution depends on resolving identified risks and locking institutional financing within underwritten parameters. Immediate proceeding is advised only upon satisfactory technical diligence.`,

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
${sentence('3. ', m.cashOnCash, `Yield profile of **{val}** does not meet the risk-adjusted target return.`)}`,

    target: (() => {
      const target = calcTargetEntryBasis(inputs, metrics);
      if (!target.viable) {
        return `The deterministic model indicates this deal is structurally unviable, yielding negative or fundamentally broken NOI at its core. Price reduction alone cannot solve the intrinsic revenue deficit.`;
      }
      return `To hit institutional minimums (1.25 DSCR and 8.0% Cash-on-Cash), the deterministic engine calculates a target entry price of **$${target.targetPrice.toLocaleString()}**, which is **${target.gapPercent.toFixed(1)}% below** the current asking price. The binding mathematical constraint is **${target.bindingConstraint}**. Focus negotiations entirely on this basis, and evaluate if substantial debt restructuring is also required.`;
    })(),

    compare: (() => {
      try {
        if (!payloadStr) return templates.initial;
        const otherContext = JSON.parse(payloadStr);
        const thisScore = context.result.score;
        const otherScore = otherContext.result.score;
        const winner = thisScore >= otherScore ? context.inputs.propertyName : otherContext.inputs.propertyName;
        const weaker = thisScore >= otherScore ? otherContext.inputs.propertyName : context.inputs.propertyName;
        const strongerMetrics = thisScore >= otherScore ? 'superior coverage ratios and stronger levered return profile' : 'tighter downside cushion and superior risk-adjusted basis';
        
        return `**${winner}** is the strongest relative investment case due to its ${strongerMetrics}. 

**${weaker}** remains viable but exhibits tighter constraints against institutional yield and leverage thresholds under comparative stress. Attention should prioritize diligence on **${winner}**'s core return drivers rather than chasing yield on the weaker asset.`;
      } catch (e) {
        return `Comparative analysis temporarily unavailable.`;
      }
    })()
  };

  return templates[action] || templates.initial;
}
