import React from 'react';
import AlertBadge from './AlertBadge';
import Timeline from './Timeline';
import { AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight } from 'lucide-react';

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
  const scoreColor = isHighRisk ? 'text-red-500' : 'text-teal-400';

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
            
            <div className="text-left md:text-right bg-slate-900/40 p-4 rounded-lg border border-slate-800 flex items-center gap-4 md:flex-col md:gap-1 min-w-[120px] justify-between">
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

          {/* Quantum Risk Warning Banner */}
          {c.quantum_risk && (
            <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="font-bold">Quantum Threat Flagged:</strong> Harvest-Now, Decrypt-Later (HNDL) indicators present. Anomaly includes high exfiltration volume over standard port paired with deprecated cryptography suites.
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
