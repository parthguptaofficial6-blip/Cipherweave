import React from 'react';
import AlertBadge from './AlertBadge';
import Timeline from './Timeline';
import { AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight, Activity } from 'lucide-react';

export default function CaseDetail({
  caseData,
  isLoadingDetail,
  onTakeAction,
  isTakingAction,
}) {
  if (isLoadingDetail) {
    return (
      <section className="lg:col-span-2 glass-panel rounded-xl flex items-center justify-center h-[80vh] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading case file...</span>
        </div>
      </section>
    );
  }

  if (!caseData) {
    return (
      <section className="lg:col-span-2 glass-panel rounded-xl flex items-center justify-center h-[80vh] text-slate-500 border border-dashed border-slate-700/50">
        <div className="text-center max-w-sm px-6">
          <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4 stroke-1" />
          <p className="font-semibold text-slate-300 mb-1">No Case Selected</p>
          <p className="text-xs text-slate-500">
            Select a security anomaly from the left panel to inspect correlated cybersecurity telemetry and transactional logs.
          </p>
        </div>
      </section>
    );
  }

  const { case: c, cyber_events, transaction_events } = caseData;
  const isHighRisk = c.risk_score > 70;
  const scoreColor = isHighRisk ? 'text-red-500 text-glow-red' : 'text-teal-400 text-glow-blue';

  // Get primary IPs/Vendors for graph
  const mainIp = cyber_events?.[0]?.source_ip || 'Unknown IP';
  const mainVendor = transaction_events?.[0]?.beneficiary || 'Unknown Node';

  return (
    <section className="lg:col-span-2 glass-panel rounded-xl flex flex-col h-[80vh] overflow-hidden relative">
      {/* Scrollable container for the main content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Header Section */}
        <div className="p-6 border-b border-slate-700 bg-slate-800/40">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold font-mono tracking-wide text-slate-100">
                  Case: <span className="text-teal-400">{c.entity_id}</span>
                </h2>
                <AlertBadge type={c.status} />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                {c.explanation}
              </p>
            </div>
            
            <div className="text-left md:text-right bg-slate-900/40 p-4 rounded-lg border border-slate-800 flex items-center gap-4 md:flex-col md:gap-1 min-w-[120px] justify-between shadow-inner">
              <div>
                <div className={`text-4xl font-black font-mono tracking-tighter ${scoreColor}`}>
                  {Math.round(c.risk_score)}
                </div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">
                  Risk Score
                </div>
              </div>
            </div>
          </div>

          {/* Visual Correlation Graph */}
          <div className="mt-6 mb-2 p-4 bg-slate-950/50 rounded-xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center min-h-[140px]">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            <div className="flex items-center gap-4 z-10 w-full max-w-lg justify-between px-4">
              {/* Node 1: Threat Actor */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] flex items-center justify-center z-10">
                  <Activity className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono bg-slate-900 px-2 py-0.5 rounded">{mainIp}</span>
              </div>
              
              {/* Connection Line */}
              <div className="flex-1 h-0.5 bg-gradient-to-r from-red-500/50 via-slate-600 to-indigo-500/50 relative -mt-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-[9px] px-2 text-slate-500 uppercase tracking-widest border border-slate-800 rounded">Correlated</div>
              </div>

              {/* Node 2: Entity */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-slate-800 border-2 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center z-10">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[10px] text-indigo-300 mt-2 font-mono font-bold bg-indigo-900/30 px-2 py-0.5 rounded">{c.entity_id}</span>
              </div>

              {/* Connection Line */}
              <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-500/50 via-slate-600 to-teal-500/50 relative -mt-6"></div>

              {/* Node 3: Target */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.3)] flex items-center justify-center z-10">
                  <ArrowUpRight className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-mono bg-slate-900 px-2 py-0.5 rounded truncate max-w-[80px] block" title={mainVendor}>{mainVendor}</span>
              </div>
            </div>
          </div>

          {/* Quantum Risk Warning Banner */}
          {c.quantum_risk && (
            <div className="mt-5 p-4 bg-slate-900 border border-amber-500/60 rounded-xl text-amber-400 flex items-start gap-4 animate-pulse-slow shadow-[0_0_25px_rgba(245,158,11,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-sm pointer-events-none"></div>
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5 relative z-10" />
              <div className="text-sm relative z-10">
                <strong className="font-black tracking-wide uppercase text-amber-500 block mb-1">Critical: Quantum Threat Flagged</strong> 
                <span className="text-slate-300">Harvest-Now, Decrypt-Later (HNDL) indicators detected. Anomaly includes high exfiltration volume paired with deprecated RSA/CBC cryptography suites.</span>
              </div>
            </div>
          )}

          {/* Triage Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <button
              onClick={() => onTakeAction('escalate')}
              disabled={isTakingAction || c.status === 'escalate' || c.status === 'escalated'}
              className="flex items-center justify-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:hover:bg-red-500/15 disabled:hover:text-red-400 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-semibold active:scale-98"
            >
              Escalate Case
            </button>
            <button
              onClick={() => onTakeAction('dismiss')}
              disabled={isTakingAction || c.status === 'dismiss' || c.status === 'dismissed'}
              className="flex items-center justify-center gap-1.5 bg-slate-700/60 text-slate-200 border border-slate-600/50 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700/60 disabled:hover:text-slate-200 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-semibold active:scale-98"
            >
              Dismiss
            </button>
            <button
              onClick={() => onTakeAction('false_positive')}
              disabled={isTakingAction || c.status === 'false_positive'}
              className="flex items-center justify-center gap-1.5 border border-slate-600/60 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400 py-2 px-4 rounded-lg transition-all duration-300 text-sm font-semibold active:scale-98"
            >
              False Positive
            </button>
          </div>
        </div>

        {/* Timeline Log Section */}
        <div className="flex-1 p-6">
          <Timeline
            cyberEvents={cyber_events}
            transactionEvents={transaction_events}
          />
        </div>
      </div>
    </section>
  );
}
