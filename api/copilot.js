import Anthropic from '@anthropic-ai/sdk';

// This is a Vercel-style serverless function (Node.js)
// It will be proxied by Vite during local development
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { context, instruction, customPrompt } = req.body;

  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL || "claude-3-5-sonnet-20240620";

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'LLM_API_KEY not configured on server',
      fallback: true 
    });
  }

  const anthropic = new Anthropic({ apiKey });

  const SYSTEM_PROMPT = `You are a senior real estate CFO and acquisition advisor. 
You reason with institutional credibility, precision, brevity, and financial discipline. 
Always reference the actual numbers from the provided context when relevant. 
Avoid generic statements. Write like an investment committee advisor, not a chatbot. 
Keep responses concise, highly analytical, and decision-oriented.

You must respond strictly in valid JSON format matching this schema:
{
  "narrative": "Your highly analytical markdown response here. Use bolding for key metrics.",
  "smartPrompts": ["Context-aware suggestion 1", "Context-aware suggestion 2"],
  "confidence": "Base Case | Base + Stress | Deterministic Alignment"
}
Limit smartPrompts to 2-4 items, very concise.`;

  // Pre-process context for comparison if needed
  let comparisonSection = "";
  let finalInstruction = instruction;
  
  if (customPrompt && customPrompt.startsWith('{')) {
    try {
      const otherContext = JSON.parse(customPrompt);
      comparisonSection = `
--- COMPARATIVE DEAL CONTEXT (${otherContext.inputs.propertyName}) ---
Price: $${otherContext.inputs.askingPrice?.toLocaleString()}
Verdict: ${otherContext.result.recommendation}
DSCR: ${otherContext.metrics.dscr.toFixed(2)}x
Cap Rate: ${(otherContext.metrics.capRate * 100).toFixed(2)}%
CoC: ${(otherContext.metrics.cashOnCashReturn * 100).toFixed(2)}%
LTV: ${(otherContext.metrics.ltv * 100).toFixed(1)}%
`;
      finalInstruction = "Perform a side-by-side institutional comparison between the primary and comparative deals. Highlighting yield variance and risk-adjusted superiorities.";
    } catch (e) {
      // Just treat as normal custom prompt
    }
  }

  const userMessage = `
--- PRIMARY DEAL CONTEXT ---
Property: ${context.inputs.propertyName} (${context.inputs.location})
Asset Class: ${context.inputs.propertyType}
Acquisition Price: $${context.inputs.askingPrice?.toLocaleString() || '---'}
Score: ${context.result.score}/100 | Verdict: ${context.result.recommendation}

[CORE METRICS]
NOI: $${context.metrics.noi?.toLocaleString() || '---'}
Cap Rate: ${(context.metrics.capRate * 100).toFixed(2)}%
DSCR: ${context.metrics.dscr?.toFixed(2) || '---'}x
Cash-on-Cash: ${(context.metrics.cashOnCashReturn * 100).toFixed(2)}%
LTV: ${(context.metrics.ltv * 100).toFixed(1)}%
Free Cash Flow (Annual): $${context.metrics.annualCashFlow?.toLocaleString() || '---'}
Break-Even Occupancy: ${(context.metrics.breakEvenOccupancy * 100).toFixed(1)}%

[RISKS]
${context.risks?.map(r => `- ${r.severity}: ${r.title}`).join('\n') || 'No major risks identified.'}

${comparisonSection}

[INSTRUCTION]: ${finalInstruction}
${!comparisonSection && customPrompt ? `[USER INQUIRY]: ${customPrompt}` : ''}
`;

  try {
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.2,
    });

    const text = response.content[0].text;
    const jsonStr = text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    res.status(200).json(parsed);
  } catch (error) {
    console.error('LLM Proxy Error:', error);
    res.status(500).json({ error: 'LLM synthesis failed', details: error.message });
  }
}
