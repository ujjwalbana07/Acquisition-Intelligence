import React from 'react';
import { ShieldCheck, Target, AlertTriangle, FileText, TrendingDown, ClipboardCheck } from 'lucide-react';
import { formatCurrency, formatPercent, formatMultiple } from '../utils/formatters';

export default function BriefReport({ context, reportRef }) {
  if (!context || !context.result) return null;

  const { inputs, metrics, result, risks } = context;
  const timestamp = new Date().toLocaleString();

  return (
    <div 
      ref={reportRef}
      className="bg-white text-slate-900 p-12 max-w-[800px] mx-auto font-sans"
      style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px' }}
    >
      {/* 1. Header & Branding */}
      <div className="border-b-4 border-sky-600 pb-6 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-sky-700 mb-1">CR EQUITY AI</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Acquisition Intelligence Brief</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Export Timestamp</p>
          <p className="text-[11px] font-medium text-slate-600">{timestamp}</p>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">{inputs.propertyName}</h2>
        <div className="flex gap-4 items-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{inputs.propertyType}</p>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{inputs.location}</p>
        </div>
      </div>

      {/* 2. Executive Recommendation */}
      <div className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-8 bg-sky-50 border border-sky-100 rounded-2xl p-6">
          <h3 className="text-[11px] font-black text-sky-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Target size={14} /> Executive Recommendation
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest text-white ${
              result.recommendation.includes('Proceed') ? 'bg-emerald-600' : 
              result.recommendation === 'Renegotiate' ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              {result.recommendation}
            </span>
            <div className="h-6 w-[1px] bg-sky-200" />
            <p className="text-2xl font-black text-slate-900">Score: {result.score}/100</p>
          </div>
          <p className="text-sm leading-relaxed text-slate-700 italic border-l-4 border-sky-200 pl-4 py-2">
            "The deterministic core algorithm has flagged this deal as a **{result.recommendation}** grade based on risk-adjusted threshold alignment and holistic yield metrics."
          </p>
        </div>
        
        <div className="col-span-4 flex flex-col justify-center items-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
          <ShieldCheck size={40} className="text-emerald-500 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analysis Integrity</p>
          <p className="text-[11px] font-bold text-emerald-600">Deterministic Secured</p>
        </div>
      </div>

      {/* 3. Financial Metrics Grid */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 border-b border-slate-100 pb-2">Key Financial Underwriting</h3>
        <div className="grid grid-cols-4 gap-y-8 gap-x-4">
          <MetricCell label="Acquisition Basis" value={formatCurrency(inputs.askingPrice)} />
          <MetricCell label="Going-in Cap Rate" value={formatPercent(metrics.capRate)} />
          <MetricCell label="Debt Coverage (DSCR)" value={formatMultiple(metrics.dscr)} />
          <MetricCell label="Cash-on-Cash Return" value={formatPercent(metrics.cashOnCashReturn)} />
          <MetricCell label="Loan-to-Value (LTV)" value={formatPercent(metrics.ltv, 1)} />
          <MetricCell label="Annual NOI" value={formatCurrency(metrics.noi)} />
          <MetricCell label="Free Cash Flow (FCF)" value={formatCurrency(metrics.annualCashFlow)} />
          <MetricCell label="Break-Even Occupancy" value={formatPercent(metrics.breakEvenOccupancy, 1)} />
        </div>
      </div>

      {/* 4. Risk Signals */}
      <div className="mb-10">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 border-b border-slate-100 pb-2">Material Underwriting Risks</h3>
        <div className="space-y-4">
          {risks.slice(0, 5).map((risk, idx) => (
            <div key={idx} className="flex gap-4 pb-4 border-b border-slate-50 last:border-0">
              <div className={`mt-1 p-1 rounded ${
                risk.severity === 'critical' ? 'text-rose-600 bg-rose-50' : 
                risk.severity === 'high' ? 'text-amber-600 bg-amber-50' : 'text-sky-600 bg-sky-50'
              }`}>
                <AlertTriangle size={16} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{risk.title}</h4>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    risk.severity === 'critical' ? 'bg-rose-100 text-rose-700' : 
                    risk.severity === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-[12px] text-slate-600 leading-snug">{risk.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-slate-100 text-center">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Confidential Investment Memo — Generated by CR EQUITY AI</p>
      </div>
    </div>
  );
}

function MetricCell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900">{value || '---'}</p>
    </div>
  );
}
