import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center max-w-xl mx-auto mt-12 space-y-6">
      <div className="p-4 bg-slate-50 dark:bg-slate-900 text-slate-500 rounded-full">
        <HelpCircle className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">404 - Page Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The requested page does not exist or has not been implemented yet. Other feature modules will connect these screens.
        </p>
      </div>
      <div>
        <Link
          to="/"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
