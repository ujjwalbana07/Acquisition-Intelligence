import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { formatCurrency, formatPercent } from '../utils/formatters';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] text-xs z-50">
        <p className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-[10px]">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-300 font-medium">{p.name}</span>
              </div>
              <span className="text-slate-100 font-bold font-mono text-right drop-shadow-md">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const ReturnTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700/60 rounded-xl p-3 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] text-xs z-50">
        <p className="text-slate-400 font-medium mb-2 uppercase tracking-wider text-[10px]">{label}</p>
        <div className="space-y-1.5">
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-slate-300 font-medium">{p.name}</span>
              </div>
              <span className="text-slate-100 font-bold font-mono text-right drop-shadow-md">
                {formatPercent(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ChartPanel({ metrics, inputs }) {
  if (!metrics) return null;

  const { grossIncome, egi, noi, annualCashFlow } = metrics;
  
  // Adjusted to fintech color palette
  const incomeData = [
    { name: 'Gross Inc', value: grossIncome, fill: '#0ea5e9' }, // sky-500
    { name: 'Eff. Inc', value: egi, fill: '#38bdf8' },     // sky-400
    { name: 'NOI', value: noi, fill: '#10b981' },          // emerald-500
    { name: 'Cash Flow', value: annualCashFlow, fill: annualCashFlow >= 0 ? '#10b981' : '#f43f5e' }, // emerald or rose
  ];

  const returnData = [
    { name: 'Cap Rate', value: metrics.capRate, fill: metrics.capRate >= 0.05 ? '#10b981' : '#f43f5e' },
    { name: 'Levered Cash', value: metrics.cashOnCash, fill: metrics.cashOnCash >= (inputs.targetReturnThreshold || 0.06) ? '#10b981' : '#f43f5e' },
    { name: 'Target Yield', value: inputs.targetReturnThreshold || 0.08, fill: '#6366f1' }, // indigo-500
  ];

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Capital Flow / Income Waterfall */}
      <div className="glass-card rounded-xl p-5 border-t border-t-white/5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Capital Flow Waterfall</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={incomeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => formatCurrency(v, true)}
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {incomeData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Yield Benchmarking */}
      <div className="glass-card rounded-xl p-5 border-t border-t-white/5">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Yield Benchmarking</p>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={returnData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.3)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<ReturnTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {returnData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
