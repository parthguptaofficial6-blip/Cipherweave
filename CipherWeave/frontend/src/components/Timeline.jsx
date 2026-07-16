import React from 'react';
import { Terminal, CreditCard, Shield } from 'lucide-react';

export default function Timeline({ cyberEvents = [], transactionEvents = [] }) {
  // Combine and sort events by timestamp
  const allEvents = [
    ...cyberEvents.map((e) => ({ ...e, eventGroup: 'cyber' })),
    ...transactionEvents.map((e) => ({ ...e, eventGroup: 'txn' })),
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (allEvents.length === 0) {
    return (
      <div className="text-center text-slate-500 py-10 text-sm">
        No events recorded for this case.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 relative">
      <h3 className="text-lg font-semibold mb-6 text-slate-200">Event Timeline</h3>
      <div className="relative wrap overflow-hidden h-full min-h-[300px]">
        {/* Center vertical line */}
        <div className="timeline-line"></div>

        <div className="space-y-8">
          {allEvents.map((e, idx) => {
            const isLeft = idx % 2 === 0;
            const timeStr = new Date(e.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = new Date(e.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            const isCyber = e.eventGroup === 'cyber';

            return (
              <div
                key={e.id || idx}
                className={`flex justify-between items-center w-full ${
                  isLeft ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Event Card Panel */}
                <div className="order-1 w-[45%]">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-slate-400">
                    <span className="text-xs font-mono tracking-wider font-semibold">
                      {dateStr} {timeStr}
                    </span>
                  </div>

                  {isCyber ? (
                    <div className="p-4 bg-slate-800/80 rounded-lg shadow-lg border-l-4 border-teal-500 glass-panel">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-teal-400 capitalize text-sm">
                          {e.event_type.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                          Cyber
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        IP: <span className="font-mono text-slate-200">{e.source_ip}</span> ({e.geo})
                      </p>
                      {e.cipher_suite && (
                        <p
                          className="text-[10px] mt-2 font-mono text-slate-400 bg-slate-900/50 p-1.5 rounded border border-slate-700/50 truncate"
                          title={e.cipher_suite}
                        >
                          Cipher: {e.cipher_suite}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-800/80 rounded-lg shadow-lg border-l-4 border-indigo-500 glass-panel">
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-bold text-indigo-400 capitalize text-sm">
                          {e.transaction_type.replace(/_/g, ' ')}
                        </h4>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-semibold">
                          Transaction
                        </span>
                      </div>
                      <p className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
                        ${e.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-300">
                        Beneficiary: <span className="text-slate-200">{e.beneficiary}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Timeline Circle Bullet */}
                <div
                  className={`z-20 flex items-center justify-center order-1 w-8 h-8 rounded-full border-2 bg-slate-950 shadow-[0_0_15px_currentColor] transition-all duration-300 hover:scale-125 ${
                    isCyber ? 'border-teal-500 text-teal-400' : 'border-indigo-500 text-indigo-400'
                  }`}
                >
                  {isCyber ? (
                    <Terminal className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                  )}
                </div>

                {/* Spacing Placeholder */}
                <div className="order-1 w-[45%]"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
