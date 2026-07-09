import React from 'react';
import AlertBadge from './AlertBadge';

export default function CaseList({ cases, selectedCaseId, onSelectCase, hasSimulated }) {
  return (
    <section className="lg:col-span-1 glass-panel rounded-xl overflow-hidden flex flex-col h-[80vh]">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-100">Correlated Cases</h2>
        <span className="text-xs text-slate-400 px-2 py-0.5 bg-slate-900/50 rounded-full font-medium" id="caseCount">
          {cases.length} found
        </span>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2.5">
        {!hasSimulated && cases.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 text-sm">
            Click 'Regenerate Data' to begin.
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center text-slate-500 mt-10 text-sm">
            No anomalous cases found.
          </div>
        ) : (
          cases.map((c) => {
            const isSelected = c.id === selectedCaseId;
            const isHighRisk = c.risk_score > 70;
            const scoreColor = isHighRisk ? 'text-red-400' : 'text-teal-400';
            
            // Background classes
            let cardBg = c.quantum_risk ? 'bg-amber-900/10 hover:bg-amber-900/15' : 'bg-slate-800/60 hover:bg-slate-800/80';
            let borderStyle = isSelected 
              ? 'border-teal-500/80 shadow-md shadow-teal-500/5' 
              : 'border-slate-800 hover:border-slate-600/80';
            
            const isTriageComplete = c.status !== 'new';
            const opacityClass = isTriageComplete ? 'opacity-60' : 'opacity-100';

            return (
              <div
                key={c.id}
                onClick={() => onSelectCase(c.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${cardBg} ${borderStyle} ${opacityClass}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-semibold text-slate-300 tracking-wider">
                    {c.entity_id}
                  </span>
                  <span className={`font-black text-sm ${scoreColor}`}>
                    {Math.round(c.risk_score)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {c.quantum_risk && (
                    <AlertBadge type="quantum_risk" />
                  )}
                  {c.status !== 'new' && (
                    <AlertBadge type={c.status} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
