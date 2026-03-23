import { Activity } from 'lucide-react';
import { formatPercent, formatMultiple } from '../utils/formatters';
import { calcEffectiveGrossIncome, calcNOI, calcDSCR, calcCashOnCash } from '../utils/calculations';

function calculateStressedMetrics(inputs, metrics, newVacancyRate) {
  // Re-run the exact formulas with a modified vacancy rate constraint
  const egi = calcEffectiveGrossIncome(metrics.grossIncome, newVacancyRate);
  const noi = calcNOI(egi, inputs.annualOperatingExpenses);
  const dscr = calcDSCR(noi, metrics.annualDebtService);
  const coc = calcCashOnCash(noi, metrics.annualDebtService, metrics.totalCashInvested);
  return { noi, dscr, coc };
}

export default function SensitivityAnalysis({ metrics, inputs }) {
  if (!metrics || !inputs) return null;

  const baseVacancy = inputs.vacancyRate;
  
  // Create an array of stress scenarios starting with Base
  const scenarios = [
    { label: 'Base Case', vacancy: baseVacancy, isBase: true },
    { label: 'Stress I', vacancy: Math.max(0.10, baseVacancy + 0.02), isBase: false },
    { label: 'Stress II', vacancy: Math.max(0.15, baseVacancy + 0.05), isBase: false },
    { label: 'Severe', vacancy: Math.max(0.20, baseVacancy + 0.10), isBase: false },
  ];

  // Map to calculated results
  const tableData = scenarios.map(s => {
    const res = calculateStressedMetrics(inputs, metrics, s.vacancy);
    return {
      label: s.label,
      vacancy: s.vacancy,
      dscr: res.dscr,
      coc: res.coc,
      isBase: s.isBase
    };
  });

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in-up h-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-sky-500" />
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Downside Vacancy Sensitivity</h3>
      </div>
      
      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed tracking-wide">
        Projecting debt coverage and levered cash yields under frictional vacancy shocks to validate downside resilience.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80">
              <th className="pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-2">Scenario</th>
              <th className="pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Vacancy</th>
              <th className="pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">DSCR</th>
              <th className="pb-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2">Levered Yield</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {tableData.map((row, idx) => (
              <tr key={idx} className={`${row.isBase ? 'bg-sky-500/5' : 'hover:bg-slate-800/20'}`}>
                <td className="py-2.5 pl-2 text-xs font-semibold text-slate-300">
                  {row.label}
                  {row.isBase && <span className="ml-2 text-[9px] text-sky-400 font-black uppercase tracking-widest">(Active)</span>}
                </td>
                <td className="py-2.5 text-xs font-mono font-medium text-slate-400 text-right">
                  {formatPercent(row.vacancy)}
                </td>
                <td className={`py-2.5 text-xs font-mono font-bold text-right ${row.dscr < 1.0 ? 'text-rose-400' : row.dscr < 1.15 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {formatMultiple(row.dscr)}x
                </td>
                <td className={`py-2.5 text-xs font-mono font-bold text-right pr-2 ${row.coc < 0 ? 'text-rose-400' : row.coc < 0.05 ? 'text-amber-400' : 'text-slate-200'}`}>
                  {formatPercent(row.coc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
