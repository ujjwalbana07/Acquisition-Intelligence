import { useState } from 'react';
import { Copy, CheckCircle2, FileText } from 'lucide-react';

export default function DashboardExecutiveSummary({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result || !result.rationale) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.rationale)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error("Failed to copy text: ", err));
  };

  return (
    <div className="exec-summary-card glass-card rounded-xl p-5 border border-sky-500/20 bg-gradient-to-br from-slate-900/80 to-[#020617] animate-fade-in-up shadow-[0_0_30px_rgba(14,165,233,0.05)] relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
            <FileText size={16} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">CFO Executive Summary</h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Automated Investment Committee Memo</p>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-[10px] font-bold tracking-widest uppercase text-slate-400 hover:text-sky-400 transition-all group"
          title="Copy Executive Summary to Clipboard"
        >
          {copied ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} className="group-hover:scale-110 transition-transform" />}
          {copied ? <span className="text-emerald-400">Copied</span> : 'Copy'}
        </button>
      </div>

      <div className="relative z-10">
        <p className="text-sm text-slate-300 leading-relaxed font-medium">
          {result.rationale}
        </p>
      </div>
    </div>
  );
}
