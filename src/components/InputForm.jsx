import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, HelpCircle, LayoutGrid, Briefcase, Landmark, Activity, FileSpreadsheet } from 'lucide-react';

const PROPERTY_TYPES = [
  'Multifamily',
  'Single Family',
  'Office',
  'Retail / Strip Center',
  'Industrial / Flex',
  'Mixed-Use',
  'Hospitality',
  'Self-Storage',
  'Land',
  'Other',
];

function FieldLabel({ label, tooltip }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      {tooltip && (
        <div className="relative group">
          <HelpCircle size={12} className="text-slate-500 cursor-help hover:text-sky-400 transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl leading-relaxed">
            {tooltip}
          </div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, tooltip, type = 'text', value, onChange, placeholder, prefix, suffix, step, min, max }) {
  // Safe display specifically for percentages
  const displayValue = type === 'number' && suffix === '%' && value !== '' && value !== null
    ? Number(value).toFixed(2).replace(/\.?0+$/, '') 
    : value;

  return (
    <div className="flex flex-col">
      <FieldLabel label={label} tooltip={tooltip} />
      <div className="relative flex-1">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">{prefix}</span>
        )}
        <input
          type={type}
          value={displayValue}
          onChange={(e) => onChange(type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          className={`w-full bg-slate-900/50 border border-slate-700/60 inner-glow rounded-lg py-2.5 text-sm text-slate-100 placeholder-slate-600 transition-all focus:bg-slate-900/80
            ${prefix ? 'pl-7 pr-3' : suffix ? 'pl-3 pr-8' : 'px-3'}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/80">
      {Icon && <Icon size={14} className="text-sky-500" />}
      <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-[0.14em]">{title}</h3>
    </div>
  );
}

export default function InputForm({ inputs = {}, onChange, onRunAnalysis, loading, loadedScenarioName }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (field) => (value) => onChange({ ...inputs, [field]: value });

  const vacancyPercent = inputs?.vacancyRate !== '' && inputs?.vacancyRate !== undefined ? (parseFloat(inputs.vacancyRate) * 100) : '';
  const interestPercent = inputs?.interestRate !== '' && inputs?.interestRate !== undefined ? (parseFloat(inputs.interestRate) * 100) : '';
  const appreciationPercent = inputs?.expectedAppreciation !== '' && inputs?.expectedAppreciation !== undefined ? (parseFloat(inputs.expectedAppreciation) * 100) : '';
  const targetPercent = inputs?.targetReturnThreshold !== '' && inputs?.targetReturnThreshold !== undefined ? (parseFloat(inputs.targetReturnThreshold) * 100) : '';

  return (
    <div className="space-y-7">
      
      {/* Dynamic Scenario Mode Indicator */}
      {loadedScenarioName && (
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 flex items-start gap-3 animate-fade-in-up">
          <FileSpreadsheet size={16} className="text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-sky-400 mb-0.5">Investment Case Loaded</p>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Using <strong className="text-slate-300 font-semibold">{loadedScenarioName}</strong> as a modeling template. All assumptions below remain editable.
            </p>
          </div>
        </div>
      )}

      {/* Asset Profile */}
      <div>
        <SectionHeader title="Asset Profile" icon={LayoutGrid} />
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Property Name"
            value={inputs.propertyName}
            onChange={handleChange('propertyName')}
            placeholder="e.g., Oak Ridge Apartments"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel label="Asset Class" />
              <select
                value={inputs.propertyType}
                onChange={(e) => handleChange('propertyType')(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/60 inner-glow rounded-lg px-3 py-2.5 text-sm text-slate-100 transition-all appearance-none cursor-pointer focus:bg-slate-900/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <InputField
              label="Location"
              value={inputs.location}
              onChange={handleChange('location')}
              placeholder="City, ST"
            />
          </div>
          <InputField
            label="Acquisition Price"
            tooltip="Total asking or negotiated purchase price"
            type="number"
            value={inputs.askingPrice}
            onChange={handleChange('askingPrice')}
            placeholder="1,200,000"
            prefix="$"
          />
        </div>
      </div>

      {/* Operational Assumptions */}
      <div>
        <SectionHeader title="Operational Assumptions" icon={Activity} />
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Gross Rental Income"
              tooltip="Maximum annual rental revenue at 100% occupancy (Gross Potential Income)"
              type="number"
              value={inputs.projectedRentalIncome}
              onChange={handleChange('projectedRentalIncome')}
              placeholder="150,000"
              prefix="$"
            />
            <InputField
              label="Vacancy Rate"
              tooltip="Expected annual vacancy as a % of Gross Potential Income"
              type="number"
              value={vacancyPercent}
              onChange={(v) => handleChange('vacancyRate')(v / 100)}
              placeholder="8"
              suffix="%"
              step="0.5"
              min="0"
              max="100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Operating Expenses"
              tooltip="Total annual recurring expenses: taxes, insurance, management, maintenance"
              type="number"
              value={inputs.annualOperatingExpenses}
              onChange={handleChange('annualOperatingExpenses')}
              placeholder="45,000"
              prefix="$"
            />
            <InputField
              label="CapEx / Renovation"
              tooltip="Upfront capital expenditure required before cash flow stabilizes"
              type="number"
              value={inputs.renovationCost}
              onChange={handleChange('renovationCost')}
              placeholder="50,000"
              prefix="$"
            />
          </div>
        </div>
      </div>

      {/* Capital Structure */}
      <div>
        <SectionHeader title="Capital Structure" icon={Landmark} />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Equity Contribution"
            tooltip="Initial equity deployed at closing (Down Payment)"
            type="number"
            value={inputs.downPayment}
            onChange={handleChange('downPayment')}
            placeholder="300,000"
            prefix="$"
          />
          <InputField
            label="Debt Financing"
            tooltip="Total initial mortgage amount"
            type="number"
            value={inputs.loanAmount}
            onChange={handleChange('loanAmount')}
            placeholder="900,000"
            prefix="$"
          />
          <InputField
            label="Interest Rate"
            tooltip="Annual base interest rate on the debt facility"
            type="number"
            value={interestPercent}
            onChange={(v) => handleChange('interestRate')(v / 100)}
            placeholder="7.5"
            suffix="%"
            step="0.125"
          />
          <InputField
            label="Amortization Term"
            tooltip="Amortization period in years"
            type="number"
            value={inputs.loanTerm}
            onChange={handleChange('loanTerm')}
            placeholder="25"
            suffix="yrs"
          />
        </div>
      </div>

      {/* Advanced Parameters */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-sky-400 transition-colors w-full py-3 border-t border-slate-800/80 mt-2"
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span className="uppercase tracking-[0.1em] font-bold">
            {showAdvanced ? 'Hide' : 'Configure'} Return Targets & Underwriting Notes
          </span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-fade-in-up">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Target Min. Yield"
                tooltip="Your minimum acceptable Cash-on-Cash return threshold"
                type="number"
                value={targetPercent}
                onChange={(v) => handleChange('targetReturnThreshold')(v / 100)}
                placeholder="8.0"
                suffix="%"
                step="0.5"
              />
              <InputField
                label="Exit Appreciation"
                tooltip="Annual property value appreciation assumption for exit modeling"
                type="number"
                value={appreciationPercent}
                onChange={(v) => handleChange('expectedAppreciation')(v / 100)}
                placeholder="3.0"
                suffix="%"
                step="0.5"
              />
            </div>
            <div>
              <FieldLabel label="Underwriting Deal Notes" />
              <textarea
                value={inputs.notes}
                onChange={(e) => handleChange('notes')(e.target.value)}
                placeholder="Document thesis, market conditions, and qualitative assumptions..."
                rows={4}
                className="w-full bg-slate-900/50 border border-slate-700/60 inner-glow rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 transition-all resize-none focus:bg-slate-900/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-2">
        <button
          onClick={onRunAnalysis}
          disabled={loading}
          className="execute-btn w-full py-4 rounded-xl text-xs tracking-widest uppercase font-bold transition-all duration-300
            bg-white hover:bg-slate-100 text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            active:scale-[0.98] flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Intelligence...
            </span>
          ) : (
            <>
              Generate Acquisition Intelligence
              <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
