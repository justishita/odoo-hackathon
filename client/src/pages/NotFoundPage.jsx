import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Zap } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb-1 absolute -top-32 -left-32 w-96 h-96 rounded-full" style={{ background:'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
      <div className="orb-2 absolute -bottom-24 -right-24 w-80 h-80 rounded-full" style={{ background:'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      <div className="grid-dots absolute inset-0 opacity-20" />

      <div className="relative z-10 text-center max-w-lg animate-fade-in-up">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <Zap className="h-8 w-8 text-indigo-400" />
          </div>
        </div>

        {/* Big 404 */}
        <div className="relative mb-4">
          <p className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-purple-600 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[120px] font-black leading-none text-white/3 blur-sm select-none">404</p>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 text-sm mb-8 max-w-sm mx-auto">
          Looks like this asset has been decommissioned. The page you're looking for doesn't exist or was moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5 text-sm font-semibold transition-all">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-glow hover:shadow-glow-lg transition-all">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
