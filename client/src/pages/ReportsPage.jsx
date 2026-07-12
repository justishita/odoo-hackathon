import React from 'react';

const ReportsPage = () => {
  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
      <h2 className="text-xl font-bold">Reports & Analytics</h2>
      <p className="text-sm text-slate-500">
        This screen is restricted to Admin, Asset Manager, and Department Head roles. Custom MongoDB aggregations and data visualizations will be built here in Module B6.
      </p>
    </div>
  );
};

export default ReportsPage;
