import { getFallbackNarrative } from './fallbackNarrative';

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
      narrative: getFallbackNarrative(context, action),
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
  const instruction = "Explain precisely what specific numerical changes would be required to move the current verdict to the next higher grade (e.g. Renegotiate -> Proceed with Caution). Focus on purchase price or leverage targets.";
  return callCopilotProxy(context, instruction, 'shifting');
}

export async function fetchInvestmentMemo(context) {
  const instruction = "Generate a professional, concise 3-paragraph Investment Committee Memo summary for this deal. Focus on Thesis, Risks, and Execution plan based on the data.";
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
  return callCopilotProxy(context, instruction, 'initial', JSON.stringify(otherContext));
}

export async function fetchCustomPrompt(context, customPrompt) {
  const instruction = `Address this specific underwriting inquiry: "${customPrompt}"`;
  return callCopilotProxy(context, instruction, 'initial', customPrompt);
}
