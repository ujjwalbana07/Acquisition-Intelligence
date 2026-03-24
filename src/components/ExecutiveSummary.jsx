import { useState } from 'react';
import { Copy, Check, FileText, Target, AlertOctagon, TrendingUp, Building2 } from 'lucide-react';
import { formatCurrency, formatPercent, formatMultiple, getSeverityStyle, getRecommendationStyle } from '../utils/formatters';

export default function ExecutiveSummary({ inputs, metrics, result, risks, nextSteps, llmMemo }) {
  const [copied, setCopied] = useState(false);

  if (!result || !metrics || !inputs) return (
    <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-800 rounded-2xl">
      Awaiting Underwriting Execution...
    </div>
  );

  const { propertyName, propertyType, location, askingPrice, renovationCost } = inputs;
  const { dscr, capRate, cashOnCash, ltv, expenseRatio } = metrics;
  const { recommendation, score, rationale } = result;

  const dateStr = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  const totalCapital = askingPrice + (renovationCost || 0);

  // Build the plain text for the clipboard
  const risksText = risks?.length ? risks.map(r => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.message || r.explanation}`).join('\n') : 'No material risks flagged.';
  const stepsText = nextSteps?.length ? nextSteps.map((s, i) => `${i + 1}. ${s.text}`).join('\n') : 'None specified.';

  const memoContent = `INVESTMENT COMMITTEE MEMO
=========================
DATE:         ${dateStr}
SUBJECT:      Acquisition Underwriting — ${propertyName || 'Subject Property'}
ASSET CLASS:  ${propertyType} | ${location || 'Undisclosed Market'}
SPONSOR:      CR Equity AI Underwriting Desk
-------------------------

1. DECISION SUMMARY
Acquisition of ${propertyName} presents a ${recommendation.toUpperCase()} opportunity at a ${formatCurrency(askingPrice)} basis. The deal is motivated by its modeled return profile against the current capital stack.

2. RECOMMENDATION
${recommendation.toUpperCase()} - ${rationale}

3. KEY METRICS
- Asset Yield (Cap Rate):     ${formatPercent(capRate)}
- Debt Service Coverage:      ${formatMultiple(dscr)}x
- Levered Cash Return:        ${formatPercent(cashOnCash)}
- Leverage (LTV):             ${formatPercent(ltv)}
- Break-Even Occupancy:       N/A
- Free Cash Flow:             N/A

4. MAJOR RISK FACTORS
${risksText}

5. DILIGENCE / APPROVAL CONDITIONS
${stepsText}

6. CONCLUSION
Final execution depends on resolving identified risks and locking institutional financing within underwritten parameters. Immediate proceeding is advised only upon satisfactory technical diligence.`;

  const finalDisplayMemo = llmMemo || memoContent;

  const handleCopy = () => {
    navigator.clipboard.writeText(finalDisplayMemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const recStyle = getRecommendationStyle(recommendation);

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* Header Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/50 shadow-inner">
            <FileText size={24} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight">Investment Committee Memo</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-semibold">{dateStr}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-sky-400/80 font-bold uppercase tracking-wider">{propertyName || 'Subject Property'}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest rounded-xl border border-sky-500/20 transition-all shadow-sm shrink-0 group relative z-10"
        >
          {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="group-hover:scale-110 transition-transform" />}
          {copied ? <span className="text-emerald-400">Copied</span> : 'Copy Memo'}
        </button>
      </div>

      {/* Official Memo Body (Full Text View) */}
      <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-700/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText size={14} className="text-sky-400" /> Formatted Memo Body
          </h3>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/50 px-2 py-1 rounded">Institutional Text Pattern</span>
        </div>
        <div className="p-8 bg-black/10">
          <pre className="text-sm font-medium text-slate-300 whitespace-pre-wrap font-sans leading-relaxed selection:bg-sky-500/40 cursor-text">
            {finalDisplayMemo}
          </pre>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Overview */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
            <Building2 size={14} className="text-slate-500" /> Transaction Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Asset Class</span>
              <span className="text-sm font-medium text-slate-200">{propertyType}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Location</span>
              <span className="text-sm font-medium text-slate-200">{location || 'Undisclosed'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Purchase Price</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatCurrency(askingPrice)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Required CapEx</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatCurrency(renovationCost || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-sky-400/70 uppercase tracking-wider font-bold">Total Capital</span>
              <span className="text-base font-mono font-black text-sky-400">{formatCurrency(totalCapital)}</span>
            </div>
          </div>
        </div>

        {/* Underwriting Metrics */}
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
            <TrendingUp size={14} className="text-slate-500" /> Underwriting Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Entry Yield</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatPercent(capRate)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Levered ROI</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatPercent(cashOnCash)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Debt Coverage (DSCR)</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatMultiple(dscr)}x</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Leverage (LTV)</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatPercent(ltv)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">EXPENSE RATIO</span>
              <span className="text-sm font-mono font-bold text-slate-200">{formatPercent(expenseRatio)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* IC Verdict */}
      <div className={`rounded-2xl p-6 border ${recStyle.bg} ${recStyle.border} shadow-lg relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="flex-1">
            <h3 className={`text-xs font-bold ${recStyle.text} uppercase tracking-[0.2em] mb-3 flex items-center gap-2`}>
              <Target size={14} /> IC Verdict & Scoring
            </h3>
            <div className="flex items-baseline gap-3 mb-4">
              <h4 className={`text-2xl font-black uppercase tracking-tight ${recStyle.text}`}>{recommendation}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-mono font-bold text-slate-200">{score}</span>
                <span className="text-xs text-slate-500 font-bold">/100</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-slate-800/50">
              {rationale}
            </p>
          </div>
        </div>
      </div>

      {/* Risks & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
            <AlertOctagon size={14} className="text-slate-500" /> Risk Summary
          </h3>
          <div className="space-y-4">
            {risks && risks.length > 0 ? risks.map((risk, idx) => {
              const style = getSeverityStyle(risk.severity);
              return (
                <div key={idx} className={`p-4 rounded-lg bg-slate-900/40 border-l-[3px] border border-slate-800 ${style.border}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-black/40 ${style.color}`}>
                      {risk.severity}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">{risk.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{risk.message || risk.explanation}</p>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-500 italic">No material risks identified for this case.</p>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
            <Check size={14} className="text-slate-500" /> Next Steps
          </h3>
          <div className="space-y-3">
            {nextSteps && nextSteps.length > 0 ? nextSteps.map((step, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400">{idx + 1}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pt-0.5">{step.text}</p>
              </div>
            )) : (
              <p className="text-xs text-slate-500 italic">No specific next steps required.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
