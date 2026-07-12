import React, { useState } from 'react';
import { BarChart3, Download, TrendingUp, TrendingDown, Package, Users, Wrench, Calendar, ChevronRight, FileText, PieChart, Activity } from 'lucide-react';

const METRICS = [
  { label:'Asset Utilisation', value:'89%', change:'+4.2%', up:true,  desc:'vs last month',  color:'text-emerald-600', bg:'bg-emerald-50', border:'border-emerald-200' },
  { label:'Avg Allocation Time', value:'14d',  change:'-2d',   up:true,  desc:'shorter than prev', color:'text-blue-600',   bg:'bg-blue-50',    border:'border-blue-200' },
  { label:'Maintenance Cost',    value:'$4.2k',change:'+$800', up:false, desc:'vs last month',  color:'text-amber-600',  bg:'bg-amber-50',   border:'border-amber-200' },
  { label:'Compliance Score',    value:'94%',  change:'+2%',   up:true,  desc:'audit pass rate', color:'text-indigo-600', bg:'bg-indigo-50',  border:'border-indigo-200' },
];

const BREAKDOWN = [
  { label:'Laptops',     count:48, pct:38, color:'bg-indigo-500' },
  { label:'Furniture',   count:32, pct:25, color:'bg-blue-500' },
  { label:'AV Equipment',count:21, pct:16, color:'bg-purple-500' },
  { label:'Phones',      count:18, pct:14, color:'bg-amber-500' },
  { label:'Other',       count:9,  pct:7,  color:'bg-slate-400' },
];

const REPORTS_LIST = [
  { id:1, name:'Q2 2024 Asset Inventory',     type:'Inventory',  generated:'2024-06-01', size:'284 KB', format:'PDF' },
  { id:2, name:'Allocation Summary — May',    type:'Allocation', generated:'2024-06-02', size:'128 KB', format:'XLSX' },
  { id:3, name:'Maintenance Cost Report',     type:'Maintenance',generated:'2024-06-03', size:'96 KB',  format:'PDF' },
  { id:4, name:'Department Asset Audit',      type:'Audit',      generated:'2024-06-04', size:'512 KB', format:'PDF' },
  { id:5, name:'Utilisation Heatmap — May',   type:'Analytics',  generated:'2024-06-05', size:'1.2 MB', format:'PDF' },
];

const TYPE_BADGE = {
  Inventory:  'badge-neutral',
  Allocation: 'badge-info',
  Maintenance:'badge-warning',
  Audit:      'badge-indigo',
  Analytics:  'badge-purple',
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Reports & Analytics
          </h1>
          <p className="page-subtitle">Organisation-wide insights and downloadable reports</p>
        </div>
        <button className="btn-primary gap-2 text-sm"><FileText className="h-4 w-4" /> Generate Report</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {['overview','reports','analytics'].map(t => (
          <button key={t} onClick={()=>setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab===t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <div key={i} className={`${m.bg} ${m.border} border rounded-2xl p-5 space-y-2 card-reveal`} style={{ animationDelay:`${i*80}ms` }}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{m.label}</p>
                <p className={`text-3xl font-black ${m.color} tabular-nums`}>{m.value}</p>
                <div className="flex items-center gap-1.5">
                  {m.up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                  <span className={`text-xs font-bold ${m.up ? 'text-emerald-600' : 'text-red-500'}`}>{m.change}</span>
                  <span className="text-xs text-slate-400">{m.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Category breakdown */}
            <div className="card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-indigo-600" /> Asset by Category
                </h3>
                <span className="badge badge-neutral text-2xs">128 total</span>
              </div>
              <div className="space-y-3">
                {BREAKDOWN.map((b, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{b.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{b.count} assets</span>
                        <span className="font-bold text-slate-700">{b.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${b.color} rounded-full bar-fill`}
                        style={{ width:`${b.pct}%`, animationDelay:`${i*120}ms` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity summary */}
            <div className="card p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" /> Monthly Summary
              </h3>
              <div className="space-y-3">
                {[
                  { icon:Package,       label:'Total Assets Registered', value:'12', change:'+3 this month', up:true },
                  { icon:Users,         label:'Active Allocations',       value:'45', change:'+5 from last month', up:true },
                  { icon:Wrench,        label:'Maintenance Tickets',      value:'7',  change:'-2 resolved',   up:true },
                  { icon:Calendar,      label:'Bookings Made',            value:'34', change:'+18% volume',   up:true },
                  { icon:BarChart3,     label:'Assets Retired',           value:'2',  change:'Same as last month', up:false },
                ].map(({ icon:I, label, value, change, up }, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                      <I className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{label}</p>
                      <p className="text-2xs text-slate-400">{change}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-lg font-extrabold text-slate-800 tabular-nums">{value}</span>
                      {up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'reports' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-700">Generated Reports</p>
            <span className="badge badge-neutral">{REPORTS_LIST.length} reports</span>
          </div>
          <div className="divide-y divide-slate-100">
            {REPORTS_LIST.map((r, i) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.generated} · {r.size}</p>
                </div>
                <span className={`badge ${TYPE_BADGE[r.type]} hidden sm:flex`}>{r.type}</span>
                <span className="badge badge-neutral text-2xs">{r.format}</span>
                <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors opacity-0 group-hover:opacity-100">
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="card p-12 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto">
            <BarChart3 className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Advanced Analytics</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Interactive charts and deep-dive analytics coming soon. Export your data to get started.
          </p>
          <button className="btn-primary mx-auto">
            <Download className="h-4 w-4" /> Export Raw Data
          </button>
        </div>
      )}
    </div>
  );
}
