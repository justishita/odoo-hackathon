import React, { useState } from 'react';
import { ClipboardCheck, Search, Download, Filter, User, Package, ArrowLeftRight, Wrench, Calendar, Settings, ChevronDown } from 'lucide-react';

const ACTION_ICON = { allocated:ArrowLeftRight, returned:Package, maintenance:Wrench, booked:Calendar, updated:Settings, registered:Package };
const ACTION_COLOR = {
  allocated:  'bg-blue-50 text-blue-600 border-blue-100',
  returned:   'bg-emerald-50 text-emerald-600 border-emerald-100',
  maintenance:'bg-amber-50 text-amber-600 border-amber-100',
  booked:     'bg-purple-50 text-purple-600 border-purple-100',
  updated:    'bg-slate-50 text-slate-600 border-slate-200',
  registered: 'bg-indigo-50 text-indigo-600 border-indigo-100',
};

const LOGS = [
  { id:1, actor:'Priya Sharma',  role:'Asset Manager',  action:'allocated',   target:'MacBook Pro LT-042',    dept:'Engineering', time:'2 min ago',   date:'2024-06-07 09:42', ip:'192.168.1.12' },
  { id:2, actor:'Rahul Gupta',   role:'Employee',        action:'booked',      target:'Projector PJ-011',      dept:'Sales',       time:'18 min ago',  date:'2024-06-07 09:26', ip:'192.168.1.8' },
  { id:3, actor:'System',        role:'System',          action:'maintenance', target:'AC Unit - Room 3B',      dept:'Facilities',  time:'1h ago',      date:'2024-06-07 08:45', ip:'system' },
  { id:4, actor:'Sneha Patel',   role:'Employee',        action:'returned',    target:'iPad Pro TB-017',        dept:'Design',      time:'2h ago',      date:'2024-06-07 07:55', ip:'192.168.1.15' },
  { id:5, actor:'Admin',         role:'Admin',           action:'registered',  target:'Dell XPS 15 LT-043',    dept:'—',           time:'4h ago',      date:'2024-06-07 05:30', ip:'192.168.1.1' },
  { id:6, actor:'Vikram Singh',  role:'Dept Head',       action:'allocated',   target:'Standing Desk SD-008',  dept:'Operations',  time:'6h ago',      date:'2024-06-06 17:12', ip:'192.168.1.22' },
  { id:7, actor:'Aditya Mehta',  role:'Employee',        action:'booked',      target:'Training Room iPad',    dept:'Engineering', time:'1d ago',      date:'2024-06-06 11:00', ip:'192.168.1.19' },
  { id:8, actor:'Admin',         role:'Admin',           action:'updated',     target:'Category: Laptops',     dept:'—',           time:'2d ago',      date:'2024-06-05 14:30', ip:'192.168.1.1' },
];

export default function AuditListPage() {
  const [search, setSearch]       = useState('');
  const [actionFilter, setAction] = useState('');
  const [expanded, setExpanded]   = useState(null);

  const filtered = LOGS.filter(l =>
    (l.actor.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase())) &&
    (!actionFilter || l.action === actionFilter)
  );

  const actions = [...new Set(LOGS.map(l => l.action))];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-indigo-600" /> Audit Log
          </h1>
          <p className="page-subtitle">Immutable record of all asset operations and changes</p>
        </div>
        <button className="btn-secondary gap-2 text-sm"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {['All',...actions].map(a => (
          <button key={a} onClick={()=>setAction(a==='All' ? '' : a)}
            className={`p-3 rounded-xl border text-xs font-bold transition-all capitalize text-center ${
              (actionFilter===a || (a==='All'&&!actionFilter))
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
            }`}>
            {a}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search actor or target..." className="input pl-10" />
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent" />

        <div className="space-y-2">
          {filtered.map((log, i) => {
            const Icon = ACTION_ICON[log.action] || Package;
            const colorClass = ACTION_COLOR[log.action] || ACTION_COLOR.updated;
            const isOpen = expanded === log.id;
            return (
              <div key={log.id} className="relative pl-12 card-reveal" style={{ animationDelay:`${i*50}ms` }}>
                {/* Timeline dot */}
                <div className={`absolute left-0 top-3.5 h-11 w-11 rounded-xl border flex items-center justify-center ${colorClass}`}>
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>

                <div className={`bg-white border rounded-2xl transition-all duration-200 overflow-hidden ${isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'}`}>
                  <button className="w-full flex items-center gap-4 p-4 text-left" onClick={()=>setExpanded(isOpen ? null : log.id)}>
                    {/* Actor avatar */}
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {log.actor === 'System' ? '⚙' : log.actor.split(' ').map(w=>w[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        <span className="font-bold text-slate-900">{log.actor}</span>
                        {' '}<span className={`font-semibold capitalize text-xs px-1.5 py-0.5 rounded-md border ${colorClass}`}>{log.action}</span>{' '}
                        <span className="font-medium">{log.target}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{log.dept} · {log.date}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="badge badge-neutral text-2xs hidden sm:flex">{log.role}</span>
                      <span className="text-xs text-slate-400">{log.time}</span>
                      <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <div className="grid sm:grid-cols-3 gap-3 pt-3">
                        <div><p className="text-2xs text-slate-400 uppercase tracking-wider font-bold mb-1">Actor</p><p className="text-xs font-semibold text-slate-700">{log.actor} <span className="text-slate-400">({log.role})</span></p></div>
                        <div><p className="text-2xs text-slate-400 uppercase tracking-wider font-bold mb-1">Timestamp</p><p className="text-xs font-mono text-slate-700">{log.date}</p></div>
                        <div><p className="text-2xs text-slate-400 uppercase tracking-wider font-bold mb-1">IP Address</p><p className="text-xs font-mono text-slate-700">{log.ip}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center text-slate-400">
          <ClipboardCheck className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No audit entries match your filters</p>
        </div>
      )}
    </div>
  );
}
