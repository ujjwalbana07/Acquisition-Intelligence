import { Info } from 'lucide-react';
import { formatCurrency, formatPercent, formatMultiple } from '../utils/formatters';

function getMetricHealthColor(type, value) {
  if (value === null || value === undefined) return 'slate';
  switch(type) {
    case 'capRate': return value >= 0.055 ? 'emerald' : 'rose';
    case 'cashOnCash': return value >= 0.06 ? 'emerald' : value >= 0 ? 'amber' : 'rose';
    case 'dscr': return value >= 1.25 ? 'emerald' : value >= 1.15 ? 'amber' : 'rose';
    case 'ltv': return value <= 0.65 ? 'emerald' : value <= 0.75 ? 'amber' : 'rose';
    case 'expenseRatio': return value <= 0.40 ? 'emerald' : value <= 0.50 ? 'amber' : 'rose';
    case 'breakEvenOccupancy': return value <= 0.80 ? 'emerald' : value <= 0.85 ? 'amber' : 'rose';
    default: return 'sky';
  }
}

function MetricCard({ title, abbreviation, value, health, tooltip }) {
  const colorMap = {
    emerald: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
    rose: 'text-rose-400 border-rose-500/30 bg-rose-500/5',
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
    sky: 'text-sky-400 border-sky-500/30 bg-sky-500/5',
  };

  const style = colorMap[health] || 'text-slate-200 border-slate-700 bg-slate-800/20';

  return (
    <div className={`p-4 rounded-xl border ${style} backdrop-blur-md relative group transition-all hover:bg-slate-800/40 hover:border-slate-600/50 shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{title}</h3>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{abbreviation}</p>
        </div>
        <div className="relative">
          <Info size={14} className="text-slate-500 group-hover:text-slate-400 cursor-help" />
          <div className="absolute right-0 top-full mt-2 w-52 p-2 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-relaxed">
            {tooltip}
          </div>
        </div>
      </div>
      <p className="text-2xl font-black tabular-nums tracking-tight">
        {value}
      </p>
    </div>
  );
}

export default function MetricCards({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up">
      <MetricCard
        title="Asset Yield"
        abbreviation="(Cap Rate)"
        value={formatPercent(metrics.capRate)}
        health={getMetricHealthColor('capRate', metrics.capRate)}
        tooltip="Unlevered initial yield based on Year 1 NOI and acquisition price. Benchmark against risk-free rate."
      />
      <MetricCard
        title="Cash-on-Cash"
        abbreviation="(Levered Return)"
        value={formatPercent(metrics.cashOnCash)}
        health={getMetricHealthColor('cashOnCash', metrics.cashOnCash)}
        tooltip="Annual pre-tax cash flow divided by total initial cash invested. Indicates immediate levered yield."
      />
      <MetricCard
        title="Debt Coverage"
        abbreviation="(DSCR)"
        value={`${formatMultiple(metrics.dscr)}x`}
        health={getMetricHealthColor('dscr', metrics.dscr)}
        tooltip="Debt Service Coverage Ratio. NOI divided by annual debt service. Institutional floors are typically 1.25x."
      />
      <MetricCard
        title="Total Leverage"
        abbreviation="(LTV Ratio)"
        value={formatPercent(metrics.ltv)}
        health={getMetricHealthColor('ltv', metrics.ltv)}
        tooltip="Loan-to-Value. Total senior debt divided by acquisition price. Higher leverage magnifies both returns and equity wipeout risk."
      />
      
      <MetricCard
        title="Net Op. Income"
        abbreviation="(NOI)"
        value={formatCurrency(metrics.noi)}
        health="sky"
        tooltip="Net Operating Income. Total effective gross income minus stabilized operating expenses."
      />
      <MetricCard
        title="Free Cash Flow"
        abbreviation="(Post-Debt C/F)"
        value={formatCurrency(metrics.annualCashFlow)}
        health={metrics.annualCashFlow > 0 ? 'emerald' : 'rose'}
        tooltip="Annual cash flow available to equity after servicing senior debt obligations."
      />
      <MetricCard
        title="EXPENSE RATIO"
        abbreviation="(OpEx / Eff. Gross Income)"
        value={formatPercent(metrics.expenseRatio)}
        health={getMetricHealthColor('expenseRatio', metrics.expenseRatio)}
        tooltip="Proportion of gross income consumed by recurring operating expenses."
      />
      <MetricCard
        title="Break-Even Point"
        abbreviation="(Min Occupancy)"
        value={formatPercent(metrics.breakEvenOccupancy)}
        health={getMetricHealthColor('breakEvenOccupancy', metrics.breakEvenOccupancy)}
        tooltip="The minimum economic occupancy required to cover 100% of operating expenses and debt service."
      />
    </div>
  );
}
