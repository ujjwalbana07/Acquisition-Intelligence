import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { getSeverityStyle } from '../utils/formatters';

const SeverityIcon = ({ severity }) => {
  const icons = {
    critical: <AlertOctagon size={18} className="text-rose-400" />,
    high: <AlertTriangle size={18} className="text-amber-400" />,
    medium: <Info size={18} className="text-orange-400" />,
    low: <Info size={18} className="text-sky-400" />,
  };
  return icons[severity] || <Info size={18} />;
};

export default function RiskFlags({ risks }) {
  if (!risks) return null;

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/50">
        <div className="p-2 bg-slate-800 rounded-lg shadow-inner">
          <AlertOctagon size={20} className="text-slate-300" />
        </div>
        <div>
          <h3 className="text-[13px] font-bold text-slate-200 tracking-[0.1em] uppercase">Underwriting Risk Signals</h3>
          <p className="text-[11px] text-slate-500 font-medium">Auto-detected structural & operational vulnerabilities</p>
        </div>
      </div>

      {risks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
          <CheckCircle2 size={36} className="text-emerald-500/50 mb-3" />
          <p className="text-sm font-semibold text-emerald-400">No Material Risks Detected</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Current assumptions model a highly stabilized asset. Proceed with standard diligence protocols.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((risk, idx) => {
            const style = getSeverityStyle(risk.severity);
            return (
              <div 
                key={idx} 
                className={`relative overflow-hidden pl-4 pr-5 py-4 rounded-xl border-l-[3px] bg-slate-900/40 border-r border-y border-r-slate-800 border-y-slate-800 hover:bg-slate-800/60 transition-colors ${style.border}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 shrink-0 opacity-80 bg-slate-800 p-1.5 rounded-md">
                    <SeverityIcon severity={risk.severity} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm text-slate-200 tracking-wide">{risk.title}</h4>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-700/50 ${style.color} bg-slate-900`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      {risk.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
