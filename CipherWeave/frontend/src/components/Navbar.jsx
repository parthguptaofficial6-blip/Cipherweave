import React from 'react';
import { RefreshCw, Activity, User, LogOut } from 'lucide-react';

export default function Navbar({ onSimulate, isLoading, username, onLogout }) {
  return (
    <nav className="glass-panel sticky top-0 z-50 border-b p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-teal-500 animate-pulse" />
          <h1 className="text-2xl font-black text-teal-500 tracking-wider">
            CIPHER<span className="text-white">WEAVE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {username && (
            <>
              {/* User session indicator */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-semibold text-slate-300">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="font-mono">{username}</span>
              </div>

              {/* Data simulation trigger */}
              <button
                onClick={onSimulate}
                disabled={isLoading}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-700 disabled:opacity-70 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-teal-500/10 active:scale-95 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Generating..." : "Simulate Data"}
              </button>

              {/* Logout button */}
              <button
                onClick={onLogout}
                title="Access Logout"
                className="flex items-center justify-center p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
