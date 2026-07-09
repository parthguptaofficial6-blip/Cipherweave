import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AlertBadge({ type, label }) {
  let styles = "";
  let icon = null;

  switch (type) {
    case 'quantum_risk':
      styles = "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      icon = <AlertTriangle className="w-3.5 h-3.5" />;
      label = label || "Quantum Risk";
      break;
    case 'escalated':
    case 'escalate':
      styles = "bg-red-500/20 text-red-400 border border-red-500/30";
      icon = <ShieldAlert className="w-3.5 h-3.5" />;
      label = label || "Escalated";
      break;
    case 'dismissed':
    case 'dismiss':
      styles = "bg-slate-700/50 text-slate-300 border border-slate-600/30";
      icon = <XCircle className="w-3.5 h-3.5" />;
      label = label || "Dismissed";
      break;
    case 'false_positive':
      styles = "bg-slate-800 text-slate-400 border border-slate-600/30";
      icon = <CheckCircle className="w-3.5 h-3.5" />;
      label = label || "False Positive";
      break;
    case 'new':
      styles = "bg-teal-500/20 text-teal-400 border border-teal-500/30";
      label = label || "New";
      break;
    default:
      styles = "bg-slate-800 text-slate-400 border border-slate-700";
      label = label || type;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wide transition-all duration-300 ${styles}`}>
      {icon}
      {label}
    </span>
  );
}
