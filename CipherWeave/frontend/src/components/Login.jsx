import React, { useState } from 'react';
import { Lock, User, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Login({ onLogin, apiBase }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build form-urlencoded request payload for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch(`${apiBase}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password.");
        } else {
          throw new Error("Unable to connect to login server.");
        }
      }

      const data = await res.json();
      onLogin(data.access_token, data.username);
    } catch (err) {
      setError(err.message || "An unexpected login error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] p-6 relative overflow-hidden select-none">
      {/* Decorative colored glow backdrops */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 border border-slate-700/60 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 text-teal-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-teal-500">
            CIPHER<span className="text-white">WEAVE</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">
            Cyber & Fraud Correlation Console
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold ml-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/85 focus:ring-1 focus:ring-teal-500/30 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 uppercase tracking-widest font-semibold ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/80 border border-slate-700/50 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-teal-500/85 focus:ring-1 focus:ring-teal-500/30 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-lg bg-teal-500 hover:bg-teal-600 active:scale-99 disabled:opacity-50 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-teal-500/10"
          >
            {isLoading ? "Authenticating Console..." : "Access Console"}
          </button>
        </form>

        {/* Credentials guide banner */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <div className="inline-block p-2 bg-slate-900/50 rounded-lg border border-slate-800 text-[11px] text-slate-500">
            🔒 Sandbox Access: <strong className="text-slate-400">admin</strong> / <strong className="text-slate-400">admin</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
