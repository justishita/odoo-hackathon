import React, { useState } from 'react';
import DepartmentTab from '../components/organization/DepartmentTab';
import CategoryTab from '../components/organization/CategoryTab';
import EmployeeDirectoryTab from '../components/organization/EmployeeDirectoryTab';
import { Building2, FolderKanban, Users } from 'lucide-react';

const OrganizationSetupPage = () => {
  const [activeTab, setActiveTab] = useState('departments');

  const tabs = [
    { id: 'departments', name: 'Departments', icon: Building2, component: DepartmentTab },
    { id: 'categories', name: 'Asset Categories', icon: FolderKanban, component: CategoryTab },
    { id: 'employees', name: 'Employee Directory', icon: Users, component: EmployeeDirectoryTab },
  ];

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || DepartmentTab;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Organization Setup
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage departments, asset categories, and promote or demote employee roles.
        </p>
      </div>

      {/* Tabs Menu Header */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${
                    isSelected
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                  }`}
                />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panel Content */}
      <div className="mt-4">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default OrganizationSetupPage;
