import { getFallbackNarrative } from './fallbackNarrative';
import { calcTargetEntryBasis } from './calculations';

// Standardized fetch wrapper for the secure backend proxy
async function callCopilotProxy(context, instruction, action, customPrompt = null) {
  try {
    const response = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, instruction, customPrompt })
    });

    if (!response.ok) {
      throw new Error('API Unavailable');
    }

    return await response.json();
  } catch (error) {
    // Silent fallback to premium deterministic logic
    return {
      narrative: getFallbackNarrative(context, action, customPrompt),
      smartPrompts: ["Explain Recommendation", "Identify Key Risks"],
      confidence: "Deterministic Alignment"
    };
  }
}

// ==== Exported Agent Actions ====

export async function fetchInitialInsights(context) {
  const instruction = "Generate a concise, 3-sentence CFO-level initial reaction to this underwriting profile. Interpret the overall health of the deal.";
  return callCopilotProxy(context, instruction, 'initial');
}

export async function fetchRecommendationExplanation(context) {
  const instruction = "Explain exactly why the current recommendation verdict was reached. Summarize the strongest positive drivers, the biggest weaknesses, any failed thresholds, and clearly justify why the final verdict is appropriate. Use bullet points.";
  return callCopilotProxy(context, instruction, 'explain');
}

export async function fetchImprovements(context) {
  const instruction = "Propose concrete financial or structural changes that could objectively improve the verdict of this deal. Focus strictly on actual weak metrics (e.g. price reduction, leverage optimization).";
  return callCopilotProxy(context, instruction, 'improve');
}

export async function fetchDownsideScenario(context) {
  const instruction = "Simulate a severe downside stress-test scenario. Assume revenue drops 10%, vacancy doubles, exit caps expand. Summarize deterioration of DSCR/Cash Return and downside resilience.";
  return callCopilotProxy(context, instruction, 'downside');
}

export async function fetchKeyRisks(context) {
  const instruction = "Specifically identify and summarize the 3-5 most critical material underwriting risks for this deal. Focus on institutional severity and fundamental exposure.";
  return callCopilotProxy(context, instruction, 'risks');
}

export async function fetchVerdictShifting(context) {
  const v = context.result.recommendation.toLowerCase();
  let instruction = "";

  if (v === 'reject') {
    instruction = "Explain precisely what specific numerical changes (e.g., lower purchase price, higher revenue, lower leverage) would be required to move this Reject verdict up to Renegotiate or optionally Proceed with Caution. Focus on concrete targets.";
  } else if (v === 'renegotiate') {
    instruction = "Explain precisely what specific numerical changes would be required to move this Renegotiate verdict up to Proceed with Caution, or optionally Proceed. Focus on purchase price or leverage targets.";
  } else if (v === 'proceed with caution') {
    instruction = "Explain precisely what specific numerical changes would be required to move this Proceed with Caution verdict up to a full Proceed. Focus on risk mitigation and yield expansion.";
  } else {
    instruction = "The asset already clears institutional thresholds with a Proceed verdict. Do NOT talk about upgrading the verdict. Instead, concisely explain what conditions support maintaining this Proceed verdict, what risks could weaken it, and what must be validated in diligence to preserve approval confidence.";
  }

  return callCopilotProxy(context, instruction, 'shifting');
}

export async function fetchInvestmentMemo(context) {
  const instruction = `You are a senior real estate CFO and investment committee advisor. Write with institutional credibility, precision, and brevity. Always stay consistent with the provided deterministic underwriting outputs. Do not invent metrics or contradict the recommendation. Write like an investment committee memo, not a chatbot.

Generate a concise but professional investment committee memo for the active deal (${context.inputs.propertyName}) containing exactly these 6 sections:
1. Decision Summary (One short paragraph summarizing the opportunity and your overall posture)
2. Recommendation (${context.result.recommendation} - accompanied by a short rationale)
3. Key Metrics (Explicitly reference the underwritten Asset Yield, DSCR, Levered Cash Return, LTV, Break-Even Occupancy, and Free Cash Flow)
4. Major Risk Factors (Summarize the identified structural, operating, or market risks)
5. Diligence / Approval Conditions (State what must be validated before advancing or closing)
6. Conclusion (A short institutional closing view suitable for the committee)

Make the entire brief easy to read in under a minute. No generic AI fluff.`;
  return callCopilotProxy(context, instruction, 'memo');
}

export async function fetchDiligenceQA(context) {
  const instruction = "Generate 4-5 high-priority technical diligence questions for this specific deal (e.g. lease audit, capex verification, debt covenants) based on identified risks.";
  return callCopilotProxy(context, instruction, 'qa');
}

export async function fetchConditions(context) {
  const instruction = "For Proceed or Proceed with Caution deals, generate specific institutional approval conditions. For Renegotiate or Reject deals, generate rejection rationale or required change conditions.";
  return callCopilotProxy(context, instruction, 'conditions');
}

export async function fetchComparison(context, otherContext) {
  const instruction = `Compare the current investment case (${context.inputs.propertyName}) against the provided comparative case (${otherContext.inputs.propertyName}). Summarize key differences in yield, coverage, downside resilience, and recommendation quality. Use a structured comparison format.`;
  // We pass the otherContext in the customPrompt field for simplicity in the proxy payload
  return callCopilotProxy(context, instruction, 'compare', JSON.stringify(otherContext));
}

export async function fetchCustomPrompt(context, customPrompt) {
  const instruction = `Address this specific underwriting inquiry: "${customPrompt}"`;
  return callCopilotProxy(context, instruction, 'initial', customPrompt);
}

export async function fetchTargetEntryBasis(context) {
  const target = calcTargetEntryBasis(context.inputs, context.metrics);
  if (!target.viable) {
    const instruction = "Analyze the negotiation position. The deterministic model indicates this deal is structurally unviable and cannot be fixed simply by lowering the purchase price (NOI is negative or fundamentally broken). Explain this to the IC.";
    return callCopilotProxy(context, instruction, 'target');
  }
  
  const instruction = `Calculate the Negotiation Price to hit institutional minimums (1.25 DSCR and 8% Cash-on-Cash). The deterministic engine calculated a target entry price of $${target.targetPrice.toLocaleString()} (${target.gapPercent.toFixed(1)}% below the current asking price). The binding constraint is ${target.bindingConstraint}. Generate a concise, highly actionable CFO-level summary of these findings, and advise if price alone solves the issue or if leverage structure must also change.`;
  return callCopilotProxy(context, instruction, 'target');
}
