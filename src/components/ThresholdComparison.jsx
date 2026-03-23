import { CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';
import { formatPercent, formatMultiple } from '../utils/formatters';
import { THRESHOLDS } from '../config/thresholds';

function ThresholdBadge({ status }) {
  if (status === 'Pass') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
        <CheckCircle2 size={12} /> Pass
      </span>
    );
  }
  if (status === 'Caution') {
    return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest">
        <AlertTriangle size={12} /> Caution
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest">
      <XOctagon size={12} /> Breached
    </span>
  );
}

export default function ThresholdComparison({ metrics }) {
  if (!metrics) return null;

  const dscrStatus = metrics.dscr >= THRESHOLDS.DSCR_ACCEPTABLE ? 'Pass' : metrics.dscr >= THRESHOLDS.DSCR_CAUTION ? 'Caution' : 'Fail';
  const capRateStatus = metrics.capRate >= THRESHOLDS.CAP_RATE_ACCEPTABLE ? 'Pass' : metrics.capRate >= THRESHOLDS.CAP_RATE_WEAK ? 'Caution' : 'Fail';
  const cocStatus = metrics.cashOnCash >= THRESHOLDS.CASH_ON_CASH_ACCEPTABLE ? 'Pass' : metrics.cashOnCash >= THRESHOLDS.CASH_ON_CASH_WEAK ? 'Caution' : 'Fail';
  const ltvStatus = metrics.ltv <= THRESHOLDS.LTV_ACCEPTABLE ? 'Pass' : metrics.ltv <= THRESHOLDS.LTV_HIGH ? 'Caution' : 'Fail';
  const breakEvenStatus = metrics.breakEvenOccupancy <= THRESHOLDS.BREAK_EVEN_ACCEPTABLE ? 'Pass' : metrics.breakEvenOccupancy <= THRESHOLDS.BREAK_EVEN_HIGH ? 'Caution' : 'Fail';

  const rows = [
    { label: 'Debt Coverage (DSCR)', value: formatMultiple(metrics.dscr) + 'x', target: '≥' + formatMultiple(THRESHOLDS.DSCR_ACCEPTABLE) + 'x', status: dscrStatus },
    { label: 'Entry Yield (Cap Rate)', value: formatPercent(metrics.capRate), target: '≥' + formatPercent(THRESHOLDS.CAP_RATE_ACCEPTABLE), status: capRateStatus },
    { label: 'Levered Cash Return', value: formatPercent(metrics.cashOnCash), target: '≥' + formatPercent(THRESHOLDS.CASH_ON_CASH_ACCEPTABLE), status: cocStatus },
    { label: 'Loan-to-Value (LTV)', value: formatPercent(metrics.ltv), target: '≤' + formatPercent(THRESHOLDS.LTV_ACCEPTABLE), status: ltvStatus },
    { label: 'Break-Even Occupancy', value: formatPercent(metrics.breakEvenOccupancy), target: '≤' + formatPercent(THRESHOLDS.BREAK_EVEN_ACCEPTABLE), status: breakEvenStatus },
  ];

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in-up">
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Threshold Comparison</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80">
              <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Underwriting Metric</th>
              <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-4">Actual Output</th>
              <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-4">Institutional Target</th>
              <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2">Alignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {rows.map((row, idx) => (
              <tr key={idx} className="group hover:bg-slate-800/30 transition-colors">
                <td className="py-3 pl-2 text-xs font-semibold text-slate-300">{row.label}</td>
                <td className="py-3 pr-4 text-xs font-mono font-bold text-slate-100 text-right">{row.value}</td>
                <td className="py-3 pr-4 text-xs font-mono font-medium text-slate-500 text-right">{row.target}</td>
                <td className="py-3 pr-2 flex justify-end">
                  <ThresholdBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
