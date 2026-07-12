import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Users, Wrench, Calendar } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const stats = [
    { name: 'Assets Available', value: '128', icon: Package, color: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20' },
    { name: 'Assets Allocated', value: '45', icon: Users, color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20' },
    { name: 'Maintenance Today', value: '3', icon: Wrench, color: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' },
    { name: 'Active Bookings', value: '12', icon: Calendar, color: 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Welcome back, {user?.name || 'User'}!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Here is a quick snapshot of the organization's assets and resources.
        </p>
      </div>

      {/* KPI Cards Placeholder */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="flex items-center space-x-4 p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className={`p-3 rounded-lg ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{item.name}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature module placeholder notice */}
      <div className="p-8 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">System Scaffold Complete</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          The shared infrastructure (Mongoose models, JWT Auth, Role middleware, Axios instance, and Layout UI) has been successfully initialized. You can now proceed to build specific functional modules.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
