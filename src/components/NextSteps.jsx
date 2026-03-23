import { CheckCircle2, Shield, Search, TrendingDown, Hammer, AlertTriangle, Tag, Percent, Calculator, XCircle, TrendingUp, Users, Briefcase, BarChart2 } from 'lucide-react';

const IconMap = {
  CheckCircle2: <CheckCircle2 size={16} className="text-sky-400" />,
  Shield: <Shield size={16} className="text-sky-400" />,
  Search: <Search size={16} className="text-sky-400" />,
  TrendingDown: <TrendingDown size={16} className="text-sky-400" />,
  Hammer: <Hammer size={16} className="text-sky-400" />,
  AlertTriangle: <AlertTriangle size={16} className="text-sky-400" />,
  Tag: <Tag size={16} className="text-sky-400" />,
  Percent: <Percent size={16} className="text-sky-400" />,
  Calculator: <Calculator size={16} className="text-sky-400" />,
  XCircle: <XCircle size={16} className="text-sky-400" />,
  TrendingUp: <TrendingUp size={16} className="text-sky-400" />,
  Users: <Users size={16} className="text-sky-400" />,
  Briefcase: <Briefcase size={16} className="text-sky-400" />,
  BarChart2: <BarChart2 size={16} className="text-sky-400" />,
};

export default function NextSteps({ steps }) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
        <div className="p-2 bg-slate-800 rounded-lg shadow-inner">
          <Briefcase size={20} className="text-slate-300" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-slate-200 tracking-[0.1em] uppercase">Diligence Priorities & Next Steps</h3>
          <p className="text-[11px] text-slate-500 font-medium">Recommended actions based on synthesis engine</p>
        </div>
      </div>

      <div className="grid gap-3">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="group flex items-center gap-4 bg-slate-900/40 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 transition-all duration-200"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700/50 flex items-center justify-center group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-inner">
              {IconMap[step.icon] || <CheckCircle2 size={16} className="text-sky-400" />}
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {step.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
