import { getRecommendationStyle } from '../utils/formatters';
import { Target, TrendingDown, Minus, CheckCircle2, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';

const RecommendationIcon = ({ recommendation }) => {
  const icons = {
    'Proceed': <CheckCircle2 className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" size={36} strokeWidth={1.5} />,
    'Proceed with Caution': <AlertTriangle className="text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={36} strokeWidth={1.5} />,
    'Renegotiate': <RefreshCcw className="text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" size={36} strokeWidth={1.5} />,
    'Reject': <XCircle className="text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]" size={36} strokeWidth={1.5} />,
  };
  return icons[recommendation] || null;
};

function ScoreBar({ label, score }) {
  const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : score >= 30 ? 'bg-orange-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-4 group">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest w-24 text-right shrink-0 group-hover:text-slate-300 transition-colors">
        {label}
      </span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden relative">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${color} shadow-[0_0_10px_rgba(currentColor,0.5)]`}
          style={{ width: `${score}%`, backgroundColor: 'currentColor' }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-slate-400 w-8 shrink-0">{score}</span>
    </div>
  );
}

export default function RecommendationPanel({ result }) {
  if (!result) return null;

  const { recommendation, score, scores, shortRationale } = result;
  const style = getRecommendationStyle(recommendation);

  const scoreLabels = {
    dscr: 'Coverage (DSCR)',
    capRate: 'Asset Yield',
    cashOnCash: 'Levered Cash',
    ltv: 'Capital Stack',
    expenseRatio: 'OpEx Efficiency',
    vacancy: 'Econ. Vacancy',
    renovation: 'CapEx Load',
  };

  return (
    <div className={`rounded-2xl p-6 md:p-8 border ${style.bg} ${style.border} shadow-2xl relative overflow-hidden animate-fade-in-up`}>
      {/* Subtle background glow */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-30 ${style.bg.replace('/10', '')} pointer-events-none mix-blend-screen`} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8 relative z-10">
        <div className={`w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border ${style.border} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <RecommendationIcon recommendation={recommendation} />
        </div>
        <div className="flex-1 mt-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
            <Target size={12} className={style.text} />
            Institutional Underwriting Verdict
          </p>
          <h2 className={`text-3xl font-extrabold tracking-tight ${style.text} drop-shadow-sm`}>
            {recommendation}
          </h2>
        </div>
        <div className="text-left md:text-right mt-2 md:mt-0">
          <div className="flex items-baseline md:justify-end gap-1">
            <div className={`text-4xl font-bold font-mono tracking-tighter ${style.text} drop-shadow-md`}>{score}</div>
            <div className="text-sm font-bold text-slate-500 uppercase">/100</div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5 md:justify-end">
            <span className={`w-1.5 h-1.5 rounded-full ${style.badge} animate-pulse`} />
            Holistic Deal Score
          </div>
        </div>
      </div>

      {/* Rationale Terminal */}
      <div className="rounded-xl p-5 mb-8 bg-black/40 border border-slate-700/50 backdrop-blur-sm relative z-10">
        <p className="text-sm text-slate-300 font-medium leading-relaxed">
          {shortRationale}
        </p>
      </div>

      {/* Score Bars Grid */}
      <div className="relative z-10">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-5 pb-3 border-b border-slate-700/50">
          Dimensional Scoring Matrix
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          {Object.entries(scores).map(([key, val]) => (
            <ScoreBar key={key} label={scoreLabels[key]} score={val} />
          ))}
        </div>
      </div>
    </div>
  );
}
