import { useState, useRef } from 'react';
import { runAllCalculations } from './utils/calculations';
import { analyzeRisks } from './utils/riskEngine';
import { generateRecommendation, generateNextSteps } from './utils/recommendation';
import { SCENARIOS, DEFAULT_INPUTS } from './data/scenarios';

import InputForm from './components/InputForm';
import MetricCards from './components/MetricCards';
import RecommendationPanel from './components/RecommendationPanel';
import RiskFlags from './components/RiskFlags';
import ExecutiveSummary from './components/ExecutiveSummary';
import DashboardExecutiveSummary from './components/DashboardExecutiveSummary';
import ThresholdComparison from './components/ThresholdComparison';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import NextSteps from './components/NextSteps';
import ChartPanel from './components/ChartPanel';
import AIAgentCopilot from './components/AIAgentCopilot';

import { Activity, RefreshCcw, Moon, Sun, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

import { generatePDF } from './utils/pdfGenerator';

function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS || {});
  const [loadedScenarioName, setLoadedScenarioName] = useState(null);
  const [theme, setTheme] = useState('dark');
  
  const [metrics, setMetrics] = useState(null);
  const [risks, setRisks] = useState(null);
  const [result, setResult] = useState(null);
  const [nextSteps, setNextSteps] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // New state for PDF export
  const [isExporting, setIsExporting] = useState(false);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const calculatedMetrics = runAllCalculations(inputs);
      const identifiedRisks = analyzeRisks(calculatedMetrics, inputs);
      const recommendationResult = generateRecommendation(calculatedMetrics, inputs, identifiedRisks);
      const generatedSteps = generateNextSteps(recommendationResult.recommendation, identifiedRisks, calculatedMetrics, inputs);

      setMetrics(calculatedMetrics);
      setRisks(identifiedRisks);
      setResult(recommendationResult);
      setNextSteps(generatedSteps);
      
      setIsAnalyzing(false);
      setActiveTab('dashboard');
    }, 800);
  };

  const loadScenario = (scenarioId) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (scenario) {
      setInputs(scenario.inputs);
      setLoadedScenarioName(scenario.inputs.propertyName);
      
      setMetrics(null);
      setRisks(null);
      setResult(null);
      setNextSteps(null);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setLoadedScenarioName(null);
    setMetrics(null);
    setRisks(null);
    setResult(null);
    setNextSteps(null);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleExportPDF = async () => {
    if (!metrics) return;
    setIsExporting(true);
    
    try {
      // Direct drawing avoids html2canvas/CSS issues
      generatePDF({ inputs, metrics, risks, result, nextSteps });
    } catch (error) {
      console.error('PDF Export Failed:', error);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative text-slate-200 decoration-slate-400 ${theme === 'light' ? 'theme-light' : ''}`}>
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-900/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#020617]/80 border-b border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)] shrink-0">
                <Activity size={22} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white m-0 leading-tight">
                  CR EQUITY AI
                </h1>
                <p className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.15em] m-0">
                  Acquisition Intelligence
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <button 
                onClick={handleExportPDF}
                disabled={!metrics || isExporting}
                className="mr-4 px-4 py-2 text-[11px] font-black uppercase tracking-widest bg-sky-500 hover:bg-sky-400 text-white rounded-lg transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <RefreshCcw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {isExporting ? "Generating..." : "Download PDF Brief"}
              </button>

              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mr-2 hidden lg:block">
                Investment Cases:
              </span>
              {SCENARIOS.map(s => (
                <button
                  key={s.id}
                  onClick={() => loadScenario(s.id)}
                  data-active={loadedScenarioName === s.inputs.propertyName}
                  className="scenario-btn px-3 py-1.5 text-[11px] font-bold tracking-wide uppercase bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 rounded-md transition-all hover:border-sky-500/50 hover:text-sky-400"
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={handleReset}
                className="ml-2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all"
                title="Reset Screen"
              >
                <RefreshCcw size={16} />
              </button>
              
              <div className="w-px h-6 bg-slate-700/50 mx-1 hidden md:block"></div>
              
              <button
                onClick={toggleTheme}
                className="p-1.5 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-md transition-all flex items-center gap-2"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
            
          </div>
        </div>
      </header>

      {/* Main Interface */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Panel */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="mb-4">
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Load a sample investment case or edit assumptions below to model a custom acquisition opportunity.
            </p>
          </div>
          
          <div className="glass-card rounded-2xl p-6 sticky top-28">
            <InputForm 
              inputs={inputs} 
              onChange={setInputs} 
              onRunAnalysis={handleRunAnalysis}
              loading={isAnalyzing}
              loadedScenarioName={loadedScenarioName}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          {!metrics && !isAnalyzing && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-2xl p-8 text-center bg-slate-900/20">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-6">
                <Activity size={32} className="text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-300 mb-2">Deal Pipeline Ready</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-8">
                Load a sample investment case from the header, or populate the capital stack manually. Execute intelligence generation to surface risk signals and IC recommendations.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-slate-800/80 rounded-2xl bg-slate-900/20">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <Activity className="absolute inset-0 m-auto text-sky-500" size={24} />
              </div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-sky-400 animate-pulse">Running Monte Carlo & Risk Models...</p>
            </div>
          )}

          {metrics && !isAnalyzing && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <div className="flex items-center justify-between mb-6">
                <TabsList className="flex items-center gap-1 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                  <TabsTrigger 
                    value="dashboard"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm transition-all outline-none"
                  >
                    Intelligence Dashboard
                  </TabsTrigger>
                  <TabsTrigger 
                    value="memo"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-lg text-slate-400 data-[state=active]:bg-slate-800 data-[state=active]:text-sky-400 data-[state=active]:shadow-sm transition-all outline-none"
                  >
                    Investment Memo
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard" className="space-y-6 outline-none animate-fade-in-up">
                <AIAgentCopilot context={{ inputs, metrics, risks, result, nextSteps }} />
                <DashboardExecutiveSummary result={result} />
                <RecommendationPanel result={result} />
                
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Asset Financial Profile</h3>
                  <MetricCards metrics={metrics} />
                </div>

                <ThresholdComparison metrics={metrics} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-6">
                    <SensitivityAnalysis metrics={metrics} inputs={inputs} />
                    <RiskFlags risks={risks} />
                  </div>
                  <div className="flex flex-col gap-6">
                    <ChartPanel metrics={metrics} inputs={inputs} />
                    <NextSteps steps={nextSteps} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="memo" className="outline-none animate-fade-in-up">
                <ExecutiveSummary inputs={inputs} metrics={metrics} result={result} />
              </TabsContent>

            </Tabs>
          )}

        </div>
      </main>

      <footer className="py-6 border-t border-slate-800/50 text-center relative z-10 bg-[#020617]/50 mt-auto">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em]">
          Powered by CR EQUITY AI Engine · Confidential Internal Use Only
        </p>
      </footer>
    </div>
  );
}

export default App;
