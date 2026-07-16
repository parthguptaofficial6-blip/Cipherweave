import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardStats({ apiBase, token }) {
  const [stats, setStats] = useState({
    total_cases: 0,
    high_risk_cases: 0,
    quantum_threats: 0,
    escalated_cases: 0
  });

  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${apiBase}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
          
          // Generate some mock trend data based on the actual stats for the chart
          // In a real scenario, this would come from the backend time-series endpoint
          const baseThreats = Math.max(2, data.high_risk_cases / 4);
          const newTrend = Array.from({ length: 7 }).map((_, i) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
            threats: Math.round(baseThreats + Math.random() * baseThreats * 2),
            quantum: Math.round(data.quantum_threats > 0 ? Math.random() * 2 : 0)
          }));
          setTrendData(newTrend);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
    // Refresh stats every 10 seconds to simulate a live dashboard
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [apiBase, token]);

  const statCards = [
    {
      title: 'Total Evaluated',
      value: stats.total_cases,
      icon: <Layers className="w-5 h-5 text-indigo-400" />,
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]',
      border: 'border-indigo-500/30'
    },
    {
      title: 'Critical Threats',
      value: stats.high_risk_cases,
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      glow: 'shadow-[0_0_15px_rgba(248,113,113,0.2)]',
      border: 'border-red-500/30'
    },
    {
      title: 'Quantum Risks',
      value: stats.quantum_threats,
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.2)]',
      border: 'border-amber-500/30'
    },
    {
      title: 'Active Escalations',
      value: stats.escalated_cases,
      icon: <Activity className="w-5 h-5 text-teal-400" />,
      glow: 'shadow-[0_0_15px_rgba(45,212,191,0.2)]',
      border: 'border-teal-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
      {/* Stat Cards */}
      <div className="md:col-span-4 xl:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s, idx) => (
          <div key={idx} className={`glass-panel rounded-xl p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-1 ${s.glow} border ${s.border}`}>
            {/* Background glowing orb effect */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.title}</span>
              {s.icon}
            </div>
            <div className="text-3xl font-black font-mono text-slate-100 relative z-10">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Mini Trend Chart */}
      <div className="md:col-span-4 xl:col-span-2 glass-panel rounded-xl p-4 border border-slate-700/50 relative overflow-hidden h-[120px] flex flex-col justify-between shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Threat Volume (7d)</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[10px] text-slate-300"><div className="w-2 h-2 rounded-full bg-red-500"></div> Alerts</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-300"><div className="w-2 h-2 rounded-full bg-amber-500"></div> HNDL</span>
          </div>
        </div>
        <div className="flex-1 w-full -ml-4 -mb-4 -mr-4">
          <ResponsiveContainer width="105%" height="110%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorQuantum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Area type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
              <Area type="monotone" dataKey="quantum" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorQuantum)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
