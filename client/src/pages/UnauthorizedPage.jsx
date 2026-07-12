import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, Home, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 animate-fade-in-up">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-3xl bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <ShieldOff className="h-12 w-12 text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-xl bg-red-500 flex items-center justify-center shadow-lg">
              <Lock className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-500 text-sm mb-2">
          You don't have permission to view this page.
        </p>
        <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
          Contact your administrator if you believe this is a mistake, or if you need elevated permissions for this resource.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()}
            className="btn-secondary text-sm gap-2">
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
          <Link to="/" className="btn-primary text-sm gap-2">
            <Home className="h-4 w-4" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
