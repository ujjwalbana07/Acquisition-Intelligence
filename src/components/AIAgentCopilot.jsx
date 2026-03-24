import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Sparkles, AlertTriangle, ArrowRight, TrendingDown, Target, HelpCircle, FileText, Search, Zap, ShieldCheck, Layers, ClipboardCheck, Scale } from 'lucide-react';
import { 
  fetchInitialInsights, 
  fetchRecommendationExplanation, 
  fetchImprovements, 
  fetchDownsideScenario,
  fetchKeyRisks,
  fetchVerdictShifting,
  fetchInvestmentMemo,
  fetchDiligenceQA,
  fetchConditions,
  fetchComparison,
  fetchCustomPrompt,
  fetchTargetEntryBasis
} from '../utils/aiService';
import { SCENARIOS } from '../data/scenarios';
import { runAllCalculations } from '../utils/calculations';
import { generateRecommendation } from '../utils/recommendation';
import { analyzeRisks } from '../utils/riskEngine';

export default function AIAgentCopilot({ context, onMemoGenerated }) {
  const [loading, setLoading] = useState(true);
  const [activeAction, setActiveAction] = useState('insights');
  const [narrative, setNarrative] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [confidence, setConfidence] = useState('Deterministic Alignment');
  const [compareId, setCompareId] = useState('');

  // Auto-fetch insights when context substantially changes
  useEffect(() => {
    if (!context || !context.result) return;
    
    // IMMEDIATELY reset state on case switch to prevent stale rendering
    setNarrative('');
    setPrompts([]);
    setCompareId('');
    setLoading(true);
    setActiveAction('insights');
    
    let isMounted = true;
    const currentContextId = context.id;

    const loadInitial = async () => {
      const data = await fetchInitialInsights(context);
      if (isMounted && context.id === currentContextId) {
        setNarrative(data.narrative);
        setPrompts(data.smartPrompts);
        setConfidence(data.confidence || 'Deterministic Alignment');
        setLoading(false);
      }
    };
    
    loadInitial();
    
    return () => { isMounted = false; };
  }, [context?.id, context?.inputs?.propertyName]);

  const handleAction = async (actionId, fetchFunction, param = null) => {
    const currentContextId = context.id;
    setLoading(true);
    setNarrative(''); // Clear previous text even for actions
    setActiveAction(actionId);
    
    let data;
    if (actionId === 'custom') {
      data = await fetchCustomPrompt(context, param);
    } else if (actionId === 'compare' && param) {
      data = await fetchComparison(context, param);
    } else {
      data = await fetchFunction(context);
    }
      
    if (data && context.id === currentContextId) {
      // Render payload
      setNarrative(data.narrative || "No insight available.");
      setPrompts(data.smartPrompts || []);
      setConfidence(data.confidence || "Deterministic Alignment");

      // Sync memo globally if this is the memo generation action
      if (actionId === 'memo' && onMemoGenerated && data.narrative) {
        onMemoGenerated(data.narrative);
      }
      setLoading(false);
    }
  };

  const handleCompareSelect = (e) => {
    const selectedId = e.target.value;
    setCompareId(selectedId);
    if (!selectedId) return;

    // Build the other context
    const otherScenario = SCENARIOS.find(s => s.id === selectedId);
    if (!otherScenario) return;

    const otherMetrics = runAllCalculations(otherScenario.inputs);
    const otherRisks = analyzeRisks(otherMetrics, otherScenario.inputs);
    const otherResult = generateRecommendation(otherMetrics, otherScenario.inputs, otherRisks);
    
    const otherContext = {
      inputs: otherScenario.inputs,
      metrics: otherMetrics,
      risks: otherRisks,
      result: otherResult
    };

    handleAction('compare', fetchComparison, otherContext);
  };

  if (!context || !context.result) return null;

  const formatNarrative = (text) => {
    if (!text) return null;
    const elements = [];
    text.split('\n').forEach((line, i) => {
      if (line.trim() === '') return;
      let formattedLine = line.trim();
      
      // Check for headers like **SECTION**
      const isHeader = formattedLine.startsWith('**') && formattedLine.endsWith('**') && !formattedLine.includes(':');
      
      const parts = formattedLine.split(/\*\*(.*?)\*\*/g);
      
      if (formattedLine.startsWith('- ') || formattedLine.startsWith('* ')) {
        elements.push(
          <li key={i} className="mb-2 text-[13px] leading-relaxed flex items-start">
            <span className="text-sky-500 mr-2 font-bold mt-0.5">•</span>
            <span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-slate-200 font-bold">{p}</strong> : p)}</span>
          </li>
        );
      } else if (isHeader) {
        elements.push(
          <h3 key={i} className="text-[11px] font-black text-sky-400 uppercase tracking-widest mt-4 mb-2 border-l-2 border-sky-500/50 pl-2">
            {parts.map((p, j) => j % 2 === 1 ? p : p)}
          </h3>
        );
      } else {
        elements.push(
          <p key={i} className="mb-3 text-[13px] leading-relaxed">
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-slate-100 font-bold">{p}</strong> : p)}
          </p>
        );
      }
    });
    return elements[0]?.type === 'li' ? <ul className="pl-1 mt-2">{elements}</ul> : elements;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-sky-500/30 mb-8 shadow-[0_0_50px_rgba(14,165,233,0.08)]">
      
      {/* Copilot Header */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 border border-sky-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.2)]">
            <Bot size={22} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-2">
              IC ADVISORY COPILOT
              <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-widest font-black bg-sky-500/10 text-sky-400 border border-sky-500/20">Institutional Grade</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Claude 3.5 Sonnet IC Engine</p>
              <div className="h-3 w-[1px] bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{confidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Comparison Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/40 border border-slate-800/80 rounded-lg px-3 py-1.5 min-w-[200px]">
          <Scale size={14} className="text-slate-500" />
          <select 
            value={compareId}
            onChange={handleCompareSelect}
            className="bg-transparent text-[11px] font-bold text-slate-300 outline-none w-full cursor-pointer"
          >
            <option value="">Compare Case...</option>
            {SCENARIOS.filter(s => s.id !== context.id).map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Copilot Body */}
      <div className="p-6 bg-[#020617]/50 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 min-h-[220px]">
          
          {/* Output Display */}
          <div className="md:col-span-12 lg:col-span-8 flex flex-col justify-between">
            {loading ? (
              <div className="h-full min-h-[160px] flex items-center justify-center text-slate-400 flex-col py-10">
                <div className="relative mb-6">
                   <Bot size={32} className="text-sky-500 animate-pulse relative z-10" />
                   <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-xl animate-ping" />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-sky-400/80">Copilot is synthesizing narrative...</p>
                <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-600 to-indigo-600 w-1/2 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeAction === 'compare' && compareId && (
                  <div className="mb-5 bg-slate-900/60 border border-slate-700/50 rounded-lg p-3.5 flex items-center justify-between text-xs shadow-inner">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Primary Case</span>
                      <strong className="text-sky-400 font-bold">{context.inputs.propertyName}</strong>
                    </div>
                    <div className="flex items-center justify-center bg-slate-800 rounded-full w-8 h-8 mx-2 shrink-0 border border-slate-700">
                      <Scale size={14} className="text-slate-400" />
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[9px] uppercase tracking-widest font-black text-slate-500">Comparison Case</span>
                      <strong className="text-slate-200 font-bold">{SCENARIOS.find(s => s.id === compareId)?.inputs?.propertyName}</strong>
                    </div>
                  </div>
                )}
                <div className="flex-1 text-slate-300">
                  {formatNarrative(narrative)}
                </div>
                
                {prompts && prompts.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-800/60">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                       Smart Context Drills
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      {prompts.map((p, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleAction('custom', fetchCustomPrompt, p)}
                          className="px-4 py-2 rounded-xl bg-slate-900/60 hover:bg-sky-900/40 border border-slate-800 hover:border-sky-500/50 text-[11px] font-bold text-sky-100 transition-all flex items-center gap-2 group shadow-sm"
                        >
                          {p}
                          <ArrowRight size={12} className="text-sky-500 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Core IC Toolkit Menu */}
          <div className="md:col-span-12 lg:col-span-4 lg:border-l border-slate-800/80 lg:pl-8 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">IC Analytical Suite</p>
              <div className="w-12 h-0.5 bg-sky-500/20 rounded-full" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              <ActionBtn 
                active={activeAction === 'explain'} 
                icon={<Target size={14} />} 
                title="Explain Recommendation" 
                desc="Deconstruct verdict drivers."
                onClick={() => handleAction('explain', fetchRecommendationExplanation)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'conditions'} 
                icon={<ClipboardCheck size={14} />} 
                color="indigo"
                title="IC Approval/Rej Conditions" 
                desc="Generate closing prerequisites."
                onClick={() => handleAction('conditions', fetchConditions)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'shifting'} 
                icon={<Zap size={14} />} 
                color="sky"
                title="What Changes Verdict?" 
                desc="Bridges between grade levels."
                onClick={() => handleAction('shifting', fetchVerdictShifting)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'target'} 
                icon={<TrendingDown size={14} />} 
                color="emerald"
                title="Target Entry Basis" 
                desc="Negotiation Price Calculator."
                onClick={() => handleAction('target', fetchTargetEntryBasis)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'memo'} 
                icon={<FileText size={14} />} 
                color="indigo"
                title="Generate IC Memo" 
                desc="Institutional 3-para synthesis."
                onClick={() => handleAction('memo', fetchInvestmentMemo)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'qa'} 
                icon={<Search size={14} />} 
                color="emerald"
                title="Diligence Q&A" 
                desc="Risk-targeted tech questions."
                onClick={() => handleAction('qa', fetchDiligenceQA)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'risks'} 
                icon={<AlertTriangle size={14} />} 
                color="rose"
                title="Identify Key Risks" 
                desc="Pinpoint fundamental exposures."
                onClick={() => handleAction('risks', fetchKeyRisks)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'improve'} 
                icon={<TrendingDown size={14} className="rotate-180" />} 
                color="amber"
                title="Optimize Deal Metrics" 
                desc="Identify improvement targets."
                onClick={() => handleAction('improve', fetchImprovements)}
                disabled={loading}
              />

              <ActionBtn 
                active={activeAction === 'downside'} 
                icon={<Layers size={14} />} 
                color="rose"
                title="Run Downside Risk" 
                desc="Stress test vacancy & caps."
                onClick={() => handleAction('downside', fetchDownsideScenario)}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function ActionBtn({ active, icon, title, desc, onClick, disabled, color = 'sky' }) {
  const colorMap = {
    sky: 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-sky-500/5',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-amber-500/5',
    rose: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-rose-500/5',
    indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-indigo-500/5',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/5',
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all text-left group relative overflow-hidden
        ${active ? `${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[2]} shadow-lg` : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {active && <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorMap[color].split(' ')[1].replace('text-', 'bg-')}`} />}
      
      <div className={`p-1.5 rounded-lg mt-0.5 transition-colors ${active ? colorMap[color].split(' ').slice(0,2).join(' ') : 'bg-slate-950/50 text-slate-500 group-hover:text-slate-300'}`}>
        {React.cloneElement(icon, { size: 14 })}
      </div>
      <div>
        <h4 className={`text-[11px] font-black mb-0.5 tracking-tight ${active ? colorMap[color].split(' ')[1] : 'text-slate-300 group-hover:text-white'}`}>{title}</h4>
        <p className={`text-[9px] leading-tight font-medium ${active ? 'text-slate-200' : 'text-slate-500'}`}>{desc}</p>
      </div>
    </button>
  );
}
